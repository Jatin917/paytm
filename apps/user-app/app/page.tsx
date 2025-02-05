"use client"
import { signIn, signOut, useSession } from "next-auth/react";
import { Appbar } from "@repo/ui/appbar";
import { useState } from "react";

export default function Page(): JSX.Element {
  const session = useSession();
  const [value, setValue] = useState(1);
  function newF(){
    console.log("i am clicked");
    setValue((prev)=>prev+1);
  }
  return (
   <div>
      <button className="border-black p-1 m-2" onClick={() => {
        newF()
        console.log('clicked');
        // signIn()
      }}>button</button>
      <p>{value}</p>
      <Appbar onSignin={signIn} onSignout={signOut} user={session.data?.user} />
   </div>
  );
}
