// src/routes/auth.js
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { authenticate, teacherOnly } = require("../middleware/auth");

const prisma = new PrismaClient();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `teacher-${req.user.id}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("รองรับเฉพาะไฟล์รูปภาพ"));
    }
    cb(null, true);
  },
});

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// POST /api/auth/login
// Body: { username, password, role: "teacher" | "student" }
router.post("/login", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: "username, password, role required" });
  }

  try {
    if (role === "teacher") {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return res.status(401).json({ message: "ไม่พบผู้ใช้งาน" });

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

      const token = signToken({ id: user.id, role: "TEACHER", name: user.name });
      return res.json({
        token,
        user: { id: user.id, name: user.name, role: "TEACHER" },
        requirePasswordChange: false,
      });
    }

    if (role === "student") {
      // Student ID is uppercase
      const studentId = username.toUpperCase();
      const student = await prisma.student.findUnique({ where: { id: studentId } });
      if (!student) return res.status(401).json({ message: "ไม่พบรหัสนักเรียน" });

      const valid = await bcrypt.compare(password, student.passwordHash);
      if (!valid) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });

      const token = signToken({ id: student.id, role: "STUDENT", name: student.name });
      return res.json({
        token,
        user: { id: student.id, name: student.name, role: "STUDENT", class: student.class },
        requirePasswordChange: !student.passwordChanged,
      });
    }

    return res.status(400).json({ message: "role must be teacher or student" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/change-password  (student only, must be logged in)
// Body: { newPassword }
router.post("/change-password", authenticate, async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
  }

  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students change password here" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.student.update({
      where: { id: req.user.id },
      data: { passwordHash: hash, passwordChanged: true },
    });

    res.json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", authenticate, async (req, res) => {
  try {
    if (req.user.role === "TEACHER") {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { id: true, username: true, name: true, role: true, avatarUrl: true, createdAt: true },
      });
      return res.json(user);
    }
    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, class: true, score: true, level: true, passwordChanged: true, avatarUrl: true, createdAt: true },
    });
    return res.json({ ...student, role: "STUDENT" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/auth/profile  (teacher only) — update display name
// Body: { name }
router.patch("/profile", authenticate, teacherOnly, async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "กรุณากรอกชื่อ" });
  }
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: { id: true, username: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/avatar  (teacher only) — upload profile picture
router.post("/avatar", authenticate, teacherOnly, avatarUpload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "กรุณาแนบไฟล์รูป" });
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });
    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
