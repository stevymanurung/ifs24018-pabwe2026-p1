import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskList } from './TaskList.jsx';

const NOW = new Date(2026, 9, 19, 10, 0);
const tasks = [
  { id: 1, title: 'Terlambat', course: 'Basis Data', dueDate: '2026-10-17', remindAt: '', done: false },
  { id: 2, title: 'Selesai', course: '', dueDate: '', remindAt: '', done: true },
];

describe('TaskList', () => {
  it('menandai tugas terlambat dan mencoret tugas selesai', () => {
    render(<TaskList tasks={tasks} now={NOW} onToggle={() => {}} onRemove={() => {}} />);
    expect(screen.getByText(/Tenggat: 2026-10-17 \(terlambat\)/)).toBeInTheDocument();
    expect(screen.getByText('Selesai')).toHaveClass('line-through');
  });

  it('memanggil onToggle dan onRemove dengan data yang tepat', async () => {
    const onToggle = vi.fn();
    const onRemove = vi.fn();
    render(<TaskList tasks={tasks} now={NOW} onToggle={onToggle} onRemove={onRemove} />);

    await userEvent.click(screen.getByLabelText('Tandai selesai: Terlambat'));
    await userEvent.click(screen.getByRole('button', { name: 'Hapus tugas Selesai' }));

    expect(onToggle).toHaveBeenCalledWith(tasks[0]);
    expect(onRemove).toHaveBeenCalledWith(2);
  });

  it('menampilkan keadaan kosong', () => {
    render(<TaskList tasks={[]} now={NOW} onToggle={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Belum ada tugas di sini.')).toBeInTheDocument();
  });
});
