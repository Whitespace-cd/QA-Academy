import { Router } from "express";
import { db } from "@workspace/db";
import {
  submissionsTable, exercisesTable, usersTable, badgesTable, userBadgesTable
} from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";
import { evaluateSubmission } from "../lib/evaluator.js";

const router = Router();

router.post("/", authenticate, async (req, res) => {
  try {
    const { exerciseId, content, language } = req.body;
    const userId = req.user!.id;

    const [exercise] = await db.select().from(exercisesTable).where(eq(exercisesTable.id, exerciseId)).limit(1);
    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    const evaluation = evaluateSubmission(exercise.type, content, exercise.points);

    const [submission] = await db.insert(submissionsTable).values({
      userId,
      exerciseId,
      content,
      language: language ?? null,
      score: evaluation.score,
      maxScore: exercise.points,
      feedback: evaluation.feedback,
      suggestions: JSON.stringify(evaluation.suggestions),
      status: evaluation.score >= exercise.points * 0.6 ? "passed" : "failed",
    }).returning();

    // Update user total score
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const newScore = (user?.totalScore ?? 0) + evaluation.score;
    const newLevel = Math.min(10, Math.floor(newScore / 100) + 1);

    await db.update(usersTable).set({
      totalScore: newScore,
      level: newLevel,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, userId));

    // Check for badge
    let badgeEarned = null;
    if (evaluation.score >= exercise.points * 0.9) {
      const [perfectBadge] = await db.select().from(badgesTable).where(eq(badgesTable.name, "Perfect Score")).limit(1);
      if (perfectBadge) {
        await db.insert(userBadgesTable).values({ userId, badgeId: perfectBadge.id }).onConflictDoNothing();
        badgeEarned = perfectBadge;
      }
    }

    res.status(201).json({
      ...submission,
      exerciseTitle: exercise.title,
      suggestions: JSON.parse(submission.suggestions ?? "[]"),
      pointsEarned: evaluation.score,
      badgeEarned: badgeEarned ? {
        ...badgeEarned,
        earnedAt: new Date(),
      } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/user/:userId", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const submissions = await db.select({
      sub: submissionsTable,
      ex: exercisesTable,
    }).from(submissionsTable)
      .leftJoin(exercisesTable, eq(submissionsTable.exerciseId, exercisesTable.id))
      .where(eq(submissionsTable.userId, userId))
      .orderBy(desc(submissionsTable.createdAt));

    res.json(submissions.map(({ sub, ex }) => ({
      ...sub,
      exerciseTitle: ex?.title ?? "Unknown",
      suggestions: sub.suggestions ? JSON.parse(sub.suggestions) : [],
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
