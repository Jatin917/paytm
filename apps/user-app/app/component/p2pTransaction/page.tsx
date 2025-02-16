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
    const transactionToBeShown = transactions.length - index*5>=6 ? transactions.slice(0+index*5, 5) : transactions.slice(index*5);
    console.log("transactionToBeShown ", transactionToBeShown, transactions, index, transactions.slice(0+index*5));
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
      <button onClick={()=>setIndex((prev)=>prev-1)} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={index===0}>Prev</button>
      <button onClick={()=>setIndex((prev)=>prev+1)} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={transactionToBeShown.length===0}>Next</button>
    </Card>
  );
};
