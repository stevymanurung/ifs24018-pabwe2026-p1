import { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../app/routes.js';
import { ErrorBoundary } from '../ErrorBoundary.jsx';
import { LoadingState } from '../ui/LoadingState.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';

const NOT_FOUND_TITLE = 'Halaman tidak ditemukan';

/** Kerangka halaman: sidebar kiri, topbar, dan area konten tempat halaman aktif dirender. */
export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const title = ROUTES.find((route) => route.path === pathname)?.title ?? NOT_FOUND_TITLE;

  useEffect(() => {
    document.title = `${title} - Study Planner`;
  }, [title]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className="min-h-screen">
      <Sidebar open={menuOpen} onNavigate={closeMenu} />
      {menuOpen && <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={closeMenu} aria-hidden="true" />}

      <div className="lg:ml-64">
        <Topbar title={title} onMenuClick={() => setMenuOpen(true)} />
        <main className="mx-auto max-w-6xl p-4 sm:p-6">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
