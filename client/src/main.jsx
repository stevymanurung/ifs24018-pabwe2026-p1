import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Mengikuti perilaku React Router v7 sejak sekarang agar peringatan migrasi tidak muncul.
const ROUTER_FUTURE_FLAGS = { v7_startTransition: true, v7_relativeSplatPath: true };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE_FLAGS}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
