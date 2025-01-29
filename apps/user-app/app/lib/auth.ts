/* eslint-disable turbo/no-undeclared-env-vars */
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import db from "@repo/db/client"


const githubId = process.env.GITHUB_ID || "";;
const githubSecret =  process.env.GITHUB_SECRET || "";

export const AUTH_OPTIONS = {
    providers:[
        CredentialsProvider({
            name:"Credential",
            credentials:{
                phone: { label: "Phone number", type: "text", placeholder: "1231231231" },
                password:{label:"Password", type:"password", placeholder:"Password"},
            },
            async authorize(credentials: any) {
                const hashedPassword = await bcrypt.hash(credentials.password, 10);
                const existingUser = await db.user.findFirst({
                    where:{
                        number:credentials.phone
                    }
                });
                if (existingUser) {
                    const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                    if (passwordValidation) {
                        return {
                            id: existingUser.id.toString(),
                            name: existingUser.name,
                            email: existingUser.number
                        }
                    }
                    return {
                        message:"Wrong Credential"
                    };
                }
                try {
                    const user = await db.user.create({
                        data:{
                            number:credentials.phone,
                            password:hashedPassword
                        }
                    });
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.number
                    }
                } catch (error) {
                    console.error((error as Error).message);
                    return {
                        message:"Try Again"
                    }
                }
            },
        }),
        GitHubProvider({
            clientId: githubId,
            clientSecret: githubSecret
          }),
        GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    })
    ]
}

