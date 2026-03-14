import { Router } from "express";
import { db } from "@workspace/db";
import { exercisesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { lessonId, type } = req.query;
    let exercises = await db.select().from(exercisesTable);

    if (lessonId) exercises = exercises.filter(e => e.lessonId === parseInt(lessonId as string));
    if (type) exercises = exercises.filter(e => e.type === type);

    res.json(exercises.map(e => ({
      ...e,
      hints: e.hints ? JSON.parse(e.hints) : [],
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [exercise] = await db.select().from(exercisesTable).where(eq(exercisesTable.id, id)).limit(1);

    if (!exercise) {
      res.status(404).json({ error: "Exercise not found" });
      return;
    }

    res.json({
      ...exercise,
      hints: exercise.hints ? JSON.parse(exercise.hints) : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
