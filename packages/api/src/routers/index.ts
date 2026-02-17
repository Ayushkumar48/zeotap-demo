import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { incidentRouter } from "./incident";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  incident: incidentRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
