"use client"

import { Button } from "@repo/ui/button"
import { Card } from "@repo/ui/card"
import { TextInput } from "@repo/ui/textinput"


export const SendMoney = () => {
    return <Card title="Send">
        <div className="">
            <TextInput label={"Number"} placeholder={"9874563210"} onChange={()=> {}}/>
            <TextInput label={"Amount"} placeholder={"100"} onChange={()=> {}}/>
            <div className="flex justify-center pt-4">
                <Button onClick={() => {
                }}>
                Send Money
                </Button>
            </div>
        </div>
    </Card>
}