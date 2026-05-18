import { useEffect, useState } from 'react';
import ExpertProfilePage from '../pages/ExpertProfilePage.jsx';
import ExpertsListPage from '../pages/ExpertsListPage.jsx';
import ExpertDetailsPage from '../pages/ExpertDetailsPage.jsx';
import DoubtBoardPage from '../pages/DoubtBoardPage.jsx';
import SessionChatPage from '../pages/SessionChatPage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import WalletPage from '../pages/WalletPage.jsx';
import FavoritesPage from '../pages/FavoritesPage.jsx';
import NotificationHistoryPage from '../pages/NotificationHistoryPage.jsx';
import BellIcon from '../components/BellIcon.jsx';
import { fetchCurrentUser } from '../services/authApi.js';
import { getAuthToken, setAuthToken } from '../services/httpClient.js';
import { fetchMyExpertProfile } from '../services/expertApi.js';
import { getChatSocket } from '../services/chatSocket.js';
import { fetchSessions } from '../services/sessionApi.js';
import {
  fetchUnreadNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../services/notificationApi.js';

function parsePath(pathname) {
  const cleanPath = String(pathname || '/').replace(/\/+$/, '') || '/';

  if (cleanPath === '/' || cleanPath === '/landing') return { view: 'landing' };
  if (cleanPath === '/auth') return { view: 'auth' };
  if (cleanPath === '/profile') return { view: 'profile' };
  if (cleanPath === '/experts') return { view: 'list' };
  if (cleanPath === '/doubts') return { view: 'doubts' };
  if (cleanPath === '/favorites') return { view: 'favorites' };
  if (cleanPath === '/sessions') return { view: 'sessions' };
  if (cleanPath === '/wallet') return { view: 'wallet' };
  if (cleanPath === '/notifications') return { view: 'notifications-history' };

  const expertMatch = cleanPath.match(/^\/experts\/([^/]+)$/);
  if (expertMatch) {
    return {
      view: 'detail',
      expertIdentifier: decodeURIComponent(expertMatch[1])
    };
  }

  const sessionMatch = cleanPath.match(/^\/sessions\/(\d+)$/);
  if (sessionMatch) {
    return {
      view: 'sessions',
      sessionId: Number(sessionMatch[1])
    };
  }

  return { view: null };
}

function pathForView(view, options = {}) {
  if (view === 'landing') return '/';
  if (view === 'auth') return '/auth';
  if (view === 'profile') return '/profile';
  if (view === 'list') return '/experts';
  if (view === 'doubts') return '/doubts';
  if (view === 'favorites') return '/favorites';
  if (view === 'wallet') return '/wallet';
  if (view === 'notifications-history') return '/notifications';
  if (view === 'sessions') {
    const sessionId = Number(options.sessionId);
    return Number.isInteger(sessionId) && sessionId > 0 ? `/sessions/${sessionId}` : '/sessions';
  }
  if (view === 'detail') {
    const identifier = String(options.expertIdentifier || '').trim();
    return identifier ? `/experts/${encodeURIComponent(identifier)}` : '/experts';
  }
  return '/';
}

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('expertmatch_current_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role === 'expert' ? 'sessions' : 'doubts';
      } catch (_) { }
    }
    return 'doubts';
  });
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [detailIdentifier, setDetailIdentifier] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('expertmatch_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) { }
    }
    const defaultStudent = {
      id: 1001,
      fullName: "Jane Doe (Student)",
      email: "student@expertmatch.com",
      role: "student",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256"
    };
    localStorage.setItem('expertmatch_current_user', JSON.stringify(defaultStudent));
    localStorage.setItem('expertmatch_token', 'mock_token');
    return defaultStudent;
  });
  const [authLoading, setAuthLoading] = useState(false);
  const [expertProfileReady, setExpertProfileReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  function pushToast(message, tone = 'info') {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }

  function getDefaultView(user, profileReady) {
    if (!user) return 'landing';
    if (user.role === 'expert') {
      return profileReady ? 'sessions' : 'profile';
    }
    return 'doubts';
  }

  function navigateTo(nextView, options = {}) {
    const resolvedExpertIdentifier = options.expertIdentifier || detailIdentifier;
    const hasSessionId = Object.prototype.hasOwnProperty.call(options, 'sessionId');
    const resolvedSessionId = hasSessionId ? options.sessionId : null;

    if (nextView === 'detail') {
      if (resolvedExpertIdentifier) {
        setDetailIdentifier(String(resolvedExpertIdentifier));
      }
    }

    if (nextView === 'sessions') {
      setSelectedSessionId(hasSessionId && resolvedSessionId != null ? Number(resolvedSessionId) : null);
    }

    setView(nextView);

    const nextPath = pathForView(nextView, {
      expertIdentifier: resolvedExpertIdentifier,
      sessionId: resolvedSessionId
    });

    if (window.location.pathname !== nextPath) {
      const action = options.replace ? 'replaceState' : 'pushState';
      window.history[action]({}, '', nextPath);
    }
  }

  function applyRouteFromPath(pathname, { replace = false } = {}) {
    const route = parsePath(pathname);
    if (!route.view) return false;

    if (route.view === 'detail') {
      setDetailIdentifier(route.expertIdentifier || '');
      setSelectedExpert(null);
    }

    if (route.view === 'sessions' && route.sessionId) {
      setSelectedSessionId(route.sessionId);
    } else if (route.view === 'sessions') {
      setSelectedSessionId(null);
    }

    navigateTo(route.view, {
      expertIdentifier: route.expertIdentifier,
      sessionId: route.sessionId,
      replace
    });

    return true;
  }

  async function applyAuthenticatedUserFromToken() {
    const user = await fetchCurrentUser();
    setCurrentUser(user);

    let profileReady = false;

    if (user.role === 'expert') {
      try {
        await fetchMyExpertProfile();
        setExpertProfileReady(true);
        profileReady = true;
      } catch (_error) {
        setExpertProfileReady(false);
        profileReady = false;
      }
    } else {
      setExpertProfileReady(false);
      profileReady = false;
    }

    const route = parsePath(window.location.pathname);
    const defaultView = getDefaultView(user, profileReady);
    const nextView = route.view && route.view !== 'auth' && route.view !== 'landing' ? route.view : defaultView;

    navigateTo(nextView, {
      expertIdentifier: route.expertIdentifier,
      sessionId: route.sessionId,
      replace: true
    });
  }

  useEffect(() => {
    function onPopState() {
      applyRouteFromPath(window.location.pathname, { replace: true });
    }

    window.addEventListener('popstate', onPopState);
    applyRouteFromPath(window.location.pathname, { replace: true });

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    if (!getAuthToken()) {
      setAuthLoading(false);
      const route = parsePath(window.location.pathname);
      const nextView = route.view === 'auth' ? 'auth' : 'landing';
      navigateTo(nextView, { replace: true });
      return;
    }

    fetchCurrentUser()
      .then(async (user) => {
        setCurrentUser(user);

        let profileReady = false;
        if (user.role === 'expert') {
          try {
            await fetchMyExpertProfile();
            profileReady = true;
          } catch (_error) {
            profileReady = false;
          }
        }

        setExpertProfileReady(profileReady);

        const route = parsePath(window.location.pathname);
        const defaultView = getDefaultView(user, profileReady);
        const nextView = route.view && route.view !== 'auth' && route.view !== 'landing' ? route.view : defaultView;

        navigateTo(nextView, {
          expertIdentifier: route.expertIdentifier,
          sessionId: route.sessionId,
          replace: true
        });
      })
      .catch(() => {
        setAuthToken('');
        setCurrentUser(null);
        setExpertProfileReady(false);
        const route = parsePath(window.location.pathname);
        const nextView = route.view === 'auth' ? 'auth' : 'landing';
        navigateTo(nextView, { replace: true });
      })
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = getChatSocket();
    socket.emit('register_user', {
      userId: currentUser.id,
      fullName: currentUser.fullName,
      role: currentUser.role
    });

    function onSessionRequestCreated(payload) {
      const session = payload?.session;
      const sessionId = Number(session?.id || payload?.sessionId);
      if (!sessionId) return;

      if (currentUser.role !== 'expert') return;
      pushToast(`New chat request for "${session?.doubt?.title || 'a doubt'}"`, 'info');
    }

    function onSessionRequestResponded(payload) {
      const decision = String(payload?.decision || '').toLowerCase();
      const title = payload?.session?.doubt?.title || 'your doubt';

      if (currentUser.role === 'student') {
        if (decision === 'accept') {
          pushToast(`Your request for "${title}" was accepted by the expert.`, 'success');
        } else if (decision === 'decline') {
          pushToast(`Your request for "${title}" was declined by the expert.`, 'error');
        }
      }
    }

    function onSessionStatusUpdated(payload) {
      const status = String(payload?.session?.status || '').toLowerCase();
      const title = payload?.session?.doubt?.title || 'session';
      if (status === 'active') {
        pushToast(`Chat started for "${title}".`, 'success');
      }
    }

    socket.on('session_request_created', onSessionRequestCreated);
    socket.on('session_request_responded', onSessionRequestResponded);
    socket.on('session_status_updated', onSessionStatusUpdated);

    return () => {
      socket.off('session_request_created', onSessionRequestCreated);
      socket.off('session_request_responded', onSessionRequestResponded);
      socket.off('session_status_updated', onSessionStatusUpdated);
    };
  }, [currentUser?.id, currentUser?.role, detailIdentifier, selectedSessionId, view]);

  useEffect(() => {
    if (!currentUser?.id) return;

    let active = true;

    async function pollSessionNotifications() {
      try {
        const sessions = await fetchSessions();
        if (!active) return;

        sessions.forEach((session) => {
          const status = String(session?.status || '').toLowerCase();
          const title = session?.doubt?.title || 'session';
          const key = `seen_session_event_${session.id}_${status}`;
          if (sessionStorage.getItem(key)) return;

          if (currentUser.role === 'student') {
            if (status === 'accepted_pending') {
              pushToast(`Request accepted! "${title}" - Expert is waiting. Go to Sessions Chat to start.`, 'success');
              sessionStorage.setItem(key, '1');
              return;
            }
            if (status === 'declined') {
              pushToast(`Request declined for "${title}". Try another expert.`, 'error');
              sessionStorage.setItem(key, '1');
              return;
            }
          }

          if (currentUser.role === 'expert' && status === 'requested') {
            pushToast(`New request: "${title}" - Student is waiting for your response.`, 'info');
            sessionStorage.setItem(key, '1');
            return;
          }

          if (status === 'active') {
            pushToast(`Chat started for "${title}" - You can now message!`, 'success');
            sessionStorage.setItem(key, '1');
          }
        });
      } catch (_error) {
        if (!active) return;
      }
    }

    const interval = setInterval(pollSessionNotifications, 5000);
    function onFocus() {
      pollSessionNotifications();
    }

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    pollSessionNotifications();

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!currentUser?.id || currentUser.role !== 'expert') {
      setPendingRequestCount(0);
      return;
    }

    let active = true;

    async function updatePendingCount() {
      try {
        const sessions = await fetchSessions();
        if (!active) return;

        const pendingCount = sessions.filter((s) => {
          const status = String(s?.status || '').toLowerCase();
          return status === 'requested';
        }).length;

        setPendingRequestCount(pendingCount);
      } catch (_error) {
        if (!active) return;
      }
    }

    const interval = setInterval(updatePendingCount, 5000);
    updatePendingCount();

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!currentUser?.id) return;

    let active = true;

    async function syncUser() {
      try {
        const latest = await fetchCurrentUser();
        if (!active) return;
        setCurrentUser((prev) => {
          if (!prev) return latest;
          if (
            Number(prev.id) === Number(latest.id)
            && String(prev.role || '') === String(latest.role || '')
            && String(prev.fullName || '') === String(latest.fullName || '')
          ) {
            return prev;
          }
          return latest;
        });
      } catch (_error) {
        if (!active) return;
      }
    }

    const interval = setInterval(syncUser, 15000);
    function onFocus() {
      syncUser();
    }

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [currentUser?.id]);

  // Load notifications and listen for new ones
  useEffect(() => {
    if (!currentUser?.id) return;

    let active = true;

    async function loadNotifications() {
      try {
        const [notificationsData, count] = await Promise.all([
          fetchUnreadNotifications(20),
          fetchUnreadCount()
        ]);
        if (!active) return;
        setNotifications(notificationsData);
        setUnreadCount(count);
      } catch (_error) {
        if (!active) return;
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000);

    const socket = getChatSocket();
    function onNewNotification(notification) {
      if (!active) return;
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast for new notification
      const title = notification.title || 'New notification';
      pushToast(title, 'info');
    }

    socket.on('new_notification', onNewNotification);

    return () => {
      active = false;
      clearInterval(interval);
      socket.off('new_notification', onNewNotification);
    };
  }, [currentUser?.id]);

  function renderView() {
    if (view === 'list') {
      return (
        <ExpertsListPage
          currentUser={currentUser}
          onSelectExpert={(expert) => {
            const identifier = expert?.slug || expert?.id;
            setSelectedExpert(expert);
            setDetailIdentifier(String(identifier || ''));
            navigateTo('detail', { expertIdentifier: identifier });
          }}
        />
      );
    }

    if (view === 'detail') {
      return (
        <ExpertDetailsPage
          expertIdentifier={selectedExpert?.slug || selectedExpert?.id || detailIdentifier}
          onBack={() => navigateTo('list')}
        />
      );
    }

    if (view === 'doubts') {
      return (
        <DoubtBoardPage
          currentUser={currentUser}
          onOpenSession={(session) => {
            setSelectedSessionId(session.id);
            navigateTo('sessions', { sessionId: session.id });
          }}
        />
      );
    }

    if (view === 'favorites') {
      return (
        <FavoritesPage
          currentUser={currentUser}
          onSelectExpert={(expert) => {
            const identifier = expert?.slug || expert?.id;
            setSelectedExpert(expert);
            setDetailIdentifier(String(identifier || ''));
            navigateTo('detail', { expertIdentifier: identifier });
          }}
        />
      );
    }

    if (view === 'sessions') {
      return (
        <SessionChatPage
          initialSessionId={selectedSessionId}
          currentUser={currentUser}
          onSelectSession={(sessionId) => {
            const numeric = Number(sessionId);
            if (!Number.isInteger(numeric) || numeric <= 0) return;
            setSelectedSessionId(numeric);
            navigateTo('sessions', { sessionId: numeric, replace: true });
          }}
        />
      );
    }

    if (view === 'wallet') {
      return <WalletPage currentUser={currentUser} />;
    }

    if (view === 'notifications-history') {
      return <NotificationHistoryPage />;
    }

    return (
      <ExpertProfilePage
        currentUser={currentUser}
        onProfileCreated={() => {
          setExpertProfileReady(true);
          navigateTo('sessions');
        }}
        onExploreExperts={() => navigateTo('list')}
      />
    );
  }

  if (authLoading) {
    return <main className="app-content"><p className="muted">Checking login...</p></main>;
  }

  if (!currentUser) {
    if (view === 'auth') {
      return (
        <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <header className="landing-header">
            <div className="landing-logo" style={{ cursor: 'pointer' }} onClick={() => navigateTo('landing')}>ExpertMatch</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                type="button"
                className="theme-toggle-btn"
                onClick={toggleTheme}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  padding: '0.5rem',
                  transition: 'transform 0.3s ease'
                }}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </button>
              <button type="button" className="landing-btn-login" onClick={() => navigateTo('landing')}>
                Back to Home
              </button>
            </div>
          </header>
          <AuthPage
            onAuthenticated={async () => {
              await applyAuthenticatedUserFromToken();
            }}
          />
        </div>
      );
    }

    return <LandingPage onGetStarted={() => navigateTo('auth')} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <main className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {toasts.length ? (
        <div className="toast-stack">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast-item ${toast.tone}`}>
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}

      <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          padding: sidebarCollapsed ? 'var(--space-4) 0' : 'var(--space-4) var(--space-5)'
        }}>
          {!sidebarCollapsed && <p className="brand-mark">ExpertMatch</p>}
          <BellIcon
            unreadCount={unreadCount}
            notifications={notifications}
            onNotificationRead={async (notificationId) => {
              const success = await markNotificationAsRead(notificationId);
              if (success) {
                setNotifications(
                  notifications.map((n) =>
                    n.id === notificationId ? { ...n, isRead: true } : n
                  )
                );
                setUnreadCount(Math.max(0, unreadCount - 1));
              }
            }}
            onMarkAllAsRead={async () => {
              const count = await markAllNotificationsAsRead();
              if (count > 0) {
                setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
                setUnreadCount(0);
              }
            }}
            onViewAll={() => navigateTo('notifications-history')}
          />
        </div>

        {!sidebarCollapsed && (
          <p className="muted" style={{ paddingLeft: '1rem', textAlign: 'left' }}>
            {currentUser.fullName} ({currentUser.role})
          </p>
        )}

        <button
          type="button"
          className={`nav-btn ${view === 'profile' ? 'active' : ''}`}
          onClick={() => navigateTo('profile')}
          title="My Profile"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">My Profile</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${view === 'list' || view === 'detail' ? 'active' : ''}`}
          onClick={() => navigateTo('list')}
          title="All Developers"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">All Developers</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${view === 'doubts' ? 'active' : ''}`}
          onClick={() => navigateTo('doubts')}
          title="Post Doubts"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">Post Doubts</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${view === 'favorites' ? 'active' : ''}`}
          onClick={() => navigateTo('favorites')}
          title="Favorites"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">Favorites</span>}
        </button>

        <button
          type="button"
          className={`nav-btn nav-btn-with-badge ${view === 'sessions' ? 'active' : ''}`}
          onClick={() => navigateTo('sessions')}
          title="Sessions Chat"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {currentUser?.role === 'expert' && pendingRequestCount > 0 && (
              <span className="nav-badge" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                margin: 0,
                fontSize: '0.65rem',
                minWidth: '16px',
                height: '16px',
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {pendingRequestCount}
              </span>
            )}
          </div>
          {!sidebarCollapsed && <span className="nav-label" style={{ marginLeft: '0.75rem' }}>Sessions Chat</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${view === 'wallet' ? 'active' : ''}`}
          onClick={() => navigateTo('wallet')}
          title="Wallet"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12" y2="18"></line>
            <path d="M16 8h6v8h-6z"></path>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">Wallet</span>}
        </button>

        <button
          type="button"
          className={`nav-btn ${view === 'notifications-history' ? 'active' : ''}`}
          onClick={() => navigateTo('notifications-history')}
          title="Notification History"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">Notification History</span>}
        </button>

        <button
          type="button"
          className="nav-btn"
          onClick={() => {
            setAuthToken('');
            setCurrentUser(null);
            setExpertProfileReady(false);
            navigateTo('landing', { replace: true });
          }}
          title="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          {!sidebarCollapsed && <span className="nav-label">Logout</span>}
        </button>

        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
          aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          )}
          {!sidebarCollapsed && <span className="nav-label">Collapse Menu</span>}
        </button>
      </aside>

      <section key={view} className="app-content">{renderView()}</section>
    </main>
  );
}

export default App;
