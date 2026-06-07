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

// Emojis flying across the whole page from logo center
const PARTICLES = [
  { emoji: '💻', angle: 0,   dist: 520, dur: 5.5, delay: 0.0,  size: 30 },
  { emoji: '📚', angle: 24,  dist: 580, dur: 4.8, delay: 1.2,  size: 28 },
  { emoji: '⚙️', angle: 48,  dist: 490, dur: 6.0, delay: 2.5,  size: 32 },
  { emoji: '🔬', angle: 72,  dist: 610, dur: 5.2, delay: 0.6,  size: 28 },
  { emoji: '📐', angle: 96,  dist: 540, dur: 4.6, delay: 3.4,  size: 26 },
  { emoji: '🏗️', angle: 120, dist: 570, dur: 5.8, delay: 1.8,  size: 30 },
  { emoji: '⚡', angle: 144, dist: 500, dur: 4.4, delay: 0.3,  size: 32 },
  { emoji: '🚗', angle: 168, dist: 620, dur: 5.3, delay: 2.8,  size: 26 },
  { emoji: '🧮', angle: 192, dist: 480, dur: 6.2, delay: 1.5,  size: 28 },
  { emoji: '🎓', angle: 216, dist: 590, dur: 4.9, delay: 0.9,  size: 32 },
  { emoji: '🔭', angle: 240, dist: 530, dur: 5.6, delay: 3.8,  size: 26 },
  { emoji: '✏️', angle: 264, dist: 560, dur: 4.7, delay: 2.1,  size: 28 },
  { emoji: '🏛️', angle: 288, dist: 510, dur: 5.0, delay: 1.3,  size: 30 },
  { emoji: '🛠️', angle: 312, dist: 600, dur: 4.5, delay: 3.1,  size: 28 },
  { emoji: '📡', angle: 336, dist: 545, dur: 5.7, delay: 0.7,  size: 26 },
  { emoji: '🧬', angle: 12,  dist: 575, dur: 4.3, delay: 4.2,  size: 26 },
  { emoji: '📊', angle: 60,  dist: 495, dur: 5.9, delay: 2.0,  size: 28 },
  { emoji: '🖥️', angle: 108, dist: 615, dur: 4.6, delay: 3.6,  size: 30 },
  { emoji: '🔑', angle: 156, dist: 535, dur: 5.4, delay: 1.0,  size: 26 },
  { emoji: '🏆', angle: 204, dist: 580, dur: 4.8, delay: 4.5,  size: 30 },
  { emoji: '📱', angle: 252, dist: 510, dur: 6.1, delay: 0.4,  size: 28 },
  { emoji: '🔧', angle: 300, dist: 560, dur: 5.2, delay: 2.7,  size: 26 },
  { emoji: '💡', angle: 348, dist: 590, dur: 4.7, delay: 1.7,  size: 32 },
  { emoji: '📝', angle: 36,  dist: 520, dur: 5.5, delay: 3.3,  size: 26 },
];

function KstuWatermark() {
  const scrollRef = useRef(null);

  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (scrollRef.current) {
          const offset = window.scrollY * 0.10;
          scrollRef.current.style.marginTop = `${offset}px`;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <style>{`
        @keyframes kstu-logo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes kstu-logo-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes kstu-particle-fly {
          0%   { transform: translate(0,0) scale(0.2); opacity: 0; }
          10%  { opacity: 0.85; }
          80%  { opacity: 0.6; }
          100% { transform: translate(var(--px), var(--py)) scale(0.6); opacity: 0; }
        }
      `}</style>

      {/* Fixed anchor at exact center of viewport */}
      <div aria-hidden="true" style={{
        position: 'fixed',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        {/* Logo: centering wrapper keeps translate(-50%,-50%) stable */}
        <div ref={scrollRef} style={{
          position: 'absolute',
          width: 'min(50vmin, 460px)',
          height: 'min(50vmin, 460px)',
          left: '50%',
          top: '50%',
          marginLeft: 'calc(min(50vmin, 460px) / -2)',
          marginTop: 'calc(min(50vmin, 460px) / -2)',
          opacity: 0.18,
        }}>
          {/* Spin wrapper */}
          <div style={{
            width: '100%', height: '100%',
            animation: 'kstu-logo-spin 18s linear infinite',
          }}>
            {/* Float wrapper */}
            <div style={{
              width: '100%', height: '100%',
              animation: 'kstu-logo-float 4s ease-in-out infinite',
            }}>
              <img src={KSTU_LOGO} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Emoji particles — fly from center across whole screen */}
        {PARTICLES.map((p, i) => {
          const rad = p.angle * Math.PI / 180;
          const px = Math.round(Math.cos(rad) * p.dist);
          const py = Math.round(Math.sin(rad) * p.dist);
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `-${p.size / 2}px`,
              top: `-${p.size / 2}px`,
              fontSize: `${p.size}px`,
              lineHeight: 1,
              '--px': `${px}px`,
              '--py': `${py}px`,
              animation: `kstu-particle-fly ${p.dur}s ease-out ${p.delay}s infinite`,
              opacity: 0,
              pointerEvents: 'none',
            }}>
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
