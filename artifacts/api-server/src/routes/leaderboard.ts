import { Router } from "express";
import { db } from "@workspace/db";
import {
  usersTable, userBadgesTable, badgesTable, enrollmentsTable, certificatesTable
} from "@workspace/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const users = await db.select().from(usersTable)
      .where(eq(usersTable.role, "student"))
      .orderBy(desc(usersTable.totalScore))
      .limit(limit);

    const leaderboard = await Promise.all(users.map(async (user, index) => {
      const [badgesCount] = await db.select({ count: count() }).from(userBadgesTable).where(eq(userBadgesTable.userId, user.id));
      const [completedCourses] = await db.select({ count: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.userId, user.id));
      return {
        rank: index + 1,
        userId: user.id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        totalScore: user.totalScore,
        level: user.level,
        badgesCount: badgesCount.count,
        completedCourses: completedCourses.count,
      };
    }));

    res.json(leaderboard);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/badges/user/:userId", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const badges = await db.select({
      badge: badgesTable,
      earnedAt: userBadgesTable.earnedAt,
    }).from(userBadgesTable)
      .leftJoin(badgesTable, eq(userBadgesTable.badgeId, badgesTable.id))
      .where(eq(userBadgesTable.userId, userId));

    res.json(badges.map(({ badge, earnedAt }) => ({
      ...badge,
      earnedAt,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/certificates/user/:userId", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const certs = await db.select().from(certificatesTable).where(eq(certificatesTable.userId, userId));
    res.json(certs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
