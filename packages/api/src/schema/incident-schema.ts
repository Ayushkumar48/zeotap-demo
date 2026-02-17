import { severityEnum, statusEnum } from "@zeotap-demo/db";
import z from "zod";

export const postIncidentSchema = z.object({
  title: z.string({ error: "Title is required" }),
  service: z.string({ error: "Service is required" }),
  severity: z.enum(severityEnum, { error: "Severity is required" }),
  status: z.enum(statusEnum, { error: "Status is required" }),
  owner: z.string().nullable(),
  summary: z.string().nullable(),
});

export const getIncidentsSchema = z.object({
  status: z.enum(statusEnum).optional(),
  severity: z.enum(severityEnum).optional(),
  service: z.string().optional(),
  owner: z.string().optional(),
  search: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(10),
});
