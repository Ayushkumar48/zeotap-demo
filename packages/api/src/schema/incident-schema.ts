import { severityEnum, statusEnum } from "@zeotap-demo/db/enums";
import z from "zod";

export const postIncidentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  service: z.string().min(1, "Service is required"),
  severity: z.enum(severityEnum, { error: "Severity is required" }),
  status: z.enum(statusEnum, { error: "Status is required" }),
  owner: z.string().nullable(),
  summary: z.string().nullable(),
  createdAt: z.coerce.date().optional(),
});

export const getIncidentsSchema = z.object({
  status: z.enum(statusEnum).optional(),
  severity: z.enum(severityEnum).optional(),
  service: z.string().optional(),
  owner: z.string().optional(),
  search: z.string().optional(),
  sort: z
    .enum([
      "id",
      "title",
      "service",
      "severity",
      "status",
      "owner",
      "summary",
      "createdAt",
      "updatedAt",
    ])
    .optional(),
  order: z.enum(["asc", "desc"]).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.number().default(1),
  pageSize: z.number().default(10),
});
