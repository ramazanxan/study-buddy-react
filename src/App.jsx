import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { useTheme } from './hooks/useTheme';

const KSTU_LOGO = 'https://enactus.kg/wp-content/uploads/2022/04/kgtu-logo.png';

function KstuWatermark() {
  return (
    <>
      <style>{`
        @keyframes kstu-float {
          0%   { transform: translate(-50%, -50%) translateY(0px);    }
          50%  { transform: translate(-50%, -50%) translateY(-18px);  }
          100% { transform: translate(-50%, -50%) translateY(0px);    }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          width: 'clamp(180px, 40vmin, 420px)',
          height: 'clamp(180px, 40vmin, 420px)',
          opacity: 0.09,
          pointerEvents: 'none',
          zIndex: 0,
          willChange: 'transform',
          animation: 'kstu-float 6s ease-in-out infinite',
        }}
      >
        <img
          src={KSTU_LOGO}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </div>
    </>
  );
}
import Navbar from './components/layout/Navbar';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Feed from './pages/Feed/Feed';
import Profile from './pages/Profile/Profile';
import Chat from './pages/Chat/Chat';
import Goals from './pages/Goals/Goals';
import Mentorship from './pages/Mentorship/Mentorship';
import MentorPanel from './pages/MentorPanel/MentorPanel';
import WinsBoard from './pages/WinsBoard/WinsBoard';
import Marketplace from './pages/Marketplace/Marketplace';
import Announcements from './pages/Announcements/Announcements';
import Complaints from './pages/Complaints/Complaints';
import Admin from './pages/Admin/Admin';
import ModeratorPanel from './pages/ModeratorPanel/ModeratorPanel';

function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  return currentUser.role === 'admin' ? children : <Navigate to="/feed" replace />;
}

function StudentOnlyRoute({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
}

function MentorRoute({ children }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin" replace />;
  const isMentor = currentUser.role === 'mentor' || currentUser.isMentor;
  return isMentor ? children : <Navigate to="/feed" replace />;
}

function AppRoutes() {
  const { currentUser } = useApp();
  const { theme, toggle } = useTheme();

  const defaultRoute = !currentUser
    ? '/'
    : currentUser.role === 'admin'
      ? '/admin'
      : '/feed';

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggle} />
      {currentUser && <KstuWatermark />}
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to={defaultRoute} /> : <Landing />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={defaultRoute} />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to={defaultRoute} />} />

        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/wins" element={<ProtectedRoute><WinsBoard /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />

        <Route path="/profile" element={<StudentOnlyRoute><Profile /></StudentOnlyRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/goals" element={<StudentOnlyRoute><Goals /></StudentOnlyRoute>} />
        <Route path="/mentorship" element={<StudentOnlyRoute><Mentorship /></StudentOnlyRoute>} />
        <Route path="/announcements" element={<StudentOnlyRoute><Announcements /></StudentOnlyRoute>} />
        <Route path="/complaints" element={<StudentOnlyRoute><Complaints /></StudentOnlyRoute>} />

        <Route path="/mentor-panel" element={<MentorRoute><MentorPanel /></MentorRoute>} />
        <Route path="/moderator" element={<ProtectedRoute><ModeratorPanel /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

        <Route path="*" element={<Navigate to={defaultRoute} replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
