// src/api/axios.js
// MOCK MODE - ไม่ต้องการ backend

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ── Mock Database (in-memory) ──
let STUDENTS = [
  { id: "STD001", name: "น้องพิมพ์ สดใส",     class: "ม.5/1", score: 850, level: 9, passwordChanged: true,  createdAt: new Date().toISOString() },
  { id: "STD002", name: "น้องชิม มีสุข",       class: "ม.5/1", score: 720, level: 8, passwordChanged: true,  createdAt: new Date().toISOString() },
  { id: "STD003", name: "น้องฟ้า ใสกระจ่าง",  class: "ม.5/2", score: 650, level: 7, passwordChanged: false, createdAt: new Date().toISOString() },
  { id: "STD004", name: "น้องดาว ประกาย",      class: "ม.5/2", score: 580, level: 6, passwordChanged: true,  createdAt: new Date().toISOString() },
  { id: "STD005", name: "น้องปลา ยิ้มแย้ม",   class: "ม.5/3", score: 430, level: 5, passwordChanged: true,  createdAt: new Date().toISOString() },
];

let SCORE_LOGS = {
  STD001: [
    { id: "l1", studentId: "STD001", delta: 20,  description: "ทำแบบฝึกหัดครบ",      givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*1).toISOString() },
    { id: "l2", studentId: "STD001", delta: 10,  description: "ตอบคำถามในห้อง",       givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*2).toISOString() },
    { id: "l3", studentId: "STD001", delta: -5,  description: "ส่งงานช้า",            givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*3).toISOString() },
    { id: "l4", studentId: "STD001", delta: 15,  description: "Quiz ได้คะแนนเต็ม",   givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*5).toISOString() },
  ],
  STD002: [
    { id: "l5", studentId: "STD002", delta: 10,  description: "ช่วยเพื่อน",           givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*1).toISOString() },
    { id: "l6", studentId: "STD002", delta: 30,  description: "โปรเจกต์กลุ่มดีเด่น", givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*4).toISOString() },
  ],
  STD003: [
    { id: "l7", studentId: "STD003", delta: 50,  description: "แข่งขันวิทยาศาสตร์",  givenBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*2).toISOString() },
  ],
  STD004: [], STD005: [],
};

let ANNOUNCEMENTS = [
  { id: "a1", title: "ยินดีต้อนรับสู่ PimChim+!", body: "ระบบสะสมแต้มเริ่มใช้งานได้แล้ววันนี้ สนุก ง่าย ได้ความรู้!", createdBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*2).toISOString(), reads: [] },
  { id: "a2", title: "Quiz วันศุกร์นี้",          body: "มี Quiz บทที่ 3 วันศุกร์ กรุณาทบทวนให้พร้อม ผู้ที่ได้คะแนนเต็มรับโบนัส +10 แต้ม", createdBy: "อาจารย์สมศรี", createdAt: new Date(Date.now()-86400000*1).toISOString(), reads: [] },
];

let ASSIGNMENTS = [
  { id: "as1", title: "รายงานบทที่ 3", description: "เขียนสรุปบทที่ 3 ความยาวไม่น้อยกว่า 1 หน้า A4", dueDate: new Date(Date.now()+86400000*3).toISOString(), createdBy: "อาจารย์สมศรี", createdAt: new Date().toISOString() },
  { id: "as2", title: "แบบฝึกหัดหน้า 45-50",     description: "ทำแบบฝึกหัดในหนังสือและถ่ายรูปส่ง",                                         dueDate: new Date(Date.now()+86400000*7).toISOString(), createdBy: "อาจารย์สมศรี", createdAt: new Date().toISOString() },
  { id: "as3", title: "โปรเจกต์กลุ่ม",           description: "แบ่งกลุ่ม 4-5 คน ทำ presentation หัวข้อที่สนใจ",                            dueDate: new Date(Date.now()-86400000*1).toISOString(), createdBy: "อาจารย์สมศรี", createdAt: new Date().toISOString() },
];

// ── Router ──
function mockFetch(method, url, body) {
  const u = url.replace(/^\/api/, "");

  // AUTH
  if (method === "GET"  && u === "/auth/me")              return mockMe();
  if (method === "POST" && u === "/auth/change-password") return delay().then(() => ({ data: { message: "ok" } }));

  // STUDENTS
  if (method === "GET"  && u.startsWith("/students") && !u.includes("/import") && !u.includes("/leaderboard")) return mockStudents(u, body);
  if (method === "POST" && u === "/students")             return mockAddStudent(body);
  if (method === "POST" && u === "/students/import")      return delay().then(() => ({ data: { message: "นำเข้าสำเร็จ (mock)", added: 2, skipped: 0 } }));
  if (method === "PUT"  && u.startsWith("/students/"))    return mockEditStudent(u, body);
  if (method === "DELETE" && u.startsWith("/students/"))  return mockDeleteStudent(u);

  // SCORES
  if (method === "GET"  && u === "/scores/leaderboard")         return mockLeaderboard();
  if (method === "GET"  && u.includes("/history"))              return mockHistory(u);
  if (method === "POST" && u.startsWith("/scores/"))            return mockAddScore(u, body);

  // ANNOUNCEMENTS
  if (method === "GET"  && u === "/announcements")              return mockAnnouncements();
  if (method === "POST" && u === "/announcements")              return mockAddAnnouncement(body);
  if (method === "DELETE" && u.startsWith("/announcements/"))   return mockDeleteAnnouncement(u);
  if (method === "POST" && u.includes("/read"))                 return delay().then(() => ({ data: {} }));

  // ASSIGNMENTS
  if (method === "GET"  && u === "/assignments")                return mockAssignments();
  if (method === "POST" && u === "/assignments")                return mockAddAssignment(body);
  if (method === "DELETE" && u.startsWith("/assignments/"))     return mockDeleteAssignment(u);

  return delay().then(() => ({ data: {} }));
}

// ── Handlers ──
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem("pimchim-auth"))?.state?.user; } catch { return null; }
}

async function mockMe() {
  await delay();
  const u = getCurrentUser();
  if (!u || u.role !== "STUDENT") return { data: {} };
  const s = STUDENTS.find((x) => x.id === u.id);
  return { data: { ...s, role: "STUDENT" } };
}

async function mockStudents(u) {
  await delay();
  const params = new URLSearchParams(u.includes("?") ? u.split("?")[1] : "");
  const search = (params.get("search") || "").toLowerCase();
  const cls    = params.get("class") || "";
  let list = STUDENTS;
  if (search) list = list.filter((s) => s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search));
  if (cls)    list = list.filter((s) => s.class === cls);
  return { data: [...list].sort((a, b) => b.score - a.score) };
}

async function mockAddStudent(body) {
  await delay();
  const id = (body?.id || "").toUpperCase();
  if (!id || !body?.name) throw { response: { data: { message: "กรอกข้อมูลไม่ครบ" } } };
  if (STUDENTS.find((s) => s.id === id)) throw { response: { data: { message: "รหัสนักเรียนนี้มีอยู่แล้ว" } } };
  const s = { id, name: body.name, class: body.class || "—", score: 0, level: 1, passwordChanged: false, createdAt: new Date().toISOString() };
  STUDENTS.push(s);
  SCORE_LOGS[id] = [];
  return { data: s };
}

async function mockEditStudent(u, body) {
  await delay();
  const id = u.split("/students/")[1];
  const idx = STUDENTS.findIndex((s) => s.id === id);
  if (idx < 0) throw { response: { data: { message: "ไม่พบนักเรียน" } } };
  if (body?.name)  STUDENTS[idx].name  = body.name;
  if (body?.class) STUDENTS[idx].class = body.class;
  if (body?.resetPassword) STUDENTS[idx].passwordChanged = false;
  return { data: STUDENTS[idx] };
}

async function mockDeleteStudent(u) {
  await delay();
  const id = u.split("/students/")[1];
  STUDENTS = STUDENTS.filter((s) => s.id !== id);
  return { data: { message: "ลบแล้ว" } };
}

async function mockLeaderboard() {
  await delay();
  return { data: [...STUDENTS].sort((a, b) => b.score - a.score) };
}

async function mockHistory(u) {
  await delay();
  const id = u.split("/scores/")[1].split("/history")[0];
  return { data: (SCORE_LOGS[id] || []).slice().reverse() };
}

async function mockAddScore(u, body) {
  await delay();
  const id = u.split("/scores/")[1];
  const idx = STUDENTS.findIndex((s) => s.id === id);
  if (idx < 0) throw { response: { data: { message: "ไม่พบนักเรียน" } } };
  const delta = Number(body?.delta) || 0;
  STUDENTS[idx].score = Math.max(0, STUDENTS[idx].score + delta);
  STUDENTS[idx].level = Math.floor(STUDENTS[idx].score / 100) + 1;
  const log = { id: "l" + Date.now(), studentId: id, delta, description: body?.description || "—", givenBy: getCurrentUser()?.name || "ครู", createdAt: new Date().toISOString() };
  if (!SCORE_LOGS[id]) SCORE_LOGS[id] = [];
  SCORE_LOGS[id].unshift(log);
  return { data: { student: STUDENTS[idx], log } };
}

async function mockAnnouncements() {
  await delay();
  const uid = getCurrentUser()?.id;
  return { data: ANNOUNCEMENTS.slice().reverse().map((a) => ({ ...a, isRead: a.reads.includes(uid) })) };
}

async function mockAddAnnouncement(body) {
  await delay();
  const a = { id: "a" + Date.now(), title: body?.title, body: body?.body, createdBy: getCurrentUser()?.name || "ครู", createdAt: new Date().toISOString(), reads: [] };
  ANNOUNCEMENTS.push(a);
  return { data: a };
}

async function mockDeleteAnnouncement(u) {
  await delay();
  const id = u.split("/announcements/")[1];
  ANNOUNCEMENTS = ANNOUNCEMENTS.filter((a) => a.id !== id);
  return { data: {} };
}

async function mockAssignments() {
  await delay();
  return { data: ASSIGNMENTS };
}

async function mockAddAssignment(body) {
  await delay();
  const a = { id: "as" + Date.now(), title: body?.title, description: body?.description, dueDate: new Date(body?.dueDate).toISOString(), createdBy: getCurrentUser()?.name || "ครู", createdAt: new Date().toISOString() };
  ASSIGNMENTS.push(a);
  return { data: a };
}

async function mockDeleteAssignment(u) {
  await delay();
  const id = u.split("/assignments/")[1];
  ASSIGNMENTS = ASSIGNMENTS.filter((a) => a.id !== id);
  return { data: {} };
}

// ── Axios-compatible interface ──
const api = {
  get:    (url, cfg)       => mockFetch("GET",    url, cfg?.params),
  post:   (url, body, cfg) => mockFetch("POST",   url, body),
  put:    (url, body, cfg) => mockFetch("PUT",    url, body),
  delete: (url, cfg)       => mockFetch("DELETE", url),
  interceptors: { request: { use: () => {} }, response: { use: () => {} } },
};

export default api;
