import NextAuth from "next-auth"
import { AUTH_OPTIONS } from "../../../lib/auth"

const handler = NextAuth(AUTH_OPTIONS) as never;

export { handler as GET, handler as POST }