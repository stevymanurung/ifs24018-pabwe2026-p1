import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../hooks/usePlanner.js', () => ({
  usePlanner: () => ({
    tasks: { items: [{ id: 1, done: false }, { id: 2, done: true }, { id: 3, done: false }] },
    alarms: { items: [{ id: 1, enabled: true }, { id: 2, enabled: false }] },
    dashboard: { data: { nextSession: { daysAhead: 0, session: { course: 'Basis Data', day: 0, start: '10:00', end: '12:00', room: 'GD 514' } } } },
  }),
}));

import { Sidebar } from './Sidebar.jsx';

const renderSidebar = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Sidebar open onNavigate={() => {}} />
    </MemoryRouter>,
  );

describe('Sidebar', () => {
  it('menampilkan keempat menu dengan tautan yang benar', () => {
    renderSidebar();
    expect(screen.getByRole('link', { name: /Dashboard/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Jadwal/ })).toHaveAttribute('href', '/jadwal');
    expect(screen.getByRole('link', { name: /Tugas/ })).toHaveAttribute('href', '/tugas');
    expect(screen.getByRole('link', { name: /Pengingat/ })).toHaveAttribute('href', '/pengingat');
  });

  it('menandai menu aktif dengan aria-current', () => {
    renderSidebar('/tugas');
    expect(screen.getByRole('link', { name: /Tugas/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Dashboard/ })).not.toHaveAttribute('aria-current');
  });

  it('lencana menghitung tugas belum selesai dan alarm aktif', () => {
    renderSidebar();
    expect(screen.getByLabelText('2 item', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getAllByLabelText('1 item')).toHaveLength(1);
  });

  it('widget kuliah berikutnya memakai data dashboard', () => {
    renderSidebar();
    expect(screen.getByText('Basis Data')).toBeInTheDocument();
    expect(screen.getByText('Hari ini, 10:00 - 12:00 (GD 514)')).toBeInTheDocument();
  });
});
