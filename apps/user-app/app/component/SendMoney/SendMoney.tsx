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
    const sendMoneyHandler = async () =>{
        try {
            const url = process.env.NEXTAUTH_URL || 'http://localhost:3001';
            console.log("url is ", url)
            const response = await axios.post(`${url}/api/SendMoney`, {
                userId:session?.data?.user?.id,
                amount:amount,
                recieverId:number
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
                    sendMoneyHandler();
                    await createP2Pransaction(parseInt(amount), number);
                }}>
                Send Money
                </Button>
            </div>
        </div>
    </Card>
}