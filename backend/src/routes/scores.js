// src/routes/scores.js
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, teacherOnly } = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/scores/:studentId/history  — teacher or the student themselves
router.get("/:studentId/history", authenticate, async (req, res) => {
  const { studentId } = req.params;
  // Student can only see their own history
  if (req.user.role === "STUDENT" && req.user.id !== studentId) {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const logs = await prisma.scoreLog.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/scores/:studentId  — teacher only
// Body: { delta, description }
router.post("/:studentId", authenticate, teacherOnly, async (req, res) => {
  const { delta, description } = req.body;
  const { studentId } = req.params;

  if (!delta || delta === 0) {
    return res.status(400).json({ message: "delta (จำนวนแต้ม) ต้องไม่เป็น 0" });
  }

  try {
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return res.status(404).json({ message: "ไม่พบนักเรียน" });

    const newScore = Math.max(0, student.score + delta);
    const newLevel = Math.floor(newScore / 100) + 1;

    // Transaction: update score + create log together
    const [updatedStudent, log] = await prisma.$transaction([
      prisma.student.update({
        where: { id: studentId },
        data: { score: newScore, level: newLevel },
      }),
      prisma.scoreLog.create({
        data: {
          studentId,
          delta,
          description: description || "—",
          givenBy: req.user.name,
        },
      }),
    ]);

    res.json({ student: updatedStudent, log });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/scores/leaderboard  — anyone logged in
router.get("/leaderboard", authenticate, async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      select: { id: true, name: true, class: true, score: true, level: true },
      orderBy: { score: "desc" },
      take: 50,
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
