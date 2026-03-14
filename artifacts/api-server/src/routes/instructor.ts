import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, enrollmentsTable, coursesTable, submissionsTable
} from "@workspace/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/students", authenticate, requireRole("instructor", "admin"), async (req, res) => {
  try {
    const students = await db.select().from(usersTable).where(eq(usersTable.role, "student"));

    const studentSummaries = await Promise.all(students.map(async (student) => {
      const [enrolled] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.userId, student.id));
      return {
        id: student.id,
        name: student.name,
        email: student.email,
        enrolledCourses: enrolled.count,
        completedCourses: 0,
        totalScore: student.totalScore,
        lastActive: student.updatedAt,
      };
    }));

    res.json(studentSummaries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/courses", authenticate, requireRole("instructor", "admin"), async (req, res) => {
  try {
    const courses = await db.select().from(coursesTable)
      .where(eq(coursesTable.instructorId, req.user!.id));

    const coursesWithCounts = await Promise.all(courses.map(async (course) => {
      const [enrolled] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
      const [instructor] = await db.select().from(usersTable).where(eq(usersTable.id, course.instructorId)).limit(1);
      return {
        ...course,
        instructorName: instructor?.name ?? "Unknown",
        modulesCount: 0,
        enrolledCount: enrolled.count,
        rating: course.rating ? parseFloat(course.rating) : null,
      };
    }));

    res.json(coursesWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
