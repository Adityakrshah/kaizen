// import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//     baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000"
// });

// export const { signIn, signUp, signOut, useSession } = authClient;

import { createAuthClient } from "better-auth/react";

/**
 * 🚀 Kaizen Auth Client
 * This client handles all authentication logic between the React frontend 
 * and the Express backend.
 */
export const authClient = createAuthClient({
    // 1. Point to your backend port (5000)
    // Using the environment variable first, falling back to localhost
    baseURL: import.meta.env.VITE_SERVER_URL || "http://localhost:5000",

    // 2. Global Fetch Configuration
    // This ensures that login cookies are ALWAYS sent with every request
    fetchOptions: {
        credentials: "include",
    },
});

// 3. Export specific hooks for clean usage in components
// usage: const { data: session } = useSession();
export const { 
    signIn, 
    signUp, 
    signOut, 
    useSession, 
    updateUser, 
    deleteUser 
} = authClient;