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
    // This will automatically use your Render URL in production, but stay on localhost when you code locally!
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000", 
    
    // Whitelist both your local laptop and your live Netlify domain
    trustedOrigins: [
        "http://localhost:5173",
        "https://kaizen.adityakshah.com.np"
    ],

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