import prisma from "../../../../../packages/db/src";
import BalanceCard from "../../component/BalanceCard/BalanceCard";
import { getServerSession } from "next-auth";
import { AUTH_OPTIONS } from "../../lib/auth";
import AddMoney  from "../../component/AddMoney/AddMoney";
import { OnRampTransactions } from "../../component/onRampTransaction/onRampTransaction";

interface userTypes {
    id: string | null
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

type Transaction = {
    startTime: Date;  // Or Date if applicable
    amount: number;
    status: string;
    provider:string;
  };

async function getBalance() {
    const session = await getServerSession(AUTH_OPTIONS);
    // console.log("user id", session?.user);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number((session?.user as userTypes)?.id) || undefined
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0
    }
}

async function getOnRampTransactions() {
    const session = await getServerSession(AUTH_OPTIONS);
    const txns = await prisma.onRampTransaction.findMany({
        where: {
            userId: Number((session?.user as userTypes)?.id) || undefined
        }
    });
    return txns.map((t:Transaction) => ({
        time: t.startTime,
        amount: t.amount,
        status: t.status,
        provider: t.provider
    }))
}

export default async function Page() {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return <div className="w-full">
        <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
            Transfer
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                <AddMoney />
            </div>
            <div>
                <BalanceCard amount={balance.amount} locked={balance.locked} />
                <div className="pt-4">
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    </div>
}