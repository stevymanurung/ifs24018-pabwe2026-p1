import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { RingDialog } from './RingDialog.jsx';

const reminders = [{ key: 'a', title: 'Kuliah segera dimulai', text: 'Basis Data mulai 08:00' }];

describe('RingDialog', () => {
  it('terbuka dan menampilkan pengingat saat ada yang berdering', () => {
    const { container } = render(<RingDialog reminders={reminders} onDismiss={() => {}} onSnooze={() => {}} />);
    expect(container.querySelector('dialog')).toHaveAttribute('open');
    expect(screen.getByText('Kuliah segera dimulai')).toBeInTheDocument();
    expect(screen.getByText(/Basis Data mulai 08:00/)).toBeInTheDocument();
  });

  it('tertutup saat tidak ada pengingat', () => {
    const { container } = render(<RingDialog reminders={[]} onDismiss={() => {}} onSnooze={() => {}} />);
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('tombol Matikan dan Tunda memanggil handler masing-masing', async () => {
    const onDismiss = vi.fn();
    const onSnooze = vi.fn();
    render(<RingDialog reminders={reminders} onDismiss={onDismiss} onSnooze={onSnooze} />);

    await userEvent.click(screen.getByRole('button', { name: 'Tunda 5 menit' }));
    await userEvent.click(screen.getByRole('button', { name: 'Matikan' }));

    expect(onSnooze).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
