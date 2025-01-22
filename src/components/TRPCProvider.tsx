"use client";

import {
    isServer,
    QueryClient,
    QueryClientProvider
} from "@tanstack/react-query";
import {
    splitLink,
    unstable_httpBatchStreamLink,
    unstable_httpSubscriptionLink
} from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { env } from "@/env";
import { makeQueryClient } from "@/trpc/query-client";
import { AppRouter } from "@/trpc/routers/app";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | null = null;

export const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient();
    }

    browserQueryClient ??= makeQueryClient();

    return browserQueryClient;
};

export default function TRPCProvider({
    children
}: {
    children: React.ReactNode;
}) {
    const queryClient = getQueryClient();

    const [trpcClient] = useState(() => {
        return trpc.createClient({
            links: [
                splitLink({
                    condition: (op) => op.type === "subscription",
                    true: unstable_httpSubscriptionLink({
                        url: "/api/trpc",
                        transformer: superjson
                    }),
                    false: unstable_httpBatchStreamLink({
                        url:
                            typeof window !== "undefined"
                                ? "/api/trpc"
                                : `${env.ORIGIN}/api/trpc`,
                        transformer: superjson
                    })
                })
            ]
        });
    });

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    );
}
