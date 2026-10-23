import { formatLongDate } from '../../lib/time.js';
import { Button } from '../ui/Button.jsx';
import { MenuIcon } from '../ui/icons.jsx';

export function Topbar({ title, onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
      <Button variant="ghost" className="lg:hidden" aria-label="Buka menu" aria-controls="sidebar" onClick={onMenuClick}>
        <MenuIcon />
      </Button>
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <p className="ml-auto hidden text-sm text-slate-500 sm:block">{formatLongDate(new Date())}</p>
    </header>
  );
}
