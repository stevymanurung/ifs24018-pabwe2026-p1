/** Ikon SVG sederhana. Semuanya dekoratif (aria-hidden); label teks selalu ada di sebelahnya. */
function Icon({ children, className = 'h-5 w-5 shrink-0' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      {children}
    </svg>
  );
}

const path = (d) => <path strokeLinecap="round" strokeLinejoin="round" d={d} />;

export const DashboardIcon = (props) => <Icon {...props}>{path('M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zM13 3v6h8V3h-8z')}</Icon>;
export const CalendarIcon = (props) => <Icon {...props}>{path('M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z')}</Icon>;
export const TaskIcon = (props) => <Icon {...props}>{path('M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z')}</Icon>;
export const BellIcon = (props) => <Icon {...props}>{path('M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0a3 3 0 11-6 0')}</Icon>;
export const MenuIcon = (props) => <Icon {...props}>{path('M4 6h16M4 12h16M4 18h16')}</Icon>;
