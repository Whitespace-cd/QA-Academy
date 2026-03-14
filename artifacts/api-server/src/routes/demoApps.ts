import { Router } from "express";
import { db } from "@workspace/db";
import { demoAppsTable, knownBugsTable } from "@workspace/db/schema";
import { eq, count } from "drizzle-orm";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const apps = await db.select().from(demoAppsTable);
    const appsWithCounts = await Promise.all(apps.map(async (app) => {
      const [bugsCount] = await db.select({ count: count() }).from(knownBugsTable).where(eq(knownBugsTable.demoAppId, app.id));
      return { ...app, bugsCount: bugsCount.count };
    }));
    res.json(appsWithCounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [app] = await db.select().from(demoAppsTable).where(eq(demoAppsTable.id, id)).limit(1);

    if (!app) {
      res.status(404).json({ error: "Demo app not found" });
      return;
    }

    const knownBugs = await db.select().from(knownBugsTable).where(eq(knownBugsTable.demoAppId, id));

    res.json({
      ...app,
      bugsCount: knownBugs.length,
      knownBugs: knownBugs.map(bug => ({
        id: bug.id,
        title: bug.title,
        category: bug.category,
        severity: bug.severity,
        hint: bug.hint,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
