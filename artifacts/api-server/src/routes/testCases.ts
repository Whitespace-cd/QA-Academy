import { Router } from "express";
import { db } from "@workspace/db";
import { testCasesTable, usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";
import { evaluateTestCase } from "../lib/evaluator.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const { userId, exerciseId } = req.query;

    const testCases = await db.select({
      tc: testCasesTable,
      userName: usersTable.name,
    }).from(testCasesTable)
      .leftJoin(usersTable, eq(testCasesTable.userId, usersTable.id))
      .orderBy(desc(testCasesTable.createdAt));

    let filtered = testCases;
    if (userId) filtered = filtered.filter(t => t.tc.userId === parseInt(userId as string));
    if (exerciseId) filtered = filtered.filter(t => t.tc.exerciseId === parseInt(exerciseId as string));

    res.json(filtered.map(({ tc, userName }) => ({
      ...tc,
      userName: userName ?? "Unknown User",
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { exerciseId, title, description, preconditions, testSteps, expectedResult, testType, priority } = req.body;
    const userId = req.user!.id;

    const evaluation = evaluateTestCase({ title, description, preconditions, testSteps, expectedResult, testType, priority });

    const [testCase] = await db.insert(testCasesTable).values({
      userId,
      exerciseId: exerciseId ?? null,
      title, description, preconditions, testSteps, expectedResult,
      testType, priority,
      score: evaluation.score,
      feedback: evaluation.feedback,
    }).returning();

    // Update user score
    await db.execute(`UPDATE users SET total_score = total_score + ${Math.round(evaluation.score / 2)}, updated_at = NOW() WHERE id = ${userId}`);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

    res.status(201).json({
      testCase: {
        ...testCase,
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

export default router;
