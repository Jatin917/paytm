import { getServerSession } from "next-auth"
import { NextResponse } from "next/server";
import { AUTH_OPTIONS } from "../../lib/auth";

export const GET = async () => {
    const session = await getServerSession(AUTH_OPTIONS);
    if (session && session.user) {
        return NextResponse.json({
            user: session.user
        })
    }
    return NextResponse.json({
        message: "You are not logged in"
    }, {
        status: 403
    })
}