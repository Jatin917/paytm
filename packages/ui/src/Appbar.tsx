import { Button } from "./button";
import Image from 'next/image';
import logo from '../public/assets/zapPay-icons/png/logo-grayscale.png'

interface AppbarProps {
    user?: {
        name?: string | null;
    },
    // TODO: can u figure out what the type should be here?
    onSignin: any,
    onSignout: any
}

export const Appbar = ({
    user,
    onSignin,
    onSignout
}: AppbarProps) => {
    return <div className="flex justify-between border-b px-4 h-[80px]">
        <div className="text-lg flex flex-col justify-center">
        <Image src={logo} alt="Logo" width={100} height={100} />
        </div>
        <div className="flex flex-col justify-center pt-2">
            <Button onClick={user ? onSignout : onSignin}>{user ? "Logout" : "Login"}</Button>
        </div>
    </div>
}