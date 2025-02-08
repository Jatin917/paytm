import express from 'express';
import {getBalance} from '../Controller/GetBalance/getBalance'
import { sendMoney } from '../Controller/SendMoney/sendMoney';

const Router = express.Router();

Router.get('/getBalance', getBalance);
Router.post('/sendmoney', sendMoney);

export default Router;
