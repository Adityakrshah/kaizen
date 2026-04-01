// import { betterAuth } from "better-auth";
// import { mongodbAdapter } from "better-auth/adapters/mongodb";
// import { MongoClient } from "mongodb";
// import dotenv from "dotenv";

// dotenv.config(); 

// const mongoUri = process.env.MONGO_URI as string;
// if (!mongoUri) throw new Error("MONGO_URI is missing in .env");

// // 🚀 Create the client but DON'T manually await .connect() here.
// // The driver handles connecting automatically when the first query runs.
// const client = new MongoClient(mongoUri);
// const db = client.db(); 

// export const auth = betterAuth({
//     // 🟢 Just pass the 'db' object. The adapter knows how to use it.
//     database: mongodbAdapter(db), 
    
//     user: {
//         deleteUser: { enabled: true },
//     },
    
//     // 🚀 THESE MUST BE EXACT
//     baseURL: "http://localhost:5000", 
//     trustedOrigins: ["http://localhost:5173"], 
    
//     emailAndPassword: {
//         enabled: true,
//     },
    
//     socialProviders: {
//         github: {
//             clientId: process.env.GITHUB_CLIENT_ID as string,
//             clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//         },
//         google: {
//             clientId: process.env.GOOGLE_CLIENT_ID as string,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//         }
//     }
// });
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db(); // 🚀 Driver handles pool automatically. No manual .connect() needed.

export const auth = betterAuth({
    database: mongodbAdapter(db),
    
    // 🔐 Security & Routing
    baseURL: "http://localhost:5000", 
    trustedOrigins: ["http://localhost:5173"],

    // 👤 User Management
    user: {
        deleteUser: { enabled: true },
    },

    // 📧 Manual Auth
    emailAndPassword: {
        enabled: true,
        autoSignIn: true // Automatically logs in after signup
    },

    // 🌐 Social Auth
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