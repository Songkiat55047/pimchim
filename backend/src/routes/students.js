// src/routes/students.js
const router = require("express").Router();
const multer = require("multer");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { authenticate, teacherOnly } = require("../middleware/auth");

const prisma = new PrismaClient();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Avatar upload (student ใช้ได้ — ต้องอยู่ก่อน teacherOnly middleware) ───

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}${ext}`);
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

// POST /api/students/avatar — student อัพรูปตัวเอง
router.post("/avatar", authenticate, avatarUpload.single("avatar"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "กรุณาแนบไฟล์รูป" });
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await prisma.student.update({
      where: { id: req.user.id },
      data: { avatarUrl },
    });
    res.json({ avatarUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Teacher-only routes ───────────────────────────────────────────────────────
router.use(authenticate, teacherOnly);

// GET /api/students?search=&class=
router.get("/", async (req, res) => {
  const { search = "", class: cls = "" } = req.query;
  try {
    const students = await prisma.student.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { id:   { contains: search, mode: "insensitive" } },
            ],
          } : {},
          cls ? { class: cls } : {},
        ],
      },
      select: {
        id: true, name: true, class: true, score: true,
        level: true, passwordChanged: true, createdAt: true,
      },
      orderBy: { score: "desc" },
    });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/students (single add)
router.post("/", async (req, res) => {
  const { id, name, class: cls } = req.body;
  if (!id || !name || !cls) {
    return res.status(400).json({ message: "id, name, class required" });
  }
  try {
    const studentId = id.toUpperCase();
    const exists = await prisma.student.findUnique({ where: { id: studentId } });
    if (exists) return res.status(409).json({ message: "รหัสนักเรียนนี้มีอยู่แล้ว" });

    const hash = await bcrypt.hash(studentId, 10);
    const student = await prisma.student.create({
      data: { id: studentId, name, class: cls, passwordHash: hash },
    });
    res.status(201).json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/students/:id
router.put("/:id", async (req, res) => {
  const { name, class: cls, resetPassword } = req.body;
  try {
    const data = {};
    if (name) data.name = name;
    if (cls) data.class = cls;
    if (resetPassword) {
      data.passwordHash = await bcrypt.hash(req.params.id, 10);
      data.passwordChanged = false;
    }
    const student = await prisma.student.update({ where: { id: req.params.id }, data });
    res.json(student);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "ไม่พบนักเรียน" });
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    await prisma.student.delete({ where: { id: req.params.id } });
    res.json({ message: "ลบนักเรียนแล้ว" });
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ message: "ไม่พบนักเรียน" });
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/students/import
router.post("/import", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "กรุณาแนบไฟล์ Excel" });
  try {
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    const dataRows = rows.filter((r) => {
      const id = String(r[0] || "").trim();
      return id && !/^(รหัส|id|student)/i.test(id);
    });

    if (!dataRows.length) return res.status(400).json({ message: "ไม่พบข้อมูลในไฟล์" });

    const results = { added: 0, skipped: 0, errors: [] };
    for (const row of dataRows) {
      const id = String(row[0] || "").trim().toUpperCase();
      const name = String(row[1] || "").trim();
      const cls = String(row[2] || "").trim();
      if (!id || !name) { results.errors.push(`แถว: ${row.join(",")}`); continue; }
      const exists = await prisma.student.findUnique({ where: { id } });
      if (exists) { results.skipped++; continue; }
      const hash = await bcrypt.hash(id, 10);
      await prisma.student.create({ data: { id, name, class: cls || "—", passwordHash: hash } });
      results.added++;
    }
    res.json({ message: `นำเข้าสำเร็จ ${results.added} คน, ข้าม ${results.skipped} (ซ้ำ)`, ...results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถอ่านไฟล์ Excel ได้" });
  }
});

// GET /api/students/leaderboard
router.get("/leaderboard", async (req, res) => {
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