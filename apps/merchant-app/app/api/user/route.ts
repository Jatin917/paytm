import { NextResponse } from "next/server"
import prisma from '@repo/db/client';



export const GET = async () => {
    await prisma.user.create({
        data: {
            email: "jatin",
            name: "adsads",
            number:"123654689",
            password:"555555"
        }
    })
    return NextResponse.json({
        message: "hi there"
    })
}