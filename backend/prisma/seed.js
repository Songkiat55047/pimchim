// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create teacher account
  const teacherHash = await bcrypt.hash("1234", 10);
  await prisma.user.upsert({
    where: { username: "teacher01" },
    update: {},
    create: {
      username: "teacher01",
      passwordHash: teacherHash,
      role: "TEACHER",
      name: "อาจารย์สมศรี ใจดี",
    },
  });

  // Create demo students (password = student ID)
  const students = [
    { id: "STD001", name: "น้องพิมพ์ สดใส", class: "ม.5/1", score: 850 },
    { id: "STD002", name: "น้องชิม มีสุข", class: "ม.5/1", score: 720 },
    { id: "STD003", name: "น้องฟ้า ใสกระจ่าง", class: "ม.5/2", score: 650 },
  ];

  for (const s of students) {
    const hash = await bcrypt.hash(s.id, 10);
    await prisma.student.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        class: s.class,
        score: s.score,
        level: Math.floor(s.score / 100) + 1,
        passwordHash: hash,
        passwordChanged: false,
      },
    });
  }

  // Demo announcement
  await prisma.announcement.create({
    data: {
      title: "ยินดีต้อนรับสู่ PimChim+!",
      body: "ระบบสะสมแต้มและโชว์ความเก่งของนักเรียน เริ่มใช้งานได้เลย สนุก ง่าย ได้ความรู้!",
      createdBy: "อาจารย์สมศรี ใจดี",
    },
  });

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
