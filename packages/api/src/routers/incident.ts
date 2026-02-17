import { db } from "@zeotap-demo/db";
import { publicProcedure } from "../index";
import { incidents } from "@zeotap-demo/db/schema";
import { randomUUIDv7 } from "bun";
import { and, eq, like, gte, lte, desc } from "drizzle-orm";
import {
  getIncidentsSchema,
  postIncidentSchema,
} from "../schema/incident-schema";
import z from "zod";
export const incidentRouter = {
  getAllWithPaginationAndFilter: publicProcedure
    .input(getIncidentsSchema)
    .handler(async ({ input }) => {
      const {
        status,
        severity,
        service,
        owner,
        search,
        from,
        to,
        page,
        pageSize,
      } = input;

      const filters = [];

      if (status) filters.push(eq(incidents.status, status));
      if (severity) filters.push(eq(incidents.severity, severity));
      if (service) filters.push(eq(incidents.service, service));
      if (owner) filters.push(eq(incidents.owner, owner));
      if (search) filters.push(like(incidents.title, `%${search}%`));
      if (from) filters.push(gte(incidents.createdAt, from));
      if (to) filters.push(lte(incidents.createdAt, to));

      return db
        .select()
        .from(incidents)
        .where(filters.length ? and(...filters) : undefined)
        .orderBy(desc(incidents.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);
    }),
  createIncident: publicProcedure
    .input(postIncidentSchema)
    .handler(async ({ input }) => {
      return await db
        .insert(incidents)
        .values({ ...input, id: randomUUIDv7() })
        .returning();
    }),
  deleteIncident: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      return await db.delete(incidents).where(eq(incidents.id, input.id));
    }),
  updateIncident: publicProcedure
    .input(z.object({ id: z.string(), ...postIncidentSchema.shape }))
    .handler(async ({ input }) => {
      return await db
        .update(incidents)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(incidents.id, input.id))
        .returning();
    }),
  getIncident: publicProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const [incident] = await db
        .select()
        .from(incidents)
        .where(eq(incidents.id, input.id));

      return incident;
    }),
};
