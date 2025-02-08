/* eslint-disable turbo/no-undeclared-env-vars */
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import db from "@repo/db/client"
import type { Session, User } from "next-auth";
import { JWT } from 'next-auth/jwt';

// Define your custom user type extending NextAuth's User
interface CustomUser extends User {
  id: string;
  phone?: string;
  name?: string | null;
}

export const AUTH_OPTIONS = {
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
            
            if (!passwordValid) return null;

            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number, // Consider if email should be phone number
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
            email: newUser.number,
            phone: newUser.number
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || ""
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
  ],
  // session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      return session;
    },
    async jwt({ token, user }: { user: User; token: JWT }) {
      // if (user) {
      //   token.id = user.id;
      // }
      // return token;
    },
  },
};