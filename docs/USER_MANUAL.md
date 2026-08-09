# PimChim+ User Manual
**Version 1.0 | ระบบสะสมแต้มและจัดการนักเรียน**

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Getting Started](#2-getting-started)
3. [Teacher / Admin Guide](#3-teacher--admin-guide)
4. [Student Guide](#4-student-guide)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. System Overview

**PimChim+** is a web-based student point management system designed for classroom use. It allows teachers to track, award, and manage student scores, while students can monitor their own progress and rankings.

### Access URL
- **Website:** https://pimchimplus.netlify.app

### User Roles
| Role | Description |
|------|-------------|
| **Teacher / Admin** | Full access — manage students, award scores, post announcements, assignments, view analytics |
| **Student** | Read-only access — view own scores, leaderboard, announcements, and assignments |

---

## 2. Getting Started

### 2.1 First-Time Setup (Admin Only)
If no teacher account exists yet:

1. Visit: `https://pimchimplus.netlify.app/setup`
2. Fill in:
   - **ชื่อครู** — Teacher's full name
   - **Username** — Login username (English, e.g. `teacher01`)
   - **Password** — At least 6 characters
3. Click **สร้างบัญชีครู**
4. You will be redirected to the login page

> This page is disabled automatically after the first account is created.

### 2.2 Teacher Registration
Additional teachers can register at:

1. Visit the login page → click **สมัครสมาชิก**
2. Fill in name, username, and password
3. Log in with the new credentials

### 2.3 Login
1. Go to `https://pimchimplus.netlify.app`
2. Select tab: **ครู / แอดมิน** or **นักเรียน**
3. Enter username and password
4. Click **เข้าสู่ระบบ**

### 2.4 Language (TH / EN)

Every page has an **EN / TH** toggle button (top-right on desktop, top bar on mobile). Click it to switch the entire interface between Thai and English at any time — your choice is remembered on the device.

---

## 3. Teacher / Admin Guide

### 3.1 Dashboard (หน้าหลัก)
The dashboard displays a summary of the system:
- Total number of students
- Total accumulated points
- Number of announcements
- Number of assignments
- Top-ranked student

**Path:** `/teacher`

---

### 3.2 Manage Students (จัดการนักเรียน)
**Path:** `/teacher/students`

#### Add a Single Student
1. Click **+ เพิ่มนักเรียน**
2. Enter:
   - **รหัสนักเรียน** — Student ID (e.g. `STD001`)
   - **ชื่อ-นามสกุล** — Full name
   - **ห้องเรียน** — Class (e.g. `ม.5/1`)
3. Click **บันทึก**

> Default password = Student ID (student must change on first login)

#### Bulk Import via Excel
1. Click **นำเข้า Excel**
2. Upload an `.xlsx` file with columns:
   - Column A: Student ID
   - Column B: Full Name
   - Column C: Class
3. Click **อัปโหลด**

#### Edit Student
1. Click the **edit icon** next to a student
2. Modify name or class
3. Optionally tick **รีเซ็ตรหัสผ่าน** to reset password back to Student ID
4. Click **บันทึก**

#### Delete Student
1. Click the **delete icon** next to a student
2. Confirm deletion

> Deleting a student removes all their score history permanently.

---

### 3.3 Give Scores (ให้คะแนน)
**Path:** `/teacher/scores`

1. Search or select a student
2. Enter:
   - **คะแนน** — Points (positive to add, negative to deduct)
   - **หมายเหตุ** — Reason/description
3. Click **ให้คะแนน**

> Student level is automatically recalculated: `Level = floor(score / 100) + 1`

---

### 3.4 Announcements (ประกาศ)
**Path:** `/teacher/announcements`

#### Create Announcement
1. Click **+ สร้างประกาศ**
2. Enter title and body
3. Click **เผยแพร่**

#### Delete Announcement
- Click the **delete icon** on any announcement

> Students can see when each announcement was read.

---

### 3.5 Assignments (งานมอบหมาย)
**Path:** `/teacher/assignments`

#### Create Assignment
1. Click **+ มอบหมายงาน**
2. Enter:
   - **ชื่องาน** — Title
   - **รายละเอียด** — Description (optional)
   - **กำหนดส่ง** — Due date
3. Click **บันทึก**

#### Delete Assignment
- Click the **delete icon** on any assignment

---

### 3.6 Analytics (วิเคราะห์ข้อมูล)
**Path:** `/teacher/analytics`

Provides visual charts:

| Chart | Description |
|-------|-------------|
| Score Distribution | Bar chart — number of students in each score range |
| Level Distribution | Pie chart — proportion of students at each level |
| Class Average | Horizontal bar — average score per class |
| Top 10 Students | Horizontal bar — highest scoring students |
| Password Status | Donut chart — students who changed vs. haven't changed password |
| Summary Panel | Quick stats: total students, classes, high-level students |

---

### 3.7 Leaderboard (อันดับคะแนน)
**Path:** `/teacher/leaderboard`

Displays top 50 students ranked by score. Shows rank, name, class, score, and level.

---

## 4. Student Guide

### 4.1 First Login — Password Change
Students added by a teacher have their Student ID as the default password (e.g. `STD001`).

1. Log in with Student ID as both username and password
2. System prompts **เปลี่ยนรหัสผ่าน**
3. Enter a new password (minimum 6 characters)
4. Click **ยืนยัน**

> You cannot access the system until the password is changed.

---

### 4.2 Dashboard (หน้าหลัก)
**Path:** `/student`

Displays:
- Student name, ID, and class
- Current score and level
- Recent score history

---

### 4.3 My Scores (คะแนนของฉัน)
**Path:** `/student/scores`

Shows full score history including:
- Date and time
- Points given/deducted
- Reason
- Teacher who awarded the score

---

### 4.4 Leaderboard (อันดับ)
**Path:** `/student/leaderboard`

Shows top 50 students ranked by score. Students can see where they rank among their peers.

---

### 4.5 Announcements (ประกาศ)
**Path:** `/student/announcements`

- View all announcements from teachers
- Unread announcements are highlighted
- Click to mark as read

---

### 4.6 Assignments (งาน)
**Path:** `/student/assignments`

- View all assignments with due dates
- Overdue assignments are clearly marked

---

## 5. Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot login | Check username spelling; password is case-sensitive |
| "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" | Wrong username or password; use /setup if no account exists |
| Page loads slowly on first visit | Render backend is waking from sleep — wait 30–50 seconds |
| Scores not saving | Check internet connection; try again |
| Excel import fails | Ensure columns are: A=StudentID, B=Name, C=Class; no merged cells |
| Forgot password | Teacher can reset student password from the Students page |

---

*PimChim+ — Built with React, Node.js, PostgreSQL*
*Hosted on Netlify + Render + Neon*
