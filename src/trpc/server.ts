import "server-only";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createContext, t } from ".";
import { makeQueryClient } from "./query-client";
import { AppRouter, appRouter } from "./routers/app";

const getQueryClient = cache(() => makeQueryClient());
const caller = t.createCallerFactory(appRouter)(createContext);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(
    caller,
    getQueryClient
);
