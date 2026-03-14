import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, coursesTable, enrollmentsTable, submissionsTable,
  bugReportsTable, testCasesTable
} from "@workspace/db/schema";
import { eq, count, and, gte } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth.js";

const router = Router();

router.get("/stats", authenticate, requireRole("admin"), async (req, res) => {
  try {
    const [totalUsers] = await db.select({ count: count() }).from(usersTable);
    const [totalStudents] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "student"));
    const [totalInstructors] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "instructor"));
    const [totalCourses] = await db.select({ count: count() }).from(coursesTable);
    const [totalEnrollments] = await db.select({ count: count() }).from(enrollmentsTable);
    const [totalSubmissions] = await db.select({ count: count() }).from(submissionsTable);
    const [totalBugReports] = await db.select({ count: count() }).from(bugReportsTable);
    const [totalTestCases] = await db.select({ count: count() }).from(testCasesTable);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [activeToday] = await db.select({ count: count() }).from(usersTable).where(gte(usersTable.updatedAt, today));

    res.json({
      totalUsers: totalUsers.count,
      totalStudents: totalStudents.count,
      totalInstructors: totalInstructors.count,
      totalCourses: totalCourses.count,
      totalEnrollments: totalEnrollments.count,
      totalSubmissions: totalSubmissions.count,
      totalBugReports: totalBugReports.count,
      totalTestCases: totalTestCases.count,
      activeToday: activeToday.count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
