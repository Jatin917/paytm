import prisma from '@repo/db/client';

export const sendMoney = async(req:any, res:any) =>{
    try {
        const {userId, amount, recieverId} = req.body;
        const result = await prisma?.$transaction(async(tx)=>{
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