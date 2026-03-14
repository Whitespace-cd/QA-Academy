import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, lessonCompletionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

// GET /modules/:moduleId/lessons
router.get("/:moduleId/lessons", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessons = await db.select().from(lessonsTable)
      .where(eq(lessonsTable.moduleId, moduleId))
      .orderBy(lessonsTable.orderIndex);

    res.json(lessons.map(l => ({
      ...l,
      isCompleted: false,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
