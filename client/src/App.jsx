import { Route, Routes } from 'react-router-dom';
import NotFoundPage from './app/NotFoundPage.jsx';
import { ROUTES } from './app/routes.js';
import { AppLayout } from './components/layout/AppLayout.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {ROUTES.map(({ path, Page }) => (
          <Route key={path} path={path} element={<Page />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
