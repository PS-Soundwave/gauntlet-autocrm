import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "./routers/app";
import { isServer } from "@tanstack/react-query";
import { QueryClient } from "@tanstack/react-query";
import { makeQueryClient } from "./query-client";

export const trpc = createTRPCReact<AppRouter>();

let browserQueryClient: QueryClient | null = null;

export const getQueryClient = () => {
    if (isServer) {
        return makeQueryClient();
    }
    
    browserQueryClient ??= makeQueryClient();

    return browserQueryClient;
}   
