import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        ORIGIN: z.string().url(),
        DATABASE_URL: z.string().url(),
        OPENAI_API_KEY: z.string(),
        LANGCHAIN_API_KEY: z.string(),
        LANGCHAIN_PROJECT: z.string(),
        LANGCHAIN_TRACING_V2: z.boolean({ coerce: true })
    },
    client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
        NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string()
    },
    runtimeEnv: {
        ORIGIN: process.env.ORIGIN,
        DATABASE_URL: process.env.DATABASE_URL,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        LANGCHAIN_API_KEY: process.env.LANGCHAIN_API_KEY,
        LANGCHAIN_PROJECT: process.env.LANGCHAIN_PROJECT,
        LANGCHAIN_TRACING_V2: process.env.LANGCHAIN_TRACING_V2,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
});
