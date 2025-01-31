import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        ORIGIN: z.string().url(),
        DATABASE_URL: z.string().url(),
        LANGCHAIN_API_KEY: z.string()
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string()
    },
    runtimeEnv: {
        ORIGIN: process.env.ORIGIN,
        DATABASE_URL: process.env.DATABASE_URL,
        LANGCHAIN_API_KEY: process.env.LANGCHAIN_API_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
});
