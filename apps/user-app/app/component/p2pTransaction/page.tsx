"use client"

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { useState } from "react";

export const OnP2PTransactions = ({
  transactions,
}: {
  transactions: {
    time: Date;
    amount: number;
    // TODO: Can the type of `status` be more specific?
    status: string;
  }[];
}) => {
    const [index, setIndex] = useState(0);
    const transactionToBeShown = transactions.length - index*5>=6 ? transactions.slice(0+index*5, (index + 1) * 5) : transactions.slice(index*5);
    console.log("transactionToBeShown ", transactionToBeShown,transactions.length - index*5>=6, transactions, index, transactions.slice(0+index*5, (index + 1) * 5));
  if (!transactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">No Recent transactions</div>
      </Card>
    );
  }
  return (
    <Card title="Recent Transactions">
      <div className="pt-2">
        {transactionToBeShown.map((t) => (
          <div className="flex justify-between">
            <div>
              <div className="text-sm">Received INR</div>
              <div className="text-slate-600 text-xs">
                {t.time.toDateString()}
              </div>
            </div>
            <div className="flex flex-col justify-center">
              + Rs {t.amount / 100}
            </div>
            <div className="flex flex-col justify-center">{t.status}</div>
          </div>
        ))}
      </div>
      <button onClick={()=>setIndex((prev)=>prev-1)} className="bg-gray-800 text-white  disabled:opacity-90 disabled:cursor-not-allowed  hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" disabled={index===0}>Prev</button>
      <button onClick={()=>setIndex((prev)=>prev+1)} className="bg-gray-800 text-white  disabled:opacity-90 disabled:cursor-not-allowed  hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2" disabled={transactionToBeShown.length===0}>Next</button>
    </Card>
  );
};
