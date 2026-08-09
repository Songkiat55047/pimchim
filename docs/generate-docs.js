const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, PageBreak, HorizontalPositionRelativeFrom,
  ShadingType, Header, Footer, PageNumber,
} = require("docx");
const fs = require("fs");

const BRAND = "PimChim+";
const DATE = new Date().toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });

// ── Helpers ──────────────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: 24, font: "Sarabun", ...opts })],
    spacing: { before: 80, after: 80 },
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 24, font: "Sarabun" })],
    spacing: { before: 40, after: 40 },
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 20, color: "1F4E79" })],
    spacing: { before: 40, after: 40 },
    indent: { left: 720 },
    shading: { type: ShadingType.SOLID, color: "F5F5F5", fill: "F5F5F5" },
  });
}

function divider() {
  return new Paragraph({ text: "─".repeat(80), spacing: { before: 100, after: 100 } });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function tableRow(cells, isHeader = false) {
  return new TableRow({
    children: cells.map(cell =>
      new TableCell({
        children: [new Paragraph({
          children: [new TextRun({
            text: String(cell),
            bold: isHeader,
            size: isHeader ? 22 : 20,
            font: "Sarabun",
            color: isHeader ? "FFFFFF" : "000000",
          })],
          alignment: AlignmentType.LEFT,
        })],
        shading: isHeader ? { type: ShadingType.SOLID, color: "1F6B3A", fill: "1F6B3A" } : {},
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      })
    ),
  });
}

function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      tableRow(headers, true),
      ...rows.map(r => tableRow(r)),
    ],
  });
}

// ── Cover Page ────────────────────────────────────────────────────────────────

function coverPage(title, subtitle) {
  return [
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      children: [new TextRun({ text: BRAND, bold: true, size: 72, color: "1F6B3A", font: "Sarabun" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 40, color: "2E74B5", font: "Sarabun" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, size: 28, color: "666666", font: "Sarabun" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({ text: "─".repeat(60), alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
    new Paragraph({
      children: [new TextRun({ text: `วันที่จัดทำ: ${DATE}`, size: 24, font: "Sarabun" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Version 1.0", size: 24, font: "Sarabun", color: "888888" })],
      alignment: AlignmentType.CENTER,
    }),
    pageBreak(),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT 1: USER MANUAL
// ══════════════════════════════════════════════════════════════════════════════

async function generateUserManual() {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Sarabun", size: 24 } },
        heading1: { run: { font: "Sarabun", size: 36, bold: true, color: "1F6B3A" } },
        heading2: { run: { font: "Sarabun", size: 28, bold: true, color: "2E74B5" } },
        heading3: { run: { font: "Sarabun", size: 24, bold: true, color: "333333" } },
      },
    },
    sections: [{
      children: [
        // Cover
        ...coverPage("USER MANUAL", "คู่มือการใช้งานระบบ"),

        // 1. Overview
        h1("1. ภาพรวมระบบ (System Overview)"),
        p("PimChim+ คือระบบจัดการคะแนนสะสมนักเรียนบนเว็บแอปพลิเคชัน ออกแบบมาเพื่อช่วยครูในการติดตาม มอบรางวัล และจัดการคะแนนของนักเรียน ในขณะที่นักเรียนสามารถติดตามความก้าวหน้าและการจัดอันดับของตัวเองได้"),
        p(""),
        p("URL เว็บไซต์: https://pimchimplus.netlify.app", { bold: true }),
        p(""),
        h3("บทบาทผู้ใช้งาน"),
        makeTable(
          ["บทบาท", "คำอธิบาย"],
          [
            ["ครู / แอดมิน", "เข้าถึงได้ทุกฟีเจอร์ — จัดการนักเรียน ให้คะแนน โพสต์ประกาศ มอบหมายงาน ดูวิเคราะห์"],
            ["นักเรียน", "เข้าถึงได้เฉพาะอ่าน — ดูคะแนนของตัวเอง อันดับ ประกาศ และงานที่มอบหมาย"],
          ]
        ),

        pageBreak(),

        // 2. Getting Started
        h1("2. เริ่มต้นใช้งาน (Getting Started)"),

        h2("2.1 การตั้งค่าครั้งแรก (First-Time Setup)"),
        p("หากยังไม่มีบัญชีครูในระบบ:"),
        bullet("เข้าไปที่: https://pimchimplus.netlify.app/setup"),
        bullet("กรอก ชื่อครู, Username (ภาษาอังกฤษ เช่น teacher01), และ Password (อย่างน้อย 6 ตัวอักษร)"),
        bullet("คลิก สร้างบัญชีครู"),
        bullet("ระบบจะพาไปหน้า Login โดยอัตโนมัติ"),
        p("หมายเหตุ: หน้านี้จะถูกปิดอัตโนมัติหลังจากสร้างบัญชีแรกแล้ว", { italics: true, color: "888888" }),

        h2("2.2 การสมัครสมาชิกครูเพิ่มเติม"),
        bullet("ไปที่หน้า Login → คลิก สมัครสมาชิก"),
        bullet("กรอก ชื่อ-นามสกุล, Username, และ Password"),
        bullet("เข้าสู่ระบบด้วยข้อมูลที่สมัคร"),

        h2("2.3 การเข้าสู่ระบบ (Login)"),
        bullet("ไปที่ https://pimchimplus.netlify.app"),
        bullet("เลือกแท็บ: ครู / แอดมิน หรือ นักเรียน"),
        bullet("กรอก Username และ Password"),
        bullet("คลิก เข้าสู่ระบบ"),

        h2("2.4 ภาษา (TH / EN)"),
        p("ทุกหน้าจะมีปุ่มสลับภาษา EN / TH (มุมขวาบนบนเดสก์ท็อป, แถบบนบนมือถือ) คลิกเพื่อสลับภาษาทั้งระบบระหว่างไทยและอังกฤษได้ทุกเมื่อ — ระบบจะจำการตั้งค่านี้ไว้บนอุปกรณ์"),

        pageBreak(),

        // 3. Teacher Guide
        h1("3. คู่มือสำหรับครู / แอดมิน"),

        h2("3.1 หน้าหลัก (Dashboard)"),
        p("แสดงสรุปภาพรวมของระบบ:"),
        makeTable(
          ["ข้อมูล", "คำอธิบาย"],
          [
            ["จำนวนนักเรียน", "นักเรียนทั้งหมดในระบบ"],
            ["แต้มรวม", "คะแนนสะสมรวมของทุกคน"],
            ["ประกาศ", "จำนวนประกาศที่มีอยู่"],
            ["งานมอบหมาย", "จำนวนงานที่มอบหมาย"],
            ["อันดับ 1", "นักเรียนที่มีคะแนนสูงสุด"],
          ]
        ),

        h2("3.2 จัดการนักเรียน (/teacher/students)"),
        h3("เพิ่มนักเรียนรายคน"),
        bullet("คลิก + เพิ่มนักเรียน"),
        bullet("กรอก รหัสนักเรียน (เช่น STD001), ชื่อ-นามสกุล, ห้องเรียน (เช่น ม.5/1)"),
        bullet("คลิก บันทึก"),
        p("หมายเหตุ: รหัสผ่านเริ่มต้น = รหัสนักเรียน (นักเรียนต้องเปลี่ยนเมื่อ Login ครั้งแรก)", { italics: true, color: "888888" }),

        h3("นำเข้าข้อมูลจาก Excel (Bulk Import)"),
        bullet("คลิก นำเข้า Excel"),
        bullet("อัปโหลดไฟล์ .xlsx ที่มีคอลัมน์: A = รหัสนักเรียน, B = ชื่อ-นามสกุล, C = ห้องเรียน"),
        bullet("คลิก อัปโหลด"),

        h3("แก้ไขนักเรียน"),
        bullet("คลิกไอคอน แก้ไข ข้างชื่อนักเรียน"),
        bullet("แก้ไขชื่อหรือห้องเรียน"),
        bullet("ติ๊ก รีเซ็ตรหัสผ่าน หากต้องการรีเซ็ตกลับเป็นรหัสนักเรียน"),
        bullet("คลิก บันทึก"),

        h2("3.3 ให้คะแนน (/teacher/scores)"),
        bullet("ค้นหาหรือเลือกนักเรียน"),
        bullet("กรอก คะแนน (ตัวเลขบวก = เพิ่ม, ลบ = หัก)"),
        bullet("กรอก หมายเหตุ (เหตุผล)"),
        bullet("คลิก ให้คะแนน"),
        p("ระดับจะคำนวณอัตโนมัติ: Level = floor(score / 100) + 1", { italics: true, color: "888888" }),

        h2("3.4 ประกาศ (/teacher/announcements)"),
        bullet("คลิก + สร้างประกาศ → กรอกหัวข้อและเนื้อหา → คลิก เผยแพร่"),
        bullet("ลบประกาศโดยคลิกไอคอนลบ"),

        h2("3.5 งานมอบหมาย (/teacher/assignments)"),
        bullet("คลิก + มอบหมายงาน"),
        bullet("กรอก ชื่องาน, รายละเอียด (ไม่บังคับ), กำหนดส่ง"),
        bullet("คลิก บันทึก"),

        h2("3.6 วิเคราะห์ข้อมูล (/teacher/analytics)"),
        makeTable(
          ["กราฟ", "ประเภท", "แสดงข้อมูล"],
          [
            ["การกระจายตัวของคะแนน", "Bar Chart", "จำนวนนักเรียนในแต่ละช่วงคะแนน"],
            ["สัดส่วนระดับนักเรียน", "Pie Chart", "สัดส่วนนักเรียนแต่ละระดับ"],
            ["คะแนนเฉลี่ยตามห้องเรียน", "Horizontal Bar", "คะแนนเฉลี่ยแต่ละห้อง"],
            ["Top 10 นักเรียน", "Horizontal Bar", "10 อันดับคะแนนสูงสุด"],
            ["สถานะการเปลี่ยนรหัสผ่าน", "Donut Chart", "สัดส่วนการเปลี่ยนรหัสผ่าน"],
          ]
        ),

        pageBreak(),

        // 4. Student Guide
        h1("4. คู่มือสำหรับนักเรียน"),

        h2("4.1 Login ครั้งแรก — การเปลี่ยนรหัสผ่าน"),
        p("นักเรียนที่ครูเพิ่มให้จะมีรหัสผ่านเริ่มต้น = รหัสนักเรียน (เช่น STD001)"),
        bullet("Login ด้วย รหัสนักเรียน ทั้ง Username และ Password"),
        bullet("ระบบจะแสดงหน้า เปลี่ยนรหัสผ่าน โดยอัตโนมัติ"),
        bullet("กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) และคลิก ยืนยัน"),
        p("หมายเหตุ: ไม่สามารถใช้งานระบบได้จนกว่าจะเปลี่ยนรหัสผ่าน", { italics: true, color: "888888" }),

        h2("4.2 หน้าหลักนักเรียน (/student)"),
        bullet("แสดงชื่อ รหัส และห้องเรียน"),
        bullet("คะแนนสะสมและระดับปัจจุบัน"),
        bullet("ประวัติการได้คะแนนล่าสุด"),

        h2("4.3 คะแนนของฉัน (/student/scores)"),
        p("แสดงประวัติคะแนนทั้งหมด: วันเวลา, คะแนนที่ได้/หัก, เหตุผล, ชื่อครูที่ให้"),

        h2("4.4 อันดับ (/student/leaderboard)"),
        p("แสดง Top 50 นักเรียนจัดอันดับตามคะแนน นักเรียนสามารถดูตำแหน่งของตัวเองได้"),

        h2("4.5 ประกาศ (/student/announcements)"),
        bullet("ดูประกาศทั้งหมดจากครู"),
        bullet("ประกาศที่ยังไม่อ่านจะถูกไฮไลต์"),
        bullet("คลิกเพื่อทำเครื่องหมายว่าอ่านแล้ว"),

        h2("4.6 งาน (/student/assignments)"),
        bullet("ดูงานที่มอบหมายทั้งหมดพร้อมกำหนดส่ง"),
        bullet("งานที่เลยกำหนดส่งจะมีสีแดงแสดงให้เห็น"),

        pageBreak(),

        // 5. Troubleshooting
        h1("5. การแก้ปัญหา (Troubleshooting)"),
        makeTable(
          ["ปัญหา", "วิธีแก้ไข"],
          [
            ["Login ไม่ได้", "ตรวจสอบ Username ให้ถูกต้อง; รหัสผ่านเป็น case-sensitive"],
            ["ข้อความ 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'", "Username หรือ Password ไม่ถูกต้อง; ใช้ /setup หากยังไม่มีบัญชี"],
            ["หน้าเว็บโหลดช้าครั้งแรก", "Backend กำลัง Wake up จาก Sleep รอ 30-50 วินาที"],
            ["นำเข้า Excel ไม่ได้", "ตรวจสอบคอลัมน์: A=รหัส, B=ชื่อ, C=ห้อง; ห้ามมีเซลล์ที่ Merge"],
            ["ลืมรหัสผ่าน (นักเรียน)", "ครูสามารถรีเซ็ตรหัสผ่านจากหน้าจัดการนักเรียน"],
          ]
        ),

        p(""),
        divider(),
        p("PimChim+ — สร้างด้วย React, Node.js, PostgreSQL", { color: "888888", italics: true }),
        p(`จัดทำเมื่อ: ${DATE}`, { color: "888888", italics: true }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("USER_MANUAL.docx", buffer);
  console.log("✅ USER_MANUAL.docx created");
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT 2: TECHNICAL DOCUMENTATION
// ══════════════════════════════════════════════════════════════════════════════

async function generateTechnicalDoc() {
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Sarabun", size: 24 } },
        heading1: { run: { font: "Sarabun", size: 36, bold: true, color: "1F6B3A" } },
        heading2: { run: { font: "Sarabun", size: 28, bold: true, color: "2E74B5" } },
        heading3: { run: { font: "Sarabun", size: 24, bold: true, color: "333333" } },
      },
    },
    sections: [{
      children: [
        // Cover
        ...coverPage("TECHNICAL DOCUMENTATION", "เอกสารสถาปัตยกรรมและข้อมูลเชิงเทคนิค"),

        // 1. Architecture
        h1("1. สถาปัตยกรรมระบบ (System Architecture)"),
        p("PimChim+ ใช้สถาปัตยกรรม 3 ชั้น (3-Tier Architecture):"),
        p(""),
        makeTable(
          ["ชั้น", "ส่วนประกอบ", "เทคโนโลยี"],
          [
            ["Client Tier", "Web Browser", "React SPA (Vite), Tailwind CSS, Zustand, Axios, Recharts"],
            ["Application Tier", "REST API Server", "Node.js, Express.js, Prisma ORM, JWT, bcryptjs"],
            ["Data Tier", "Database", "PostgreSQL 15 (Neon Serverless)"],
          ]
        ),

        pageBreak(),

        // 2. Tech Stack
        h1("2. เทคโนโลยีที่ใช้ (Technology Stack)"),

        h2("2.1 Frontend"),
        makeTable(
          ["เทคโนโลยี", "Version", "วัตถุประสงค์"],
          [
            ["React", "18.2.0", "UI Framework"],
            ["Vite", "5.1.0", "Build Tool & Dev Server"],
            ["React Router DOM", "6.22.0", "Client-side Routing"],
            ["Zustand", "4.5.1", "Global State Management"],
            ["Axios", "1.6.7", "HTTP Client with Interceptors"],
            ["Tailwind CSS", "3.4.19", "Utility-first CSS Framework"],
            ["Recharts", "2.12.7", "Data Visualization / Charts"],
            ["XLSX", "0.18.5", "Excel File Parsing"],
          ]
        ),

        h2("2.2 Backend"),
        makeTable(
          ["เทคโนโลยี", "Version", "วัตถุประสงค์"],
          [
            ["Node.js", "24.x", "JavaScript Runtime"],
            ["Express.js", "4.18.2", "HTTP Framework"],
            ["Prisma ORM", "5.10.0", "Database ORM & Migrations"],
            ["jsonwebtoken", "9.0.2", "JWT Creation & Verification"],
            ["bcryptjs", "2.4.3", "Password Hashing"],
            ["Multer", "1.4.5", "Multipart File Upload"],
            ["cors", "2.8.5", "Cross-Origin Resource Sharing"],
          ]
        ),

        h2("2.3 Infrastructure / Hosting"),
        makeTable(
          ["บริการ", "ผู้ให้บริการ", "วัตถุประสงค์", "แผน"],
          [
            ["Frontend Hosting", "Netlify", "Static Site + CDN", "Free"],
            ["Backend Hosting", "Render", "Node.js Web Service", "Free"],
            ["Database", "Neon", "Serverless PostgreSQL", "Free (0.5GB)"],
            ["Source Control", "GitHub", "Code Repository & CI/CD", "Free"],
          ]
        ),

        pageBreak(),

        // 3. Functional Diagram
        h1("3. แผนภาพฟังก์ชันการทำงาน (Functional Diagram)"),

        h2("3.1 บทบาทและสิทธิ์การเข้าถึง"),
        makeTable(
          ["ฟีเจอร์", "ครู/แอดมิน", "นักเรียน"],
          [
            ["Register / Setup", "✅", "❌"],
            ["Login", "✅", "✅"],
            ["จัดการนักเรียน (CRUD)", "✅", "❌"],
            ["นำเข้าข้อมูล Excel", "✅", "❌"],
            ["ให้/หักคะแนน", "✅", "❌"],
            ["ดูประวัติคะแนนทุกคน", "✅", "ดูเฉพาะตัวเอง"],
            ["สร้างประกาศ", "✅", "❌"],
            ["ดูประกาศ", "✅", "✅"],
            ["สร้างงานมอบหมาย", "✅", "❌"],
            ["ดูงานมอบหมาย", "✅", "✅"],
            ["ดูวิเคราะห์/กราฟ", "✅", "❌"],
            ["ดู Leaderboard", "✅", "✅"],
            ["เปลี่ยนรหัสผ่าน", "❌", "✅"],
          ]
        ),

        h2("3.2 Authentication Flow"),
        p("1. ผู้ใช้กรอก username, password, role และส่ง POST /api/auth/login"),
        p("2. Server ค้นหา user ในฐานข้อมูล"),
        p("3. ตรวจสอบรหัสผ่านด้วย bcrypt.compare()"),
        p("4. สร้าง JWT token ด้วย jwt.sign({ id, role, name }, JWT_SECRET, { expiresIn: '7d' })"),
        p("5. Client เก็บ token ใน localStorage"),
        p("6. ทุก Request ถัดไปแนบ Authorization: Bearer <token>"),
        p("7. Server ตรวจสอบ token ด้วย jwt.verify() ก่อนทุก endpoint"),

        pageBreak(),

        // 4. Data Schema
        h1("4. โครงสร้างฐานข้อมูล (Data Schema)"),

        h2("4.1 ตาราง User"),
        p("เก็บข้อมูลบัญชีครู/แอดมิน"),
        makeTable(
          ["Column", "Type", "Constraints", "คำอธิบาย"],
          [
            ["id", "TEXT", "PK, CUID", "รหัสเฉพาะ (auto-generated)"],
            ["username", "TEXT", "UNIQUE, NOT NULL", "ชื่อผู้ใช้สำหรับ Login"],
            ["passwordHash", "TEXT", "NOT NULL", "รหัสผ่านที่เข้ารหัสด้วย bcrypt"],
            ["role", "Role ENUM", "DEFAULT 'TEACHER'", "บทบาท (TEACHER)"],
            ["name", "TEXT", "NOT NULL", "ชื่อ-นามสกุล"],
            ["createdAt", "TIMESTAMP", "DEFAULT now()", "วันที่สร้างบัญชี"],
          ]
        ),

        h2("4.2 ตาราง Student"),
        p("เก็บข้อมูลนักเรียนและคะแนนสะสม"),
        makeTable(
          ["Column", "Type", "Constraints", "คำอธิบาย"],
          [
            ["id", "TEXT", "PK", "รหัสนักเรียน (เช่น STD001)"],
            ["name", "TEXT", "NOT NULL", "ชื่อ-นามสกุล"],
            ["class", "TEXT", "NOT NULL", "ห้องเรียน (เช่น ม.5/1)"],
            ["score", "INTEGER", "DEFAULT 0", "คะแนนสะสมรวม"],
            ["level", "INTEGER", "DEFAULT 1", "ระดับ = floor(score/100) + 1"],
            ["passwordHash", "TEXT", "NOT NULL", "รหัสผ่านที่เข้ารหัส"],
            ["passwordChanged", "BOOLEAN", "DEFAULT false", "ตรวจสอบว่าเปลี่ยนรหัสผ่านแล้วหรือยัง"],
            ["createdAt", "TIMESTAMP", "DEFAULT now()", "วันที่เพิ่มนักเรียน"],
          ]
        ),

        h2("4.3 ตาราง ScoreLog"),
        p("บันทึกประวัติการเปลี่ยนแปลงคะแนนทุกครั้ง (Audit Trail)"),
        makeTable(
          ["Column", "Type", "Constraints", "คำอธิบาย"],
          [
            ["id", "TEXT", "PK, CUID", "รหัสเฉพาะ"],
            ["studentId", "TEXT", "FK → Student(id) CASCADE", "อ้างอิงนักเรียน"],
            ["delta", "INTEGER", "NOT NULL", "คะแนนที่เปลี่ยน (+ เพิ่ม, - หัก)"],
            ["description", "TEXT", "NOT NULL", "เหตุผล"],
            ["givenBy", "TEXT", "NOT NULL", "ชื่อครูที่ให้คะแนน"],
            ["createdAt", "TIMESTAMP", "DEFAULT now()", "วันเวลาที่ให้คะแนน"],
          ]
        ),

        h2("4.4 ตาราง Announcement"),
        makeTable(
          ["Column", "Type", "Constraints", "คำอธิบาย"],
          [
            ["id", "TEXT", "PK, CUID", "รหัสเฉพาะ"],
            ["title", "TEXT", "NOT NULL", "หัวข้อประกาศ"],
            ["body", "TEXT", "NOT NULL", "เนื้อหาประกาศ"],
            ["createdBy", "TEXT", "NOT NULL", "ชื่อครูที่โพสต์"],
            ["createdAt", "TIMESTAMP", "DEFAULT now()", "วันเวลาที่โพสต์"],
          ]
        ),

        h2("4.5 ตาราง AnnouncementRead"),
        p("ติดตามว่านักเรียนคนไหนอ่านประกาศใดแล้ว"),
        makeTable(
          ["Column", "Type", "Constraints", "คำอธิบาย"],
          [
            ["id", "TEXT", "PK, CUID", "รหัสเฉพาะ"],
            ["announcementId", "TEXT", "FK → Announcement(id) CASCADE", "อ้างอิงประกาศ"],
            ["studentId", "TEXT", "FK → Student(id) CASCADE", "อ้างอิงนักเรียน"],
            ["readAt", "TIMESTAMP", "DEFAULT now()", "วันเวลาที่อ่าน"],
            ["—", "—", "UNIQUE(announcementId, studentId)", "อ่านได้ครั้งเดียวต่อประกาศ"],
          ]
        ),

        h2("4.6 ตาราง Assignment"),
        makeTable(
          ["Column", "Type", "Constraints", "คำอธิบาย"],
          [
            ["id", "TEXT", "PK, CUID", "รหัสเฉพาะ"],
            ["title", "TEXT", "NOT NULL", "ชื่องาน"],
            ["description", "TEXT", "NULLABLE", "รายละเอียด (ไม่บังคับ)"],
            ["dueDate", "TIMESTAMP", "NOT NULL", "กำหนดส่ง"],
            ["createdBy", "TEXT", "NOT NULL", "ชื่อครูที่มอบหมาย"],
            ["createdAt", "TIMESTAMP", "DEFAULT now()", "วันที่มอบหมาย"],
          ]
        ),

        pageBreak(),

        // 5. API Reference
        h1("5. API Reference"),
        p("Base URL: https://pimchim.onrender.com/api"),
        p("Authentication: Authorization: Bearer <JWT_TOKEN>"),

        h2("5.1 Auth Endpoints"),
        makeTable(
          ["Method", "Endpoint", "Auth", "คำอธิบาย"],
          [
            ["POST", "/auth/register", "None", "สมัครสมาชิกครูใหม่"],
            ["POST", "/auth/setup", "None", "สร้างครูคนแรก (ครั้งเดียว)"],
            ["POST", "/auth/login", "None", "Login สำหรับครูและนักเรียน"],
            ["POST", "/auth/change-password", "Student", "เปลี่ยนรหัสผ่านนักเรียน"],
            ["GET", "/auth/me", "Any", "ดูข้อมูลผู้ใช้ปัจจุบัน"],
          ]
        ),

        h2("5.2 Student Endpoints"),
        makeTable(
          ["Method", "Endpoint", "Auth", "คำอธิบาย"],
          [
            ["GET", "/students", "Teacher", "ดูรายชื่อนักเรียนทั้งหมด"],
            ["POST", "/students", "Teacher", "เพิ่มนักเรียน"],
            ["PUT", "/students/:id", "Teacher", "แก้ไขข้อมูลนักเรียน"],
            ["DELETE", "/students/:id", "Teacher", "ลบนักเรียน"],
            ["POST", "/students/import", "Teacher", "นำเข้าจาก Excel"],
            ["GET", "/students/leaderboard", "Teacher", "Top 50 นักเรียน"],
          ]
        ),

        h2("5.3 Score Endpoints"),
        makeTable(
          ["Method", "Endpoint", "Auth", "คำอธิบาย"],
          [
            ["GET", "/scores/leaderboard", "Any", "Top 50 อันดับ"],
            ["GET", "/scores/:studentId/history", "Teacher / Own Student", "ประวัติคะแนน"],
            ["POST", "/scores/:studentId", "Teacher", "ให้/หักคะแนน"],
          ]
        ),

        h2("5.4 Announcement & Assignment Endpoints"),
        makeTable(
          ["Method", "Endpoint", "Auth", "คำอธิบาย"],
          [
            ["GET", "/announcements", "Any", "ดูประกาศทั้งหมด"],
            ["POST", "/announcements", "Teacher", "สร้างประกาศ"],
            ["DELETE", "/announcements/:id", "Teacher", "ลบประกาศ"],
            ["POST", "/announcements/:id/read", "Student", "ทำเครื่องหมายอ่านแล้ว"],
            ["GET", "/assignments", "Any", "ดูงานทั้งหมด"],
            ["POST", "/assignments", "Teacher", "สร้างงาน"],
            ["DELETE", "/assignments/:id", "Teacher", "ลบงาน"],
          ]
        ),

        pageBreak(),

        // 6. Deployment
        h1("6. การ Deploy ระบบ (Deployment Architecture)"),

        h2("6.1 CI/CD Pipeline"),
        p("ระบบใช้ GitHub เป็น Source Control และ Webhook เชื่อมต่อกับ Netlify และ Render เพื่อ Auto-deploy:"),
        bullet("Developer push code ไปที่ GitHub branch main"),
        bullet("GitHub ส่ง Webhook แจ้ง Netlify → Build Frontend → Deploy"),
        bullet("GitHub ส่ง Webhook แจ้ง Render → Build Backend → Restart Server"),

        h2("6.2 Environment Variables"),
        makeTable(
          ["Platform", "Variable", "ค่า", "คำอธิบาย"],
          [
            ["Netlify", "VITE_API_URL", "https://pimchim.onrender.com/api", "URL ของ Backend API"],
            ["Render", "DATABASE_URL", "postgresql://...neon.tech/...", "Connection string ของ Neon"],
            ["Render", "JWT_SECRET", "<strong random string>", "Secret key สำหรับ JWT"],
            ["Render", "FRONTEND_URL", "https://pimchimplus.netlify.app", "URL สำหรับ CORS"],
          ]
        ),

        pageBreak(),

        // 7. Security
        h1("7. ความปลอดภัย (Security)"),
        makeTable(
          ["ด้าน", "มาตรการ"],
          [
            ["Password", "เข้ารหัสด้วย bcrypt (cost=10) ก่อนบันทึกในฐานข้อมูล"],
            ["Authentication", "JWT Token (7 วัน), ส่งผ่าน Authorization: Bearer header"],
            ["Authorization", "Middleware ตรวจสอบ role ก่อนทุก endpoint ที่ต้องการสิทธิ์"],
            ["CORS", "อนุญาตเฉพาะ origin ที่ระบุใน FRONTEND_URL"],
            ["Database", "เชื่อมต่อด้วย SSL (sslmode=require)"],
            ["Secrets", "เก็บใน Environment Variables ไม่ commit ลง git"],
            ["Input Validation", "ตรวจสอบ required fields, minimum password length, duplicate IDs"],
          ]
        ),

        p(""),
        divider(),
        p("PimChim+ Technical Documentation v1.0", { color: "888888", italics: true }),
        p(`จัดทำเมื่อ: ${DATE}`, { color: "888888", italics: true }),
        p("Stack: React · Node.js · Express · Prisma · PostgreSQL", { color: "888888", italics: true }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("TECHNICAL_DOCUMENTATION.docx", buffer);
  console.log("✅ TECHNICAL_DOCUMENTATION.docx created");
}

// ── Run ───────────────────────────────────────────────────────────────────────

(async () => {
  await generateUserManual();
  await generateTechnicalDoc();
  console.log("\n📄 Both documents generated in docs/ folder");
})();
