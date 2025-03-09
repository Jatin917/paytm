import axios from "axios";
import { Erica_One } from "next/font/google";
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
        console.log("bank-server", bank_server);
        const response = await axios.post(`${bank_server}/api-hdfc/sendmoney/`,{
          user
        });
        console.log("response is", response);
        if(response.status!==200){
          return NextResponse.json({message:response?.data}, {status:404});
        }
        return NextResponse.json({message:(response?.data)}, {status:response.status});
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
