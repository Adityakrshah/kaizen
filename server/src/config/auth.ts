 import { betterAuth } from "better-auth";

import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { MongoClient } from "mongodb";

import dotenv from "dotenv";


dotenv.config();


const client = new MongoClient(process.env.MONGO_URI as string);

const db = client.db(); // 🚀 Driver handles pool automatically. No manual .connect() needed. 

export const auth = betterAuth({
    database: mongodbAdapter(db),
    
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000", 
    
    trustedOrigins: [
        "http://localhost:5173",
        "https://kaizen.adityakshah.com.np"
    ],

    // 🚀 ADD THIS BLOCK TO FIX THE 401 ERROR
    advanced: {
        defaultCookieAttributes: {
            sameSite: "none",
            secure: true,
        },
    },

    user: {
        deleteUser: { enabled: true },
    },

    emailAndPassword: {
        enabled: true,
        autoSignIn: true 
    },

    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    }
});