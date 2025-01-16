import 'server-only';

import { createContext, t } from ".";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from 'react';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/app';
import { AppRouter } from './routers/app';

const getQueryClient = cache(() => makeQueryClient());
const caller = t.createCallerFactory(appRouter)(createContext);

export const { trpc, HydrateClient } = createHydrationHelpers<AppRouter>(caller, getQueryClient);
