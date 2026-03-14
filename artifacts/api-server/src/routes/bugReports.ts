import { Router } from "express";
import { db } from "@workspace/db";
import { bugReportsTable, demoAppsTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";
import { evaluateBugReport } from "../lib/evaluator.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { userId, demoAppId } = req.query;

    const reports = await db.select({
      report: bugReportsTable,
      appName: demoAppsTable.name,
      userName: usersTable.name,
    }).from(bugReportsTable)
      .leftJoin(demoAppsTable, eq(bugReportsTable.demoAppId, demoAppsTable.id))
      .leftJoin(usersTable, eq(bugReportsTable.userId, usersTable.id))
      .orderBy(desc(bugReportsTable.createdAt));

    let filtered = reports;
    if (userId) filtered = filtered.filter(r => r.report.userId === parseInt(userId as string));
    if (demoAppId) filtered = filtered.filter(r => r.report.demoAppId === parseInt(demoAppId as string));

    res.json(filtered.map(({ report, appName, userName }) => ({
      ...report,
      demoAppName: appName ?? "Unknown App",
      userName: userName ?? "Unknown User",
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const {
      demoAppId, exerciseId, title, description, stepsToReproduce,
      expectedResult, actualResult, severity, environment, screenshotUrl
    } = req.body;
    const userId = req.user!.id;

    const evaluation = evaluateBugReport({
      title, description, stepsToReproduce, expectedResult, actualResult, severity, environment
    });

    const [report] = await db.insert(bugReportsTable).values({
      userId,
      demoAppId,
      exerciseId: exerciseId ?? null,
      title, description, stepsToReproduce, expectedResult, actualResult,
      severity, status: "open",
      environment: environment ?? null,
      screenshotUrl: screenshotUrl ?? null,
      score: evaluation.score,
      feedback: evaluation.feedback,
    }).returning();

    // Update user score
    await db.execute(`UPDATE users SET total_score = total_score + ${Math.round(evaluation.score / 2)}, updated_at = NOW() WHERE id = ${userId}`);

    const [app] = await db.select().from(demoAppsTable).where(eq(demoAppsTable.id, demoAppId)).limit(1);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    res.status(201).json({
      bugReport: {
        ...report,
        demoAppName: app?.name ?? "Unknown App",
        userName: user?.name ?? "Unknown User",
      },
      score: evaluation.score,
      feedback: evaluation.feedback,
      suggestions: evaluation.suggestions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [result] = await db.select({
      report: bugReportsTable,
      appName: demoAppsTable.name,
      userName: usersTable.name,
    }).from(bugReportsTable)
      .leftJoin(demoAppsTable, eq(bugReportsTable.demoAppId, demoAppsTable.id))
      .leftJoin(usersTable, eq(bugReportsTable.userId, usersTable.id))
      .where(eq(bugReportsTable.id, id)).limit(1);

    if (!result) {
      res.status(404).json({ error: "Bug report not found" });
      return;
    }

    res.json({
      ...result.report,
      demoAppName: result.appName ?? "Unknown App",
      userName: result.userName ?? "Unknown User",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
