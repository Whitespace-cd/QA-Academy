import { Router } from "express";
import { db } from "@workspace/db";
import {
  coursesTable, modulesTable, lessonsTable, exercisesTable,
  enrollmentsTable, usersTable, lessonCompletionsTable
} from "@workspace/db/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth.js";

const router = Router();

// GET /courses
router.get("/", async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    let query = db.select({
      id: coursesTable.id,
      title: coursesTable.title,
      description: coursesTable.description,
      category: coursesTable.category,
      difficulty: coursesTable.difficulty,
      estimatedHours: coursesTable.estimatedHours,
      imageUrl: coursesTable.imageUrl,
      instructorId: coursesTable.instructorId,
      rating: coursesTable.rating,
      createdAt: coursesTable.createdAt,
      instructorName: usersTable.name,
    }).from(coursesTable).leftJoin(usersTable, eq(coursesTable.instructorId, usersTable.id));

    const courses = await query;

    const coursesWithCounts = await Promise.all(courses.map(async (course) => {
      const [modulesCount] = await db.select({ count: count() }).from(modulesTable).where(eq(modulesTable.courseId, course.id));
      const [enrolledCount] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
      return {
        ...course,
        modulesCount: modulesCount.count,
        enrolledCount: enrolledCount.count,
        rating: course.rating ? parseFloat(course.rating) : null,
      };
    }));

    let filtered = coursesWithCounts;
    if (category) filtered = filtered.filter(c => c.category === category);
    if (difficulty) filtered = filtered.filter(c => c.difficulty === difficulty);

    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /courses
router.post("/", authenticate, requireRole("instructor", "admin"), async (req, res) => {
  try {
    const { title, description, category, difficulty, estimatedHours, imageUrl } = req.body;

    const [course] = await db.insert(coursesTable).values({
      title, description, category, difficulty,
      estimatedHours, imageUrl,
      instructorId: req.user!.id,
    }).returning();

    const [instructor] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);

    res.status(201).json({
      ...course,
      instructorName: instructor.name,
      modulesCount: 0,
      enrolledCount: 0,
      rating: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /courses/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [course] = await db.select({
      id: coursesTable.id,
      title: coursesTable.title,
      description: coursesTable.description,
      category: coursesTable.category,
      difficulty: coursesTable.difficulty,
      estimatedHours: coursesTable.estimatedHours,
      imageUrl: coursesTable.imageUrl,
      instructorId: coursesTable.instructorId,
      rating: coursesTable.rating,
      createdAt: coursesTable.createdAt,
      instructorName: usersTable.name,
    }).from(coursesTable).leftJoin(usersTable, eq(coursesTable.instructorId, usersTable.id)).where(eq(coursesTable.id, id)).limit(1);

    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, id)).orderBy(modulesTable.orderIndex);

    const modulesWithCounts = await Promise.all(modules.map(async (mod) => {
      const [lessonsCount] = await db.select({ count: count() }).from(lessonsTable).where(eq(lessonsTable.moduleId, mod.id));
      return { ...mod, lessonsCount: lessonsCount.count };
    }));

    const [enrolledCount] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, id));

    res.json({
      ...course,
      rating: course.rating ? parseFloat(course.rating) : null,
      modulesCount: modules.length,
      enrolledCount: enrolledCount.count,
      modules: modulesWithCounts,
      isEnrolled: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /courses/:id/enroll
router.post("/:id/enroll", authenticate, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user!.id;

    const existing = await db.select().from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.userId, userId), eq(enrollmentsTable.courseId, courseId))).limit(1);

    if (existing.length > 0) {
      res.json(existing[0]);
      return;
    }

    const [enrollment] = await db.insert(enrollmentsTable).values({
      userId, courseId, progress: "0",
    }).returning();

    res.json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /courses/:courseId/modules
router.get("/:courseId/modules", async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const modules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId)).orderBy(modulesTable.orderIndex);

    const modulesWithCounts = await Promise.all(modules.map(async (mod) => {
      const [lessonsCount] = await db.select({ count: count() }).from(lessonsTable).where(eq(lessonsTable.moduleId, mod.id));
      return { ...mod, lessonsCount: lessonsCount.count };
    }));

    res.json(modulesWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /modules/:moduleId/lessons
router.get("/modules/:moduleId/lessons", async (req, res) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.moduleId, moduleId)).orderBy(lessonsTable.orderIndex);

    res.json(lessons.map(l => ({
      ...l,
      isCompleted: false,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /instructor/courses
router.get("/instructor/list", authenticate, requireRole("instructor", "admin"), async (req, res) => {
  try {
    const courses = await db.select({
      id: coursesTable.id,
      title: coursesTable.title,
      description: coursesTable.description,
      category: coursesTable.category,
      difficulty: coursesTable.difficulty,
      estimatedHours: coursesTable.estimatedHours,
      imageUrl: coursesTable.imageUrl,
      instructorId: coursesTable.instructorId,
      rating: coursesTable.rating,
      createdAt: coursesTable.createdAt,
      instructorName: usersTable.name,
    }).from(coursesTable)
      .leftJoin(usersTable, eq(coursesTable.instructorId, usersTable.id))
      .where(eq(coursesTable.instructorId, req.user!.id));

    const coursesWithCounts = await Promise.all(courses.map(async (course) => {
      const [modulesCount] = await db.select({ count: count() }).from(modulesTable).where(eq(modulesTable.courseId, course.id));
      const [enrolledCount] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
      return {
        ...course,
        modulesCount: modulesCount.count,
        enrolledCount: enrolledCount.count,
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
