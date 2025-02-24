import express from 'express';
import {getBalance} from '../Controller/GetBalance/getBalance'
import { sendMoney } from '../Controller/SendMoney/sendMoney';
import { limiter } from '../Middleware/rateLimiter';

const Router = express.Router();

Router.get('/getBalance', getBalance);
Router.post('/sendmoney',limiter, sendMoney);

export default Router;
