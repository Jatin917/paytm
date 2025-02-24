import prisma from '@repo/db/client';
import axios from 'axios';
import { subHours, startOfDay, endOfDay } from 'date-fns';
import { createClient } from 'redis';
import { getRedisClient, insertIntoRedis } from '../Redis';
import { paymentStatus, webhookPropsTypes } from '../../TypeDefinition';

const getTodayTransactions = async (tx:any) => {
    try {
        // Get the current date in UTC (since the server may be in UTC)
        const nowUtc = new Date();

        // Convert to IST by subtracting 5 hours 30 minutes
        const startUtc = subHours(startOfDay(nowUtc), 5.5); // 00:00 IST in UTC
        const endUtc = subHours(endOfDay(nowUtc), 5.5); // 23:59 IST in UTC

        console.log("Fetching transactions from", startUtc, "to", endUtc);

        // Fetch transactions within this time range
        const transactions = await tx.p2pTransfer.findMany({
            where: {
                timestamp: {
                    gte: startUtc, // Greater than or equal to start of the day
                    lte: endUtc, // Less than or equal to end of the day
                },
            },
        });
        let amount = 0;
        if(!transactions) return amount;
        transactions.forEach((t:any)=>{
            amount+=t.amount;
        })
        return amount
    } catch (error) {
        console.log((error as Error).message)
        return 0;
    }
};

const sentRequestToWebhook = async(userId: webhookPropsTypes['userId'], amount: webhookPropsTypes['amount'], token : webhookPropsTypes['token'], message:string)=> {
    try {
        await axios.post(`${process.env.SERVER_WEBHOOK}/hdfcWebhookOnP2P`,{
            user_identifier:userId,
            amount:amount,
            token:token, 
            message:message
        });
        return;
    } catch (error) {
        console.log((error as Error).message);
        return;
    }
}

const sendMoneyFunction = async (userId:string, parsedAmount:number, recieverId:string, token:string) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ ✅ Check Today's Transaction Limit (Max ₹25,000)
      const amountTodays = await getTodayTransactions(tx);
      console.log("amountTodays transaction");
      // as bank main money paise main store hain and we are sending as rupees
      if (amountTodays + parsedAmount > 2500000) {
        console.log("amountTodays");
        throw new Error("Today's limit exceeded, please try again tomorrow");
      }

      console.log("Transaction ", userId, parsedAmount, recieverId);

      // 2️⃣ ✅ Get Sender's Balance
      const senderBalance = await tx.balance.findFirst({
        where: { userId: parseInt(userId) },
      });


      if (!senderBalance || senderBalance.amount < parsedAmount) {
        throw new Error("Insufficient Funds");
      }

      // 3️⃣ ✅ Deduct Money from Sender
      const sender = await tx.balance.update({
        data: {
          amount: {
            decrement: parsedAmount, // Fix: Using `parsedAmount` to ensure correct type
          },
        },
        where: { userId: parseInt(userId) },
      });

      console.log("Sender Balance After:", sender.amount);
      if (sender.amount < 0) {
        throw new Error("Insufficient Funds");
      }

      // 4️⃣ ✅ Find Recipient ID
      const recipientId = await tx.user.findFirst({ where: { number: recieverId } });
      if (!recipientId) throw new Error("Invalid Number!!!");

      const recipientBalance = await tx.balance.findFirst({ where: { userId: recipientId.id } });
      if (!recipientBalance) {
        throw new Error("Receiver account does not exist");
      }

      // 5️⃣ ✅ Add Money to Recipient
      const recipient = await tx.balance.update({
        data: {
          amount: {
            increment: parsedAmount, // Fix: Using `parsedAmount` for consistency
          },
        },
        where: { userId: recipientId.id },
      });

      console.log("Recipient Balance After:", recipient.amount);

      if (!recipient) {
        throw new Error("Problem at receiver end");
      }

      // yhaa prr bank webhook server ko request bhejenga that person ne jo amount bheja hain wo successfully sent ho gya hain , what if webhook is down???
      return { message: "Successfully Sent!!!" };
    }, { maxWait: 5000, timeout: 10000 });
    return {status:200, message:String(paymentStatus.Success), data:result};
  } catch (error) {
    return {status:500, message:String(paymentStatus.Failure)};
  }
}

export const sendMoney = async (req: any, res: any) => {
  console.log("client bn rha hain")
  const client = await getRedisClient();
  console.log("client bn gya hain")
    try {
      // webhook user ko update krna hain ki money send ho gya hain which then notify the webhook of merchant to add money and notification
      const { userId, amount, recieverId, token } = req.body.user;
      if(!token) return res.status(401).json({message:"missing field"});
      await insertIntoRedis(token);
      // this function will handle the db process
      await sendMoneyFunction(userId, amount, recieverId, token);
      // Ensure amount is a valid number
      const parsedAmount = Number(amount)*100;
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount value" });
      }
      let response;
      for(let i = 0;i<=5;i++){
        const maxRetry = await client?.hGet(token, "maxRetry") || i;
        console.log("matRetyr ", maxRetry);
        if(Number(maxRetry)-1>0){
          response = await sendMoneyFunction(userId, parsedAmount, recieverId, token);
          if(response.status===500){
            await client?.hSet(token, "maxRetry", Number(maxRetry)-1);
          }
          else{
            await client?.del(token);
            break;
          }
        }
        else{
          await client?.del(token);
          break;
        }
      }
      // 6️⃣ ✅ Send Webhook Request after Transaction Success
      console.log("response of money sent is ", response)
      await sentRequestToWebhook(userId, parsedAmount, token, (response?.message || "Failed"));
      return res.status(200).json(response?.data);
    } catch (error) {
      console.error("Error:", error);
  
      // Ensure proper error message is returned
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      return res.status(errorMessage.includes("Insufficient Funds") ? 400 : 500).json({ message: errorMessage });
    }
  };
  