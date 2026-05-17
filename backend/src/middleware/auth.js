// src/middleware/auth.js
const jwt = require("jsonwebtoken");

// Verify JWT token
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// Allow only teachers
function teacherOnly(req, res, next) {
  if (req.user?.role !== "TEACHER") {
    return res.status(403).json({ message: "Teacher access only" });
  }
  next();
}

// Allow only students
function studentOnly(req, res, next) {
  if (req.user?.role !== "STUDENT") {
    return res.status(403).json({ message: "Student access only" });
  }
  next();
}

module.exports = { authenticate, teacherOnly, studentOnly };
