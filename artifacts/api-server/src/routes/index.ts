import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import coursesRouter from "./courses.js";
import lessonsRouter from "./lessons.js";
import exercisesRouter from "./exercises.js";
import submissionsRouter from "./submissions.js";
import bugReportsRouter from "./bugReports.js";
import testCasesRouter from "./testCases.js";
import leaderboardRouter from "./leaderboard.js";
import demoAppsRouter from "./demoApps.js";
import instructorRouter from "./instructor.js";
import adminRouter from "./admin.js";
import modulesRouter from "./modules.js";

const router = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/courses", coursesRouter);
router.use("/lessons", lessonsRouter);
router.use("/exercises", exercisesRouter);
router.use("/submissions", submissionsRouter);
router.use("/bug-reports", bugReportsRouter);
router.use("/test-cases", testCasesRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/badges", leaderboardRouter);
router.use("/certificates", leaderboardRouter);
router.use("/demo-apps", demoAppsRouter);
router.use("/instructor", instructorRouter);
router.use("/admin", adminRouter);
router.use("/modules", modulesRouter);

export default router;
