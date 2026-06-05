// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/ui";
import AppShell from "./components/AppShell";
import useAuthStore from "./stores/authStore";

// Pages
import Login from "./pages/Login";
import ChangePassword from "./pages/ChangePassword";
import TeacherDashboard from "./pages/teacher/Dashboard";
import Students from "./pages/teacher/Students";
import Scores from "./pages/teacher/Scores";
import StudentDashboard from "./pages/student/Dashboard";
import StudentScores from "./pages/student/Scores";
import Leaderboard from "./pages/shared/Leaderboard";
import Announcements from "./pages/shared/Announcements";
import Assignments from "./pages/shared/Assignments";
import Setup from "./pages/Setup";
import Signup from "./pages/Signup";

function RequireAuth({ children, role }) {
  const { token, user, requirePasswordChange } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (requirePasswordChange) return <Navigate to="/change-password" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
}

function TeacherLayout({ children }) {
  return (
    <RequireAuth role="TEACHER">
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

function StudentLayout({ children }) {
  return (
    <RequireAuth role="STUDENT">
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

export default function App() {
  const { token, user } = useAuthStore();

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Setup — first-time only */}
          <Route path="/setup" element={<Setup />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public */}
          <Route path="/login" element={
            token && user
              ? <Navigate to={user.role === "TEACHER" ? "/teacher" : "/student"} replace />
              : <Login />
          } />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Teacher routes */}
          <Route path="/teacher" element={<TeacherLayout><TeacherDashboard /></TeacherLayout>} />
          <Route path="/teacher/students" element={<TeacherLayout><Students /></TeacherLayout>} />
          <Route path="/teacher/scores" element={<TeacherLayout><Scores /></TeacherLayout>} />
          <Route path="/teacher/leaderboard" element={<TeacherLayout><Leaderboard /></TeacherLayout>} />
          <Route path="/teacher/announcements" element={<TeacherLayout><Announcements /></TeacherLayout>} />
          <Route path="/teacher/assignments" element={<TeacherLayout><Assignments /></TeacherLayout>} />

          {/* Student routes */}
          <Route path="/student" element={<StudentLayout><StudentDashboard /></StudentLayout>} />
          <Route path="/student/scores" element={<StudentLayout><StudentScores /></StudentLayout>} />
          <Route path="/student/leaderboard" element={<StudentLayout><Leaderboard /></StudentLayout>} />
          <Route path="/student/announcements" element={<StudentLayout><Announcements /></StudentLayout>} />
          <Route path="/student/assignments" element={<StudentLayout><Assignments /></StudentLayout>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
