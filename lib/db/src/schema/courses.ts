import { pgTable, serial, text, integer, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const courseCategoryEnum = pgEnum("course_category", [
  "foundations", "manual-testing", "automation-testing", "api-testing",
  "performance-testing", "mobile-testing", "cicd-testing"
]);
export const courseDifficultyEnum = pgEnum("course_difficulty", ["beginner", "intermediate", "advanced"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["concept", "example", "practice", "challenge"]);
export const exerciseTypeEnum = pgEnum("exercise_type", ["write-test-case", "report-bug", "write-automation", "test-api", "create-test-plan", "quiz"]);
export const exerciseDifficultyEnum = pgEnum("exercise_difficulty", ["easy", "medium", "hard"]);

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: courseCategoryEnum("category").notNull(),
  difficulty: courseDifficultyEnum("difficulty").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  imageUrl: text("image_url"),
  instructorId: integer("instructor_id").notNull().references(() => usersTable.id),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const modulesTable = pgTable("modules", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const lessonsTable = pgTable("lessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modulesTable.id),
  title: text("title").notNull(),
  type: lessonTypeEnum("type").notNull(),
  content: text("content").notNull(),
  orderIndex: integer("order_index").notNull(),
  estimatedMinutes: integer("estimated_minutes").notNull().default(15),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const exercisesTable = pgTable("exercises", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  title: text("title").notNull(),
  type: exerciseTypeEnum("type").notNull(),
  difficulty: exerciseDifficultyEnum("difficulty").notNull(),
  points: integer("points").notNull().default(10),
  description: text("description").notNull(),
  instructions: text("instructions").notNull(),
  template: text("template"),
  hints: text("hints"), // JSON array stored as text
  demoAppId: integer("demo_app_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const enrollmentsTable = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  courseId: integer("course_id").notNull().references(() => coursesTable.id),
  enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  progress: numeric("progress", { precision: 5, scale: 2 }).notNull().default("0"),
});

export const lessonCompletionsTable = pgTable("lesson_completions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  lessonId: integer("lesson_id").notNull().references(() => lessonsTable.id),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof coursesTable.$inferSelect;
export type Module = typeof modulesTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type Exercise = typeof exercisesTable.$inferSelect;
