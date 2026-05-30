import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const file = pgTable("file", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  bucket: text("bucket").notNull(),
  key: text("key").notNull().unique(),
  url: text("url").notNull(),
  uploadedBy: text("uploaded_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
