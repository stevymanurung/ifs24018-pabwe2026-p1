import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import NotFoundPage from './app/NotFoundPage.jsx';
import { ROUTES } from './app/routes.js';
import { AppLayout } from './components/layout/AppLayout.jsx';
import { PlannerProvider } from './context/PlannerProvider.jsx';
import { ReminderProvider } from './features/reminders/ReminderProvider.jsx';
import { AuthPage } from './features/auth/AuthPage.jsx';
import { http } from './services/httpClient.js';

export default function App() {
  const [auth, setAuth] = useState({ status: 'checking', user: null });
  useEffect(() => {
    const token = globalThis.localStorage?.getItem('study-planner-token');
    if (!token) { setAuth({ status: 'signed-out', user: null }); return; }
    http.get('/auth/me').then(({ user }) => setAuth({ status: 'signed-in', user })).catch(() => {
      globalThis.localStorage?.removeItem('study-planner-token');
      setAuth({ status: 'signed-out', user: null });
    });
  }, []);

  const signIn = (result) => {
    globalThis.localStorage?.setItem('study-planner-token', result.token);
    setAuth({ status: 'signed-in', user: result.user });
  };
  const signOut = async () => {
    try { await http.post('/auth/logout', {}); } catch { /* Token lokal tetap dihapus saat server tidak tersedia. */ }
    globalThis.localStorage?.removeItem('study-planner-token');
    setAuth({ status: 'signed-out', user: null });
  };

  if (auth.status === 'checking') return <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-600">Memeriksa sesi login...</div>;
  if (auth.status === 'signed-out') return <AuthPage onAuthenticated={signIn} />;
  return (
    <PlannerProvider>
      <ReminderProvider>
        <div className="relative">
          <div className="fixed right-4 top-3 z-50 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
            <span className="hidden text-slate-600 sm:inline">Halo, <strong className="text-slate-900">{auth.user.name}</strong></span>
            <button type="button" onClick={signOut} className="font-semibold text-indigo-700 hover:text-indigo-900">Keluar</button>
          </div>
          <Routes>
            <Route element={<AppLayout />}>
              {ROUTES.map(({ path, Page }) => <Route key={path} path={path} element={<Page />} />)}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </div>
      </ReminderProvider>
    </PlannerProvider>
  );
}
