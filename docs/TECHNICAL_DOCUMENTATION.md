# PimChim+ Technical Documentation
**Version 1.0 | System Architecture, Data Schema & API Reference**

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Functional Diagram](#3-functional-diagram)
4. [Data Schema](#4-data-schema)
5. [API Reference](#5-api-reference)
6. [Deployment Architecture](#6-deployment-architecture)
7. [Security](#7-security)

---

## 1. System Architecture

PimChim+ follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT TIER                         │
│                                                         │
│   Browser  →  React SPA (Vite)                          │
│               • Zustand (state)                         │
│               • Axios (HTTP client)                     │
│               • React Router (navigation)               │
│               • Tailwind CSS (styling)                  │
│               • Recharts (visualization)                │
└───────────────────────┬─────────────────────────────────┘
                        │  HTTPS / JSON REST API
                        │  JWT Bearer Token
┌───────────────────────▼─────────────────────────────────┐
│                    APPLICATION TIER                      │
│                                                         │
│   Node.js + Express.js                                  │
│   • JWT Authentication Middleware                       │
│   • Role-based Authorization (TEACHER / STUDENT)        │
│   • Prisma ORM (database abstraction)                   │
│   • Multer (file upload)                                │
│   • XLSX (Excel parsing)                                │
│   • bcryptjs (password hashing)                         │
└───────────────────────┬─────────────────────────────────┘
                        │  Prisma Client (TCP/SSL)
                        │  PostgreSQL Protocol
┌───────────────────────▼─────────────────────────────────┐
│                      DATA TIER                           │
│                                                         │
│   PostgreSQL 15 (Neon Serverless)                       │
│   • 6 tables                                            │
│   • Foreign key constraints                             │
│   • Cascade deletes                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI framework |
| Vite | 5.1.0 | Build tool & dev server |
| React Router DOM | 6.22.0 | Client-side routing |
| Zustand | 4.5.1 | Global state management |
| Axios | 1.6.7 | HTTP client with interceptors |
| Tailwind CSS | 3.4.19 | Utility-first CSS framework |
| Recharts | 2.12.7 | Data visualization / charts |
| XLSX | 0.18.5 | Excel file parsing |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 24.x | JavaScript runtime |
| Express.js | 4.18.2 | HTTP framework |
| Prisma ORM | 5.10.0 | Database ORM & migrations |
| jsonwebtoken | 9.0.2 | JWT creation & verification |
| bcryptjs | 2.4.3 | Password hashing |
| Multer | 1.4.5 | Multipart file upload |
| XLSX | 0.18.5 | Excel reading |
| dotenv | 16.4.1 | Environment variable loading |
| cors | 2.8.5 | Cross-Origin Resource Sharing |

### Infrastructure
| Service | Provider | Purpose |
|---------|----------|---------|
| Frontend Hosting | Netlify | Static site + CDN |
| Backend Hosting | Render (Free) | Node.js web service |
| Database | Neon (Free) | Serverless PostgreSQL |
| Source Control | GitHub | Code repository & CI/CD trigger |

---

## 3. Functional Diagram

### 3.1 Use Case Diagram

```
                        ┌─────────────────────────────────┐
                        │         PimChim+ System          │
                        │                                  │
  ┌──────────┐          │  ┌─────────────────────────┐    │
  │          │──────────┼─▶│  Register / Setup        │    │
  │ Teacher  │          │  │  Login                   │    │
  │ (Admin)  │──────────┼─▶│  Manage Students (CRUD)  │    │
  │          │──────────┼─▶│  Import Students (Excel) │    │
  │          │──────────┼─▶│  Award / Deduct Scores   │    │
  │          │──────────┼─▶│  Create Announcements    │    │
  │          │──────────┼─▶│  Create Assignments      │    │
  │          │──────────┼─▶│  View Analytics          │    │
  │          │──────────┼─▶│  View Leaderboard        │    │
  └──────────┘          │  └─────────────────────────┘    │
                        │                                  │
  ┌──────────┐          │  ┌─────────────────────────┐    │
  │          │──────────┼─▶│  Login                   │    │
  │ Student  │──────────┼─▶│  Change Password         │    │
  │          │──────────┼─▶│  View Own Scores         │    │
  │          │──────────┼─▶│  View Score History      │    │
  │          │──────────┼─▶│  View Leaderboard        │    │
  │          │──────────┼─▶│  View Announcements      │    │
  │          │──────────┼─▶│  Mark Announcement Read  │    │
  │          │──────────┼─▶│  View Assignments        │    │
  └──────────┘          │  └─────────────────────────┘    │
                        └─────────────────────────────────┘
```

### 3.2 Application Flow Diagram

```
User visits website
        │
        ▼
  ┌─────────────┐     Has valid JWT?     ┌──────────────┐
  │  Login Page │ ──── Yes ──────────▶  │  Dashboard   │
  │  /login     │                       │  (by role)   │
  └─────────────┘                       └──────────────┘
        │
        │ Submit credentials
        ▼
  ┌──────────────────────┐
  │  POST /api/auth/login │
  │  Validate credentials │
  │  Generate JWT token   │
  └──────────────────────┘
        │
        ├── Role = TEACHER ──▶ /teacher (Teacher Dashboard)
        │
        └── Role = STUDENT
                │
                ├── passwordChanged = false ──▶ /change-password
                │
                └── passwordChanged = true ──▶ /student (Student Dashboard)

Teacher Dashboard Routes:
  /teacher                →  Overview stats
  /teacher/students       →  Student management
  /teacher/scores         →  Award scores
  /teacher/analytics      →  Charts & analytics
  /teacher/leaderboard    →  Top 50 ranking
  /teacher/announcements  →  Post announcements
  /teacher/assignments    →  Manage assignments

Student Dashboard Routes:
  /student                →  Profile & recent scores
  /student/scores         →  Full score history
  /student/leaderboard    →  Top 50 ranking
  /student/announcements  →  View & mark as read
  /student/assignments    →  View assignments
```

### 3.3 Authentication Flow

```
Client                          Server
  │                               │
  │── POST /api/auth/login ──────▶│
  │   { username, password, role} │
  │                               │── Find user in DB
  │                               │── bcrypt.compare(password, hash)
  │                               │── jwt.sign({ id, role, name })
  │◀── { token, user, require  ───│
  │      PasswordChange }         │
  │                               │
  │── Store token in localStorage │
  │── Attach to all requests:     │
  │   Authorization: Bearer <JWT> │
  │                               │
  │── GET /api/... ──────────────▶│
  │   + Bearer token              │── jwt.verify(token, JWT_SECRET)
  │                               │── Set req.user
  │◀── Response data ─────────────│
```

---

## 4. Data Schema

### 4.1 Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────────┐         ┌──────────────┐
│     User     │         │     Student      │         │   ScoreLog   │
├──────────────┤         ├──────────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)          │◀────────│ id (PK)      │
│ username     │         │ name             │  1  *   │ studentId(FK)│
│ passwordHash │         │ class            │         │ delta        │
│ role (ENUM)  │         │ score            │         │ description  │
│ name         │         │ level            │         │ givenBy      │
│ createdAt    │         │ passwordHash     │         │ createdAt    │
└──────────────┘         │ passwordChanged  │         └──────────────┘
                         │ createdAt        │
                         └──────┬───────────┘
                                │ 1
                                │
                                │ *
                    ┌───────────▼──────────┐
                    │  AnnouncementRead    │
                    ├──────────────────────┤
                    │ id (PK)              │
                    │ announcementId (FK)  │◀──────────┐
                    │ studentId (FK)       │           │
                    │ readAt               │         1 │
                    └──────────────────────┘           │
                                             ┌─────────┴────┐
                                             │ Announcement  │
                                             ├──────────────┤
                                             │ id (PK)      │
                                             │ title        │
                                             │ body         │
                                             │ createdBy    │
                                             │ createdAt    │
                                             └──────────────┘

┌──────────────┐
│  Assignment  │
├──────────────┤
│ id (PK)      │
│ title        │
│ description  │
│ dueDate      │
│ createdBy    │
│ createdAt    │
└──────────────┘
```

### 4.2 Table Definitions

#### Table: User
Stores teacher/admin accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, CUID | Unique identifier |
| username | TEXT | UNIQUE, NOT NULL | Login username |
| passwordHash | TEXT | NOT NULL | bcrypt hash (cost=10) |
| role | Role ENUM | DEFAULT 'TEACHER' | User role |
| name | TEXT | NOT NULL | Display name |
| createdAt | TIMESTAMP | DEFAULT now() | Account creation time |

#### Table: Student
Stores student accounts and score totals.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK | Student ID (e.g. STD001) |
| name | TEXT | NOT NULL | Full name |
| class | TEXT | NOT NULL | Class/room (e.g. ม.5/1) |
| score | INTEGER | DEFAULT 0 | Accumulated score total |
| level | INTEGER | DEFAULT 1 | Level = floor(score/100)+1 |
| passwordHash | TEXT | NOT NULL | bcrypt hash |
| passwordChanged | BOOLEAN | DEFAULT false | First-login password flag |
| createdAt | TIMESTAMP | DEFAULT now() | Registration time |

#### Table: ScoreLog
Audit trail of all score changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, CUID | Unique identifier |
| studentId | TEXT | FK → Student(id) CASCADE | Student reference |
| delta | INTEGER | NOT NULL | Points change (+ or -) |
| description | TEXT | NOT NULL | Reason for score change |
| givenBy | TEXT | NOT NULL | Teacher name who awarded |
| createdAt | TIMESTAMP | DEFAULT now() | Time of score entry |

#### Table: Announcement
Teacher posts visible to all students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, CUID | Unique identifier |
| title | TEXT | NOT NULL | Announcement title |
| body | TEXT | NOT NULL | Announcement content |
| createdBy | TEXT | NOT NULL | Teacher name |
| createdAt | TIMESTAMP | DEFAULT now() | Post time |

#### Table: AnnouncementRead
Tracks which students read which announcements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, CUID | Unique identifier |
| announcementId | TEXT | FK → Announcement(id) CASCADE | Announcement reference |
| studentId | TEXT | FK → Student(id) CASCADE | Student reference |
| readAt | TIMESTAMP | DEFAULT now() | Time of reading |
| — | — | UNIQUE(announcementId, studentId) | One read record per student per announcement |

#### Table: Assignment
Homework and assignments posted by teachers.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PK, CUID | Unique identifier |
| title | TEXT | NOT NULL | Assignment title |
| description | TEXT | NULLABLE | Optional details |
| dueDate | TIMESTAMP | NOT NULL | Deadline |
| createdBy | TEXT | NOT NULL | Teacher name |
| createdAt | TIMESTAMP | DEFAULT now() | Post time |

### 4.3 Enum Types

```sql
CREATE TYPE "Role" AS ENUM ('TEACHER', 'STUDENT');
```

---

## 5. API Reference

**Base URL:** `https://pimchim.onrender.com/api`

### Authentication
All protected routes require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 5.1 Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | None | Register new teacher |
| POST | /auth/setup | None | Create first teacher (one-time) |
| POST | /auth/login | None | Login for teacher or student |
| POST | /auth/change-password | Student | Change student password |
| GET | /auth/me | Any | Get current user profile |

#### POST /auth/login
```json
Request:  { "username": "admin01", "password": "1234", "role": "teacher" }
Response: { "token": "...", "user": { "id", "name", "role" }, "requirePasswordChange": false }
```

---

### 5.2 Student Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /students | Teacher | List all students (search, filter by class) |
| POST | /students | Teacher | Create single student |
| PUT | /students/:id | Teacher | Update student details |
| DELETE | /students/:id | Teacher | Delete student |
| POST | /students/import | Teacher | Bulk import via Excel |
| GET | /students/leaderboard | Teacher | Top 50 students |

---

### 5.3 Score Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /scores/leaderboard | Any | Top 50 leaderboard |
| GET | /scores/:studentId/history | Teacher or own Student | Score history |
| POST | /scores/:studentId | Teacher | Add score entry |

#### POST /scores/:studentId
```json
Request:  { "delta": 10, "description": "ตอบคำถามได้ถูกต้อง" }
Response: { "student": { ...updated }, "log": { ...scoreLog } }
```

---

### 5.4 Announcement Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /announcements | Any | List all announcements |
| POST | /announcements | Teacher | Create announcement |
| DELETE | /announcements/:id | Teacher | Delete announcement |
| POST | /announcements/:id/read | Student | Mark as read |

---

### 5.5 Assignment Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /assignments | Any | List all assignments |
| POST | /assignments | Teacher | Create assignment |
| DELETE | /assignments/:id | Teacher | Delete assignment |

---

## 6. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        GitHub Repository                     │
│                   github.com/Songkiat55047/pimchim           │
│                        branch: main                          │
└──────────────┬──────────────────────────────┬───────────────┘
               │ webhook (auto-deploy)         │ webhook (auto-deploy)
               ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────────┐
│         NETLIFY           │    │           RENDER              │
│   (Frontend Hosting)      │    │     (Backend Hosting)         │
│                           │    │                              │
│  Build: npm run build     │    │  Build: npm install          │
│  Output: frontend/dist    │    │        (prisma generate)     │
│  URL: pimchimplus.netlify │    │  Start: node src/server.js   │
│       .app                │    │  URL: pimchim.onrender.com   │
│                           │    │                              │
│  Env Vars:                │    │  Env Vars:                   │
│  VITE_API_URL=            │    │  DATABASE_URL=...neon.tech   │
│    .onrender.com/api      │    │  JWT_SECRET=...              │
│                           │    │  FRONTEND_URL=...netlify.app │
└──────────────────────────┘    └──────────────┬───────────────┘
                                                │ Prisma Client (SSL)
                                                ▼
                                ┌──────────────────────────────┐
                                │            NEON               │
                                │    (Serverless PostgreSQL)    │
                                │                              │
                                │  Region: US East             │
                                │  Database: neondb            │
                                │  Free tier: 0.5GB            │
                                └──────────────────────────────┘
```

### CI/CD Pipeline

```
Developer pushes to GitHub (main branch)
        │
        ├──▶ Netlify detects push
        │         │
        │         ├── npm install (frontend)
        │         ├── npm run build (Vite)
        │         └── Deploy to CDN
        │
        └──▶ Render detects push
                  │
                  ├── npm install (backend)
                  ├── prisma generate (postinstall)
                  └── node src/server.js
```

---

## 7. Security

### Authentication & Authorization
- All passwords hashed with **bcrypt** (cost factor 10)
- Sessions managed via **JWT tokens** (7-day expiry)
- Tokens stored in `localStorage` and sent via `Authorization: Bearer` header
- Role-based middleware: `authenticate`, `teacherOnly`, `studentOnly`

### CORS Policy
- Backend only accepts requests from the configured `FRONTEND_URL`
- Configured via `cors` middleware with `credentials: true`

### Data Protection
- `.env` files excluded from git via `.gitignore`
- Secrets (JWT_SECRET, DATABASE_URL) stored in hosting platform environment variables
- Database connection uses `sslmode=require`

### Input Validation
- Required fields validated on all POST/PUT endpoints
- Student ID normalized to uppercase
- Password minimum length: 6 characters
- Duplicate username/student ID rejected with 409 Conflict

### Score Integrity
- Score changes logged in `ScoreLog` table (immutable audit trail)
- Student `score` field updated atomically with the log entry
- Negative deltas allowed (deduction) but total score cannot go below 0

---

*PimChim+ Technical Documentation v1.0*
*Stack: React · Node.js · Express · Prisma · PostgreSQL*
*Hosting: Netlify · Render · Neon*
