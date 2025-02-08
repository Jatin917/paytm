import express from 'express'
import dotenv from 'dotenv'
import Router from './Router/router';
dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use('/api-hdfc', Router);


app.listen(PORT, ()=>
    console.log("Bank Server is running on port", PORT)
)