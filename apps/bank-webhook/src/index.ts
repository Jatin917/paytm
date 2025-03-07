import express from "express";
import db from "@repo/db/client";
import dotenv from 'dotenv'

dotenv.config();
const app = express();

app.use(express.json())

app.get("/", (req, res)=>{
    res.send("<h1>Backend chal rha hain!!!</h1>");
})

enum OnRampStatus {
    Success,
    Failure,
    Processing
  }

app.post("/hdfcWebhookOnRamp", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };

    try {
        await db.$transaction([
            db.balance.upsert({
                where: {
                    userId: Number(paymentInformation.userId)
                },
                update: {
                    amount: {
                        increment: Number(paymentInformation.amount)
                    }
                },
                create: {
                    userId: Number(paymentInformation.userId),
                    amount: Number(paymentInformation.amount), // Initial amount,
                    locked:0
                }
            }),
            db.onRampTransaction.updateMany({
                where: {
                    token: paymentInformation.token
                }, 
                data: {
                    status: "Success",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch(e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }

})
app.post("/hdfcWebhookOnP2P", async (req, res) => {
    //TODO: Add zod validation here?
    //TODO: HDFC bank should ideally send us a secret so we know this is sent by them
    const paymentInformation: {
        token: string;
        userId: string;
        amount: string, 
        message:string
    } = {
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount,
        message:req.body.message
    };
    const message = paymentInformation.message;
    console.log("message in bank webhook is ", message);
    try {
        await db.$transaction([
            db.p2pTransfer.updateMany({
                where: {
                    token: paymentInformation.token
                }, 
                data: {
                    status:message==="Success"? "Success":"Failure",
                }
            })
        ]);

        res.json({
            message: "Captured"
        })
    } catch(e) {
        console.error(e);
        res.status(411).json({
            message: "Error while processing webhook"
        })
    }

})
const PORT = process.env.PORT
app.listen(PORT, ()=> console.log("webhook is running on port: ", PORT));