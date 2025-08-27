import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    plugins: [
    ],
    baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { 
    signIn, 
    signUp, 
    signOut,
    useSession,
    getSession 
} = authClient;


