"use client";

import { isServer, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { splitLink, unstable_httpBatchStreamLink, unstable_httpSubscriptionLink } from "@trpc/client";
import { env } from "@/env";
import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@/trpc/routers/app";
import { makeQueryClient } from "@/trpc/query-client";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | null = null;

export const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient();
    }
    
    browserQueryClient ??= makeQueryClient();

    return browserQueryClient;
}  

export default function TRPCProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    const [trpcClient] = useState(() => {
        return trpc.createClient({
            links: [
                splitLink({
                    condition: (op) => op.type === 'subscription',
                    true: unstable_httpSubscriptionLink({
                        url: '/api/trpc'
                    }),
                    false: unstable_httpBatchStreamLink({
                        url: typeof window !== 'undefined' ? '/api/trpc' : `${env.ORIGIN}/api/trpc`
                    })
                })
            ],
        });
    });

    return <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </trpc.Provider>;
}
