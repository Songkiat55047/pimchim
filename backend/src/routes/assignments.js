// src/routes/assignments.js
const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const { authenticate, teacherOnly } = require("../middleware/auth");

const prisma = new PrismaClient();

// GET /api/assignments
router.get("/", authenticate, async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({ orderBy: { dueDate: "asc" } });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/assignments  — teacher only
router.post("/", authenticate, teacherOnly, async (req, res) => {
  const { title, description, dueDate } = req.body;
  if (!title || !dueDate) return res.status(400).json({ message: "title and dueDate required" });
  try {
    const assignment = await prisma.assignment.create({
      data: { title, description, dueDate: new Date(dueDate), createdBy: req.user.name },
    });
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/assignments/:id  — teacher only
router.delete("/:id", authenticate, teacherOnly, async (req, res) => {
  try {
    await prisma.assignment.delete({ where: { id: req.params.id } });
    res.json({ message: "ลบงานแล้ว" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "ไม่พบงาน" });
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
