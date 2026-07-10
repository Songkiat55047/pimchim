// // src/App.jsx
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ToastProvider } from "./components/ui";
// import AppShell from "./components/AppShell";
// import useAuthStore from "./stores/authStore";

// // Pages
// import LandingPage from "./pages/LandingPage";
// import TeacherLogin from "./pages/TeacherLogin";
// import StudentLogin from "./pages/StudentLogin";
// import ChangePassword from "./pages/ChangePassword";
// import TeacherDashboard from "./pages/teacher/Dashboard";
// import Students from "./pages/teacher/Students";
// import Scores from "./pages/teacher/Scores";
// import StudentDashboard from "./pages/student/Dashboard";
// import StudentScores from "./pages/student/Scores";
// import Leaderboard from "./pages/shared/Leaderboard";
// import Announcements from "./pages/shared/Announcements";
// import Assignments from "./pages/shared/Assignments";
// import StudentProfile from "./pages/student/StudentProfile";

// function RequireAuth({ children, role }) {
//   const { token, user, requirePasswordChange } = useAuthStore();
//   if (!token || !user) return <Navigate to="/" replace />;
//   if (requirePasswordChange) return <Navigate to="/change-password" replace />;
//   if (role && user.role !== role) return <Navigate to="/" replace />;
//   return children;
// }

// function TeacherLayout({ children }) {
//   return (
//     <RequireAuth role="TEACHER">
//       <AppShell>{children}</AppShell>
//     </RequireAuth>
//   );
// }

// function StudentLayout({ children }) {
//   return (
//     <RequireAuth role="STUDENT">
//       <AppShell>{children}</AppShell>
//     </RequireAuth>
//   );
// }

// // Redirect already-logged-in users away from auth pages
// function AuthGuard({ children }) {
//   const { token, user } = useAuthStore();
//   if (token && user) {
//     return <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />;
//   }
//   return children;
// }

// export default function App() {
//   return (
//     <ToastProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* Landing — role selection */}
//           <Route path="/" element={
//             <AuthGuard><LandingPage /></AuthGuard>
//           } />

//           {/* Auth */}
//           <Route path="/login/teacher" element={
//             <AuthGuard><TeacherLogin /></AuthGuard>
//           } />
//           <Route path="/login/student" element={
//             <AuthGuard><StudentLogin /></AuthGuard>
//           } />

//           {/* Legacy redirect — ถ้ามี link เก่าที่ชี้ไป /login */}
//           <Route path="/login" element={<Navigate to="/" replace />} />

//           <Route path="/change-password" element={<ChangePassword />} />

//           {/* Teacher routes */}
//           <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
//           <Route path="/teacher/students" element={<TeacherLayout><Students /></TeacherLayout>} />
//           <Route path="/teacher/scores" element={<TeacherLayout><Scores /></TeacherLayout>} />
//           <Route path="/teacher/leaderboard" element={<TeacherLayout><Leaderboard /></TeacherLayout>} />
//           <Route path="/teacher/announcements" element={<TeacherLayout><Announcements /></TeacherLayout>} />
//           <Route path="/teacher/assignments" element={<TeacherLayout><Assignments /></TeacherLayout>} />

//           {/* Student routes */}
//           <Route path="/student" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
//           <Route path="/student/scores" element={<StudentLayout><StudentScores /></StudentLayout>} />
//           <Route path="/student/leaderboard" element={<StudentLayout><Leaderboard /></StudentLayout>} />
//           <Route path="/student/announcements" element={<StudentLayout><Announcements /></StudentLayout>} />
//           <Route path="/student/assignments" element={<StudentLayout><Assignments /></StudentLayout>} />
//           <Route path="/student/profile" element={<StudentLayout><StudentProfile /></StudentLayout>} />

//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </ToastProvider>
//   );
// }

// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/ui";
import AppShell from "./components/AppShell";
import useAuthStore from "./stores/authStore";

// Pages
import LandingPage from "./pages/LandingPage";
import TeacherLogin from "./pages/TeacherLogin";
import StudentLogin from "./pages/StudentLogin";
import ChangePassword from "./pages/ChangePassword";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherProfile from "./pages/teacher/Profile";
import Students from "./pages/teacher/Students";
import Scores from "./pages/teacher/Scores";
import Leaderboard from "./pages/shared/Leaderboard";
import Announcements from "./pages/shared/Announcements";
import Assignments from "./pages/shared/Assignments";
import Analytics from "./pages/teacher/Analytics";
import Setup from "./pages/Setup";
import StudentDashboard from "./pages/student/Dashboard"; // dashboard ใหม่ มี nav ในตัว

function RequireAuth({ children, role }) {
  const { token, user, requirePasswordChange } = useAuthStore();
  if (!token || !user) return <Navigate to="/" replace />;
  if (requirePasswordChange) return <Navigate to="/change-password" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function TeacherLayout({ children }) {
  return (
    <RequireAuth role="TEACHER">
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

// Student ไม่ใช้ AppShell แล้ว — Dashboard จัดการ layout เอง
function StudentGuard({ children }) {
  return <RequireAuth role="STUDENT">{children}</RequireAuth>;
}

function AuthGuard({ children }) {
  const { token, user } = useAuthStore();
  if (token && user) {
    return <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />;
  }
  return children;
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing */}
          <Route path="/" element={<AuthGuard><LandingPage /></AuthGuard>} />

          {/* Auth */}
          <Route path="/login/teacher" element={<AuthGuard><TeacherLogin /></AuthGuard>} />
          <Route path="/login/student" element={<AuthGuard><StudentLogin /></AuthGuard>} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Teacher routes — ยังใช้ AppShell เหมือนเดิม */}
          <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
          <Route path="/teacher/profile" element={<TeacherLayout><TeacherProfile /></TeacherLayout>} />
          <Route path="/teacher/students" element={<TeacherLayout><Students /></TeacherLayout>} />
          <Route path="/teacher/scores" element={<TeacherLayout><Scores /></TeacherLayout>} />
          <Route path="/teacher/analytics" element={<TeacherLayout><Analytics /></TeacherLayout>} />
          <Route path="/teacher/leaderboard" element={<TeacherLayout><Leaderboard /></TeacherLayout>} />
          <Route path="/teacher/announcements" element={<TeacherLayout><Announcements /></TeacherLayout>} />
          <Route path="/teacher/assignments" element={<TeacherLayout><Assignments /></TeacherLayout>} />

          {/* Student — route เดียว Dashboard จัดการ tab เอง */}
          <Route path="/student" element={<StudentGuard><StudentDashboard /></StudentGuard>} />
          <Route path="/student/*" element={<Navigate to="/student" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}