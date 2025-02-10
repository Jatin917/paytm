import prisma from '@repo/db/client';


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
        const transactions = await tx.p2pTransaction.findMany({
            where: {
                startTime: {
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


export const sendMoney = async(req:any, res:any) =>{
    try {
        // console.log("sendMoney");
        // webhook user ko update krna hain ki money send ho gya hain which then notify the webhook of merchant to add money and notification
        const {userId, amount, recieverId} = req.body.user;
        // console.log(userId, amount, recieverId);
        const result = await prisma?.$transaction(async(tx)=>{
            const amountTodays = await getTodayTransactions(tx);
            console.log("amountTodays transaction");
            if(amountTodays + amount>25000){
                console.log("amountTodays");
                throw new Error("Todays limit Exceded, Please try again tommorow")
            }
            console.log("Transaction ",  userId, amount, recieverId);
            const senderBalance = await tx.balance.findFirst({
                where:{
                    userId:userId
                }
            });
            console.log(senderBalance);
            
            if(!senderBalance || senderBalance.amount<amount){
                throw new Error("Insuffiecient Funds");
            }
            const sender = await tx.balance.update({
                data:{
                    amount:{
                        decrement:amount
                    }
                },
                where:{
                    userId:userId
                }
            });
            if(!sender || sender.amount<0){
                throw new Error("Insuffiecient Funds");
            }
            const recipientBalance = await tx.balance.findFirst({ where: { userId: recieverId } });
            if (!recipientBalance) {
                throw new Error("Receiver account does not exist");
            }
            const recipient = await tx.balance.update({
                data: {
                  amount: {
                    increment: amount,
                  },
                },
                where: {
                  userId: recieverId,
                },
              })
              if(!recipient){
                throw new Error("Problem at receiver end");
              }
              await tx.p2pTransaction.create({
                data:{
                    status:'Success',
                    amount:amount,
                    userId:userId,
                    startTime: new Date().toISOString(),
                    token:crypto.randomUUID()
                }
              })
              return {
                message:"Successfully Sent!!!"
              }
        });
        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        // Ensure proper error message is returned
        const errorMessage = error instanceof Error ? error.message : "Something went wrong";

        return res.status(errorMessage.includes("Insufficient Funds") ? 400 : 500).json({ message: errorMessage });
    }
}