import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { useTheme } from './hooks/useTheme';
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

const KSTU_LOGO = 'https://enactus.kg/wp-content/uploads/2022/04/kgtu-logo.png';

function KstuWatermark() {
  const ref = useRef(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (ref.current) {
            const offset = window.scrollY * 0.12;
            ref.current.style.transform = `translate(-50%, calc(-50% + ${offset}px))`;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(55vmin, 500px)',
        height: 'min(55vmin, 500px)',
        opacity: 0.13,
        pointerEvents: 'none',
        zIndex: 0,
        willChange: 'transform',
      }}
    >
      <img
        src={KSTU_LOGO}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
          animation: 'kstu-wm-spin 18s linear infinite, kstu-wm-float 4s ease-in-out infinite, kstu-wm-glow 3s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes kstu-wm-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes kstu-wm-float {
          0%,100% { margin-top: 0px;   }
          50%      { margin-top: -18px; }
        }
        @keyframes kstu-wm-glow {
          0%,100% {
            filter:
              drop-shadow(0 0 12px rgba(10,59,171,0.50))
              drop-shadow(0 0 30px rgba(10,59,171,0.25))
              brightness(1.05);
          }
          50% {
            filter:
              drop-shadow(0 0 28px rgba(10,59,171,0.90))
              drop-shadow(0 0 60px rgba(10,59,171,0.45))
              drop-shadow(0 0 90px rgba(93,187,42,0.20))
              brightness(1.35);
          }
        }
      `}</style>
    </div>
  );
}

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
      {/* КГТУ watermark — on all authenticated pages, not on landing */}
      {currentUser && <KstuWatermark />}
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to={defaultRoute} /> : <Landing />} />
        <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={defaultRoute} />} />
        <Route path="/register" element={!currentUser ? <Register /> : <Navigate to={defaultRoute} />} />

        {/* Protected routes for ALL authenticated users */}
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/wins" element={<ProtectedRoute><WinsBoard /></ProtectedRoute>} />
        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />

        {/* Student & Mentor only */}
        <Route path="/profile" element={<StudentOnlyRoute><Profile /></StudentOnlyRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/goals" element={<StudentOnlyRoute><Goals /></StudentOnlyRoute>} />
        <Route path="/mentorship" element={<StudentOnlyRoute><Mentorship /></StudentOnlyRoute>} />
        <Route path="/announcements" element={<StudentOnlyRoute><Announcements /></StudentOnlyRoute>} />
        <Route path="/complaints" element={<StudentOnlyRoute><Complaints /></StudentOnlyRoute>} />

        {/* Mentor only */}
        <Route path="/mentor-panel" element={<MentorRoute><MentorPanel /></MentorRoute>} />

        {/* Moderator */}
        <Route path="/moderator" element={<ProtectedRoute><ModeratorPanel /></ProtectedRoute>} />

        {/* Admin only */}
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
