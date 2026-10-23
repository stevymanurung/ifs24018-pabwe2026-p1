import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskForm } from './TaskForm.jsx';

describe('TaskForm', () => {
  it('mengirim nilai formulir lalu mengosongkannya setelah berhasil', async () => {
    const onCreate = vi.fn().mockResolvedValue({});
    render(<TaskForm courses={['Basis Data']} onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText('Judul tugas'), 'Laporan');
    await userEvent.type(screen.getByLabelText('Mata kuliah (opsional)'), 'Basis Data');
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Tugas' }));

    expect(onCreate).toHaveBeenCalledWith({ title: 'Laporan', course: 'Basis Data', dueDate: '', remindAt: '' });
    await waitFor(() => expect(screen.getByLabelText('Judul tugas')).toHaveValue(''));
  });

  it('menampilkan pesan dari server dan mempertahankan isi formulir saat gagal', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Judul tugas tidak boleh kosong'));
    render(<TaskForm courses={[]} onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText('Judul tugas'), '   ');
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Tugas' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Judul tugas tidak boleh kosong');
    expect(screen.getByLabelText('Judul tugas')).toHaveValue('   ');
  });

  it('menonaktifkan tombol selama permintaan berjalan', async () => {
    let finish;
    const onCreate = vi.fn(() => new Promise((resolve) => { finish = resolve; }));
    render(<TaskForm courses={[]} onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText('Judul tugas'), 'A');
    await userEvent.click(screen.getByRole('button', { name: 'Tambah Tugas' }));
    expect(screen.getByRole('button', { name: 'Tambah Tugas' })).toBeDisabled();

    finish({});
    await waitFor(() => expect(screen.getByRole('button', { name: 'Tambah Tugas' })).toBeEnabled());
  });
});
