import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticate, generateToken } from "../middlewares/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role = "student", learningPath } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: "Validation error", message: "Email, password, and name are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: "Validation error", message: "Password must be at least 8 characters" });
      return;
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Validation error", message: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash,
      name,
      role: role as any,
      learningPath: learningPath as any,
      totalScore: 0,
      level: 1,
    }).returning();

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        learningPath: user.learningPath,
        avatarUrl: user.avatarUrl,
        totalScore: user.totalScore,
        level: user.level,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Validation error", message: "Email and password are required" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: "Unauthorized", message: "Invalid email or password" });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        learningPath: user.learningPath,
        avatarUrl: user.avatarUrl,
        totalScore: user.totalScore,
        level: user.level,
        createdAt: user.createdAt,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
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
    console.error("GetMe error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
