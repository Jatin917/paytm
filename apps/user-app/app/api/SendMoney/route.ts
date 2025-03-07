import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


interface reqTypes {
    userId:string,
    amount:string,
    recieverId:string
}
export async function POST(req:NextRequest){
    try {
        const user =  await req.json();
        console.log("user body is: ",user);
        // console.log(userId, amount, recieverId);
        const bank_server = process.env.BANK_SERVER;
        console.log("bank-webhook", bank_server);
        const response = await axios.post(`${bank_server}/api-hdfc/sendmoney/`,{
          user
        });
        if(!response){
          return NextResponse.json({message:"Please Try Again Some Time"}, {status:404});
        }
        return NextResponse.json({message:(response?.data?.message || "Failed")}, {status:200});
    } catch (error) {
        return NextResponse.json({message:(error as Error).message});
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
