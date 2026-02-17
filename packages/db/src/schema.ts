import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { severityEnum, statusEnum } from "./enums";

export const incidents = sqliteTable(
  "incidents",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    service: text("service").notNull(),
    severity: text("severity", {
      enum: severityEnum,
    }).notNull(),
    status: text("status", {
      enum: statusEnum,
    }).notNull(),
    owner: text("owner"),
    summary: text("summary"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("status_idx").on(table.status),
    index("severity_idx").on(table.severity),
    index("service_idx").on(table.service),
    index("created_at_idx").on(table.createdAt),
  ],
);
