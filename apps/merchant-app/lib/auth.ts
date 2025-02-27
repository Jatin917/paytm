import GoogleProvider from "next-auth/providers/google";
import { AuthOptions } from "next-auth";
import db from "@repo/db/client";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log("hi signin");

      if (!user?.email) return false; // Ensure email exists

      await db.merchant.upsert({
        where: { email: user.email },
        create: {
          email: user.email,
          name: user.name || "Unknown", // Ensure name is provided
          auth_type: account?.provider === "google" ? "Google" : "Github",
        },
        update: {
          name: user.name || "Unknown",
          auth_type: account?.provider === "google" ? "Google" : "Github",
        },
      });

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "secret",
};
