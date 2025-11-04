import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  projectType: text("project_type").notNull(),
  status: text("status").notNull(),
  solutionArchitect: text("solution_architect").notNull(),
  teamMembers: text("team_members").notNull(),
  projectLead: text("project_lead").notNull(),
  stakeholders: text("stakeholders").notNull(),
  wikiLink: text("wiki_link").notNull(),
  usefulLinks: text("useful_links").notNull(),
  modified: text("modified").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const statusUpdates = pgTable("status_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id),
  content: text("content").notNull(),
  commenter: text("commenter").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
});

export const insertStatusUpdateSchema = createInsertSchema(statusUpdates).omit({
  id: true,
  createdAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertStatusUpdate = z.infer<typeof insertStatusUpdateSchema>;
export type StatusUpdate = typeof statusUpdates.$inferSelect;
