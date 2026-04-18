import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, MapPin, Search, Bell, LogOut,
  ChevronDown, Menu, X, Users, Sun, Moon,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/fields', Icon: MapPin, label: 'Fields' },
];

const ADMIN_NAV_ITEMS = [
  { to: '/agents', Icon: Users, label: 'Agents' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const S: Record<string, React.CSSProperties> = {
    wrapper: { display: 'flex', minHeight: '100vh', background: theme.pageBg },
    sidebar: {
      width: 240, background: theme.sidebarBg, borderRight: `1px solid ${theme.sidebarBorder}`,
      display: 'flex', flexDirection: 'column',
      position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      transition: 'transform 0.3s',
      transform: isMobile && !menuOpen ? 'translateX(-100%)' : 'translateX(0)',
    },
    brandRow: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.125rem 1rem 1rem', borderBottom: `1px solid ${theme.dividerColor}`,
    },
    brandInner: { display: 'flex', alignItems: 'center' },
    collapseBtn: {
      background: 'none', border: 'none', color: theme.textMuted,
      padding: '0.25rem', cursor: 'pointer', display: 'flex',
    },
    nav: {
      flex: 1, padding: '0.875rem 0.75rem',
      overflowY: 'auto' as const,
      display: 'flex', flexDirection: 'column' as const, gap: '0.1rem',
    },
    navLinkBase: {
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.6rem 0.875rem', borderRadius: 8,
      fontSize: '0.875rem', fontWeight: 500, color: theme.navColor,
      textDecoration: 'none', transition: 'all 0.15s',
    },
    navLinkActive: { background: theme.navActiveBg, color: theme.navActiveColor },
    userSection: { padding: '0.875rem', borderTop: `1px solid ${theme.dividerColor}` },
    userCard: {
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      padding: '0.6rem 0.75rem', borderRadius: 8,
      background: theme.isDark ? '#141414' : '#f9fafb',
    },
    avatar: {
      width: 32, height: 32, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a5c2a, #2d8a45)',
      color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
    },
    userName: { fontSize: '0.8rem', fontWeight: 600, color: theme.text, lineHeight: 1.3 },
    userRole: { fontSize: '0.7rem', color: theme.textMuted },
    main: {
      marginLeft: isMobile ? 0 : 240, flex: 1,
      display: 'flex', flexDirection: 'column' as const,
      minHeight: '100vh', background: theme.pageBg,
    },
    header: {
      background: theme.headerBg, padding: '0.75rem 1.5rem',
      borderBottom: `1px solid ${theme.headerBorder}`,
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      position: 'sticky' as const, top: 0, zIndex: 50,
    },
    menuBtn: {
      background: 'none', border: 'none', color: theme.textSub,
      padding: '0.25rem', cursor: 'pointer',
      display: isMobile ? 'flex' : 'none', alignItems: 'center',
    },
    searchWrap: { position: 'relative' as const, display: 'flex', alignItems: 'center' },
    searchIconWrap: {
      position: 'absolute' as const, left: '0.7rem',
      color: theme.textMuted, display: 'flex', pointerEvents: 'none' as const,
    },
    searchInput: {
      padding: '0.45rem 0.875rem 0.45rem 2.1rem',
      border: `1.5px solid ${theme.sidebarBorder}`, borderRadius: 20,
      fontSize: '0.875rem',
      background: theme.isDark ? '#1a1a1a' : '#f9fafb',
      color: theme.textSub, width: 240,
    },
    headerRight: { display: 'flex', alignItems: 'center', gap: '0.625rem', marginLeft: 'auto' },
    bellWrap: { position: 'relative' as const },
    bellBtn: {
      background: 'none', border: 'none', color: theme.textSub,
      padding: '0.375rem', cursor: 'pointer', display: 'flex', borderRadius: 8,
    },
    bellDot: {
      position: 'absolute' as const, top: 3, right: 3,
      width: 7, height: 7, background: '#ef4444',
      borderRadius: '50%', border: `1.5px solid ${theme.headerBg}`,
    },
    themeBtn: {
      background: 'none', border: `1.5px solid ${theme.sidebarBorder}`, borderRadius: 8,
      color: theme.textSub, padding: '0.375rem', cursor: 'pointer',
      display: 'flex', alignItems: 'center',
    },
    logoutBtn: {
      display: 'flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.4rem 0.875rem', background: 'none',
      border: `1.5px solid ${theme.sidebarBorder}`, borderRadius: 8,
      fontSize: '0.8rem', color: theme.textSub, cursor: 'pointer',
    },
    content: { padding: '1.5rem', flex: 1 },
    overlay: {
      display: isMobile && menuOpen ? 'block' : 'none',
      position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99,
    },
    navSectionLabel: {
      margin: '0.625rem 0.875rem 0.25rem',
      fontSize: '0.7rem', fontWeight: 600,
      color: theme.isDark ? '#475569' : '#c4cdd6',
      textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    },
  };

  return (
    <div style={S.wrapper}>
      <aside style={S.sidebar}>
        <div style={S.brandRow}>
          <div style={S.brandInner}>
            <img src="/shamba.svg" alt="Shamba Records" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
          </div>
          {isMobile && (
            <button style={S.collapseBtn} onClick={() => setMenuOpen(false)}>
              <X size={18} />
            </button>
          )}
        </div>
        <nav style={S.nav}>
          {NAV_ITEMS.map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              style={({ isActive }) => ({
                ...S.navLinkBase,
                ...(isActive ? S.navLinkActive : {}),
              })}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <>
              <div style={S.navSectionLabel}>Admin</div>              {ADMIN_NAV_ITEMS.map(({ to, Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    ...S.navLinkBase,
                    ...(isActive ? S.navLinkActive : {}),
                  })}
                >
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div style={S.userSection}>
          <div style={S.userCard}>
            <div style={S.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.userName}>{user?.name}</div>
              <div style={S.userRole}>{user?.role === 'admin' ? 'Admin' : 'Field Agent'}</div>
            </div>
            <ChevronDown size={14} color="#9ca3af" />
          </div>
        </div>
      </aside>

      <div style={S.main}>
        <header style={S.header}>
          <button style={S.menuBtn} onClick={() => setMenuOpen((o) => !o)}>
            <Menu size={22} />
          </button>
          <div style={S.searchWrap}>
            <span style={S.searchIconWrap}><Search size={15} /></span>
            <input style={S.searchInput} placeholder="Search..." readOnly />
          </div>
          <div style={S.headerRight}>
            <div style={S.bellWrap}>
              <button style={S.bellBtn}><Bell size={20} /></button>
              <span style={S.bellDot} />
            </div>
            <button style={S.themeBtn} onClick={toggleTheme} title={theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme.isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button style={S.logoutBtn} onClick={handleLogout}>
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </header>
        <main style={S.content}><Outlet /></main>
      </div>

      <div style={S.overlay} onClick={() => setMenuOpen(false)} />
    </div>
  );
}
