import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from "bcryptjs";
import db from "../../../../packages/db/src"
import type { Account, NextAuthOptions, User, Session } from "next-auth";

interface CustomUser extends User {
  id: string;
  phone?: string;
  name?: string | null;
}

export const AUTH_OPTIONS : NextAuthOptions  = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone number", type: "text", placeholder: "1231231231" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        try {
          const existingUser = await db.user.findFirst({
            where: { number: credentials.phone }
          });
          if (existingUser) {
            const passwordValid = await bcrypt.compare(
              credentials.password,
              existingUser.password
            );
            console.log(existingUser, "password valid ", credentials.password, existingUser.password, passwordValid)
            if (!passwordValid) return null;
            console.log("authorization success");
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.email || existingUser.number || "", // Ensure email is always a string
              phone: existingUser.number
            };
          }

          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = await db.user.create({
            data: {
              number: credentials.phone,
              password: hashedPassword
            }
          });

          return {
            id: newUser.id.toString(),
            name: null,
            email: newUser.email || newUser.number || "",
            phone: newUser.number
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    })
  ],
  session: { strategy: "jwt" as const }, // ✅ Fix 1: Ensure type is `"jwt"`
  callbacks: {
    async jwt({ token, user }: { token: any; user?: CustomUser }) { // ✅ Fix 3: Proper typing
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email || ""; // Ensure email is always a string
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) { // ✅ Fix 3
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email || ""
      };
      return session;
    },
    async signIn({ user, account, profile, email, credentials }: {  
      user: User | null;  
      account: Account | null;  
      profile?: Record<string, any>;  
      email?: { verificationRequest?: boolean };  
      credentials?: Record<string, any>;  
    }) {  
      if (!user || !user.email) return false;  // Ensure user and email exist  
      return true;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};
