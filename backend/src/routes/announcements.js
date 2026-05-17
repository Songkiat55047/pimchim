// src/routes/announcements.js
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, teacherOnly } = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/announcements  — all logged-in users
router.get("/", authenticate, async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reads: req.user.role === "STUDENT"
          ? { where: { studentId: req.user.id } }
          : false,
      },
    });

    // For student: mark which ones are unread
    const result = announcements.map((a) => ({
      ...a,
      isRead: req.user.role === "STUDENT" ? a.reads?.length > 0 : undefined,
      reads: undefined,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/announcements  — teacher only
router.post("/", authenticate, teacherOnly, async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) return res.status(400).json({ message: "title and body required" });
  try {
    const ann = await prisma.announcement.create({
      data: { title, body, createdBy: req.user.name },
    });
    res.status(201).json(ann);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/announcements/:id  — teacher only
router.delete("/:id", authenticate, teacherOnly, async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ message: "ลบประกาศแล้ว" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "ไม่พบประกาศ" });
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/announcements/:id/read  — student marks as read
router.post("/:id/read", authenticate, async (req, res) => {
  if (req.user.role !== "STUDENT") return res.status(403).json({ message: "Students only" });
  try {
    await prisma.announcementRead.upsert({
      where: { announcementId_studentId: { announcementId: req.params.id, studentId: req.user.id } },
      update: {},
      create: { announcementId: req.params.id, studentId: req.user.id },
    });
    res.json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
