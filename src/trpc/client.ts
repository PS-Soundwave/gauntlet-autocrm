import { isServer, QueryClient } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { makeQueryClient } from "./query-client";
import { AppRouter } from "./routers/app";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | null = null;

export const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient();
    }

    browserQueryClient ??= makeQueryClient();

    return browserQueryClient;
};
