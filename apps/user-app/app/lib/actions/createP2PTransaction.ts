"use server";

import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { AUTH_OPTIONS } from "../auth";

export async function createP2Pransaction(amount: number, recieverNumber: string) {
    // Ideally the token should come from the banking provider (hdfc/axis)
    const session = await getServerSession(AUTH_OPTIONS);
    if (!session?.user || !session.user?.id) {
        return {
            message: "Unauthenticated request"
        }
    }
    const token = (Math.random() * 1000).toString();
    const reciever = await prisma.user.findFirst({where:{number:recieverNumber}});
    if(!reciever) return {message:"Number is not registered on this app"};
    await prisma.p2pTransfer.create({
        data: {
            status: "Processing",
            timestamp: new Date(),
            fromUserId: Number(session?.user?.id),
            toUserId:Number(reciever.id),
            amount: amount * 100,
            token
        }
    });

    return {
        message: "Done"
    }
}
