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
  const wrapRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (wrapRef.current) {
          // Move `top` instead of transform so centering isn't broken
          const offset = window.scrollY * 0.12;
          wrapRef.current.style.top = `calc(50% + ${offset}px)`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes kstu-spin-float {
          0%   { transform: rotate(0deg)   translateY(0px);   }
          25%  { transform: rotate(90deg)  translateY(-14px); }
          50%  { transform: rotate(180deg) translateY(0px);   }
          75%  { transform: rotate(270deg) translateY(14px);  }
          100% { transform: rotate(360deg) translateY(0px);   }
        }
        @keyframes kstu-glow-pulse {
          0%,100% {
            filter:
              drop-shadow(0 0 6px rgba(10,59,171,0.70))
              drop-shadow(0 0 18px rgba(10,59,171,0.40))
              saturate(1.4) contrast(1.1);
          }
          50% {
            filter:
              drop-shadow(0 0 16px rgba(10,59,171,1.0))
              drop-shadow(0 0 40px rgba(10,59,171,0.65))
              drop-shadow(0 0 70px rgba(26,92,232,0.35))
              saturate(1.8) contrast(1.2) brightness(1.15);
          }
        }
      `}</style>

      {/* Outer: fixed centering + scroll parallax via top */}
      <div
        ref={wrapRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(52vmin, 480px)',
          height: 'min(52vmin, 480px)',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.22,
        }}
      >
        {/* Inner: rotation + float — separate from translate centering */}
        <div style={{
          width: '100%',
          height: '100%',
          animation: 'kstu-spin-float 14s linear infinite',
          willChange: 'transform',
        }}>
          {/* Image: only glow, no transform conflict */}
          <img
            src={KSTU_LOGO}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block',
              animation: 'kstu-glow-pulse 3.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </>
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
