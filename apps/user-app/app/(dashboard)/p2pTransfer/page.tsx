import { SendMoney } from "../../component/SendMoney/SendMoney";

export default async function(){
    return <div className="w-full h-full flex items-center justify-center">
        <div className="w-80">
            <SendMoney/>
        </div>
    </div>
}