import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


interface reqTypes {
    userId:string,
    amount:string,
    recieverId:string
}
export async function POST(req:NextRequest, res:NextResponse){
    try {
        const user : reqTypes =  req.body;
        // console.log(userId, amount, recieverId);
        const response = await axios.post('http://localhost:3003/api-hdfc/sendmoney/',{
            user
        })
    } catch (error) {
        return res;
    }
}

export async function GET() {
  try {
    console.log("send money server"); // Logs when the route is hit
    return NextResponse.json({ message: "Send Money" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
