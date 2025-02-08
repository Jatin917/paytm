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
        transactions.forEach((t)=>{
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
        // webhook user ko update krna hain ki money send ho gya hain which then notify the webhook of merchant to add money and notification
        const {userId, amount, recieverId} = req.body;
        const result = await prisma?.$transaction(async(tx)=>{
            const amount = await getTodayTransactions(tx);
            if(amount && amount>25000){
                throw new Error("Todays limit Exceded, Please try again tommorow")
            }
            const senderBalance = await tx.balance.findFirst({
                where:{
                    userId:userId
                }
            });
            if(!senderBalance){
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
              return {
                message:"Successfully Sent!!!"
              }
        });
        return res.status(200).json(result);
    } catch (error) {
        if((error as Error).message==="Insuffiecient Funds"){
            return res.status(404).json({message:(error as Error).message})
        }
        return res.status(500).json({message:(error as Error).message});
    }
}