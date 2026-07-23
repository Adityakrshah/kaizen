import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // 🚀 Now dynamically matches the rest of your app!
    baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",

    fetchOptions: {
        credentials: "include",
    },
});

export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession, 
    updateUser, 
    deleteUser 
} = authClient;