import { getServerSession } from "next-auth";
import { SendMoney } from "../../component/SendMoney/SendMoney";
import { AUTH_OPTIONS } from "../../lib/auth";
import prisma from "../../../../../packages/db/src";
import { OnP2PTransactions } from "../../component/p2pTransaction/p2pTransaction";

interface userTypes {
    id: string | null
    name?: string | null;
    email?: string | null;
    image?: string | null;
}
type Transaction = {
    timestamp: Date;  // Or Date if applicable
    amount: number;
    status: string;
  };

async function getOnp2pTransactions():Promise<Transaction[]> {
    const session = await getServerSession(AUTH_OPTIONS);
        const txns = await prisma.p2pTransfer.findMany({
            where: {
                fromUserId: Number((session?.user as userTypes)?.id) || undefined
            }
        });
        return txns.map((t:Transaction) => ({
            timestamp: t.timestamp,
            amount: t.amount,
            status: t.status,
        }))
}
export default async function(){
    const transactions = await getOnp2pTransactions();
    return <div className="w-full h-full flex items-center justify-center">
        <div className="w-[400px]">
            <SendMoney/>
        </div>
        <div className="pt-4 w-[50%] ml-40">
            <OnP2PTransactions transactions={transactions} />
        </div>
    </div>
}