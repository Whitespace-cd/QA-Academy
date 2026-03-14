import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, enrollmentsTable, submissionsTable, bugReportsTable,
  testCasesTable, lessonCompletionsTable, lessonsTable, coursesTable,
  userBadgesTable, badgesTable
} from "@workspace/db/schema";
import { eq, desc, sql, count } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      learningPath: user.learningPath,
      avatarUrl: user.avatarUrl,
      totalScore: user.totalScore,
      level: user.level,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (req.user!.id !== id && req.user!.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { name, learningPath, avatarUrl } = req.body;
    const [user] = await db.update(usersTable)
      .set({ name, learningPath, avatarUrl, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning();
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      learningPath: user.learningPath,
      avatarUrl: user.avatarUrl,
      totalScore: user.totalScore,
      level: user.level,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id/progress", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [enrolledResult] = await db.select({ count: count() }).from(enrollmentsTable)
      .where(eq(enrollmentsTable.userId, id));
    const [completedResult] = await db.select({ count: count() }).from(enrollmentsTable)
      .where(eq(enrollmentsTable.userId, id));
    const [lessonsResult] = await db.select({ count: count() }).from(lessonCompletionsTable)
      .where(eq(lessonCompletionsTable.userId, id));
    const [totalLessons] = await db.select({ count: count() }).from(lessonsTable);
    const [submissionsResult] = await db.select({ count: count() }).from(submissionsTable)
      .where(eq(submissionsTable.userId, id));
    const [bugsResult] = await db.select({ count: count() }).from(bugReportsTable)
      .where(eq(bugReportsTable.userId, id));
    const [testCasesResult] = await db.select({ count: count() }).from(testCasesTable)
      .where(eq(testCasesTable.userId, id));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);

    const recentSubmissions = await db.select().from(submissionsTable)
      .where(eq(submissionsTable.userId, id)).orderBy(desc(submissionsTable.createdAt)).limit(5);
    const recentBugs = await db.select().from(bugReportsTable)
      .where(eq(bugReportsTable.userId, id)).orderBy(desc(bugReportsTable.createdAt)).limit(3);

    const recentActivity = [
      ...recentSubmissions.map(s => ({
        type: "submission",
        description: `Submitted exercise answer (Score: ${s.score}/${s.maxScore})`,
        score: s.score,
        createdAt: s.createdAt,
      })),
      ...recentBugs.map(b => ({
        type: "bug-report",
        description: `Reported bug: ${b.title}`,
        score: b.score ?? null,
        createdAt: b.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

    res.json({
      userId: id,
      enrolledCourses: enrolledResult.count,
      completedCourses: 0,
      completedLessons: lessonsResult.count,
      totalLessons: totalLessons.count,
      totalScore: user?.totalScore ?? 0,
      submissionsCount: submissionsResult.count,
      bugReportsCount: bugsResult.count,
      testCasesCount: testCasesResult.count,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
