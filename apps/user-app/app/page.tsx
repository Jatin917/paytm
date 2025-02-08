import { getServerSession } from "next-auth";
import { redirect } from 'next/navigation'
import { AUTH_OPTIONS } from "./lib/auth";

export default async function Page() {
  const session = await getServerSession(AUTH_OPTIONS);
  console.log("session is ", session);
  if (session?.user) {
    return redirect('/dashboard')
  } else {
    return redirect('/api/auth/signin')
  }
}