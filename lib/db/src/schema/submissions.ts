import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { exercisesTable } from "./courses";

export const submissionStatusEnum = pgEnum("submission_status", ["pending", "evaluated", "passed", "failed"]);
export const bugSeverityEnum = pgEnum("bug_severity", ["critical", "high", "medium", "low"]);
export const bugStatusEnum = pgEnum("bug_status", ["open", "in-progress", "resolved", "wont-fix"]);
export const testTypeEnum = pgEnum("test_type", ["functional", "regression", "smoke", "sanity", "integration", "performance"]);
export const testPriorityEnum = pgEnum("test_priority", ["critical", "high", "medium", "low"]);

export const submissionsTable = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercisesTable.id),
  content: text("content").notNull(),
  language: text("language"),
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(100),
  feedback: text("feedback").notNull().default(""),
  suggestions: text("suggestions"), // JSON array stored as text
  status: submissionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const demoAppsTable = pgTable("demo_apps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // ecommerce, banking, hr-management, buggy-demo
  url: text("url").notNull(),
  difficulty: text("difficulty").notNull().default("beginner"),
  testingGuide: text("testing_guide").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const knownBugsTable = pgTable("known_bugs", {
  id: serial("id").primaryKey(),
  demoAppId: integer("demo_app_id").notNull().references(() => demoAppsTable.id),
  title: text("title").notNull(),
  category: text("category").notNull(),
  severity: bugSeverityEnum("severity").notNull(),
  hint: text("hint").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const bugReportsTable = pgTable("bug_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  demoAppId: integer("demo_app_id").notNull().references(() => demoAppsTable.id),
  exerciseId: integer("exercise_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stepsToReproduce: text("steps_to_reproduce").notNull(),
  expectedResult: text("expected_result").notNull(),
  actualResult: text("actual_result").notNull(),
  severity: bugSeverityEnum("severity").notNull(),
  status: bugStatusEnum("status").notNull().default("open"),
  environment: text("environment"),
  screenshotUrl: text("screenshot_url"),
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const testCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  exerciseId: integer("exercise_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  preconditions: text("preconditions").notNull(),
  testSteps: text("test_steps").notNull(),
  expectedResult: text("expected_result").notNull(),
  testType: testTypeEnum("test_type").notNull(),
  priority: testPriorityEnum("priority").notNull(),
  score: integer("score"),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const badgesTable = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  requiredScore: integer("required_score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  badgeId: integer("badge_id").notNull().references(() => badgesTable.id),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  courseId: integer("course_id").notNull(),
  issuedAt: timestamp("issued_at").notNull().defaultNow(),
  certificateUrl: text("certificate_url").notNull(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({ id: true, createdAt: true });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
export type BugReport = typeof bugReportsTable.$inferSelect;
export type TestCase = typeof testCasesTable.$inferSelect;
