import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, exercisesTable, lessonCompletionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id)).limit(1);

    if (!lesson) {
      res.status(404).json({ error: "Lesson not found" });
      return;
    }

    const exercises = await db.select().from(exercisesTable).where(eq(exercisesTable.lessonId, id));

    let isCompleted = false;
    if (req.user) {
      const completions = await db.select().from(lessonCompletionsTable)
        .where(eq(lessonCompletionsTable.userId, req.user.id));
      isCompleted = completions.some(c => c.lessonId === id);
    }

    res.json({
      ...lesson,
      isCompleted,
      exercises: exercises.map(e => ({
        ...e,
        hints: e.hints ? JSON.parse(e.hints) : [],
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
