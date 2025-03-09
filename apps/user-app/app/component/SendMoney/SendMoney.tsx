"use client"

import { Button } from "@repo/ui/button"
import { Card } from "@repo/ui/card"
import { TextInput } from "@repo/ui/textinput"
import axios from "axios"
import { useSession } from "next-auth/react"
import {useState} from 'react'
import { createP2Pransaction } from "../../lib/actions/createP2PTransaction"

export const SendMoney = () => {
    const [amount, setAmount] = useState('');
    const [number, setNumber] = useState('');
    const session = useSession();
    const sendMoneyHandler = async (token:string) =>{
        console.log("bank ko req ja rhi hain");
        try {
            const url = process.env.NEXTAUTH_URL;
            console.log("url is ", url)
            const response = await axios.post(`/api/SendMoney`, {
                userId:session?.data?.user?.id,
                amount:amount,
                recieverId:number,
                token
            });
            if(!response){
                throw new Error("No respones");
            }
            console.log(response);
        } catch (error) {
            console.log(error);
        }
    }
    return <Card title="Send">
        <div className="">
            <TextInput label={"Number"} placeholder={"9874563210"} onChange={(e)=>setNumber(e)}/>
            <TextInput label={"Amount"} placeholder={"100"} onChange={(e)=>setAmount(e)}/>
            <div className="flex justify-center pt-4">
                <Button onClick={async() => {
                    const response = await createP2Pransaction(parseInt(amount), number);
                    console.log("reponse of create p2p transaction", response);
                    if(!response || !response.token) return {message:"no transaction was made"};
                    await sendMoneyHandler(response?.token);
                }}>
                Send Money
                </Button>
            </div>
        </div>
    </Card>
}