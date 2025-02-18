import prisma from '@repo/db/client';
import axios from 'axios';
import { subHours, startOfDay, endOfDay } from 'date-fns';

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

interface webhookPropsTypes {
  userId:string,
  amount:number,
  token:number
}

const sentRequestToWebhook = async(userId: webhookPropsTypes['userId'], amount: webhookPropsTypes['amount'], token : webhookPropsTypes['token'])=> {
    try {
        await axios.post(`${process.env.SERVER_WEBHOOK}/hdfcWebhookOnP2P`,{
            user_identifier:userId,
            amount:amount,
            token:token
        });
        return;
    } catch (error) {
        console.log((error as Error).message);
        return;
    }
}

export const sendMoney = async (req: any, res: any) => {
    try {
      // webhook user ko update krna hain ki money send ho gya hain which then notify the webhook of merchant to add money and notification
      const { userId, amount, recieverId, token } = req.body.user;
  
      // Ensure amount is a valid number
      const parsedAmount = Number(amount)*100;
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount value" });
      }
  
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
  
        console.log(senderBalance);
  
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
  
      // 6️⃣ ✅ Send Webhook Request after Transaction Success
        await sentRequestToWebhook(userId, parsedAmount, token);
  
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error:", error);
  
      // Ensure proper error message is returned
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      return res.status(errorMessage.includes("Insufficient Funds") ? 400 : 500).json({ message: errorMessage });
    }
  };
  