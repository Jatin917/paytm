import prisma from '@repo/db/client';

export const getBalance = async (req:any, res:any) => {
    try {
        const userId = Number(req.query.id);
        if (!userId) {
            return res.status(400).json({ message: "Bad Request" });
        }

        const response = await prisma.balance.findFirst({ 
            where: {
                userId: userId
            }
        });

        if (!response) {
            return res.status(404).json({ amount:0 });
        }

        return res.status(200).json({ amount: response.amount });
    } catch (error) {
        console.error("Error fetching balance:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}