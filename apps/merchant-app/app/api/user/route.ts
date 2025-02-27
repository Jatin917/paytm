import { NextResponse } from "next/server"
import prisma from '@repo/db/client';



export const GET = async () => {
    return NextResponse.json({
        message: "hi there"
    })
}