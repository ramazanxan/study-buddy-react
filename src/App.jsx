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

// Emojis flying out — one per faculty / topic
const PARTICLES = [
  { emoji: '💻', angle: 0,   dist: 130, dur: 4.2, delay: 0.0,  size: 22 },
  { emoji: '📚', angle: 35,  dist: 150, dur: 3.8, delay: 1.1,  size: 20 },
  { emoji: '⚙️', angle: 72,  dist: 140, dur: 4.6, delay: 2.3,  size: 22 },
  { emoji: '🔬', angle: 108, dist: 155, dur: 3.5, delay: 0.7,  size: 20 },
  { emoji: '📐', angle: 144, dist: 135, dur: 4.0, delay: 3.2,  size: 18 },
  { emoji: '🏗️', angle: 180, dist: 145, dur: 3.9, delay: 1.8,  size: 20 },
  { emoji: '⚡', angle: 216, dist: 160, dur: 4.4, delay: 0.4,  size: 22 },
  { emoji: '🚗', angle: 252, dist: 130, dur: 3.7, delay: 2.6,  size: 18 },
  { emoji: '🧮', angle: 288, dist: 150, dur: 4.1, delay: 1.4,  size: 20 },
  { emoji: '🎓', angle: 324, dist: 165, dur: 3.6, delay: 0.9,  size: 22 },
  { emoji: '🔭', angle: 54,  dist: 125, dur: 4.8, delay: 3.5,  size: 18 },
  { emoji: '✏️', angle: 126, dist: 148, dur: 3.4, delay: 2.0,  size: 18 },
  { emoji: '🏛️', angle: 198, dist: 138, dur: 4.3, delay: 1.6,  size: 18 },
  { emoji: '🛠️', angle: 270, dist: 155, dur: 3.8, delay: 2.9,  size: 20 },
  { emoji: '📡', angle: 342, dist: 142, dur: 4.5, delay: 0.5,  size: 18 },
];

function KstuWatermark() {
  const wrapRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (wrapRef.current) {
          const offset = window.scrollY * 0.10;
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
          25%  { transform: rotate(90deg)  translateY(-12px); }
          50%  { transform: rotate(180deg) translateY(0px);   }
          75%  { transform: rotate(270deg) translateY(12px);  }
          100% { transform: rotate(360deg) translateY(0px);   }
        }
        @keyframes kstu-particle-fly {
          0%   { transform: translate(0px, 0px) scale(0.2); opacity: 0; }
          12%  { opacity: 1; }
          70%  { opacity: 0.85; }
          100% { transform: translate(var(--px), var(--py)) scale(0.7); opacity: 0; }
        }
      `}</style>

      {/* Outer wrapper: centering + scroll parallax */}
      <div
        ref={wrapRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(50vmin, 460px)',
          height: 'min(50vmin, 460px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {/* Spinning logo */}
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          animation: 'kstu-spin-float 16s linear infinite',
          willChange: 'transform',
        }}>
          <img
            src={KSTU_LOGO}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        </div>

        {/* Flying emoji particles from center */}
        {PARTICLES.map((p, i) => {
          const rad = p.angle * Math.PI / 180;
          const px = Math.round(Math.cos(rad) * p.dist);
          const py = Math.round(Math.sin(rad) * p.dist);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: `-${p.size / 2}px`,
                marginTop: `-${p.size / 2}px`,
                fontSize: `${p.size}px`,
                lineHeight: 1,
                '--px': `${px}px`,
                '--py': `${py}px`,
                animation: `kstu-particle-fly ${p.dur}s ease-out ${p.delay}s infinite`,
                willChange: 'transform, opacity',
                opacity: 0,
              }}
            >
              {p.emoji}
            </div>
          );
        })}
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
