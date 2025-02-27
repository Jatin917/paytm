import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;  // ✅ Add `id` here
    }

    interface Session {
        user: User;  // ✅ Now `session.user` includes `id`
    }
}
