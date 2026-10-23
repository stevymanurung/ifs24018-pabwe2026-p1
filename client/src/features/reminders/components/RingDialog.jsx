import { useEffect, useRef } from 'react';
import { Button } from '../../../components/ui/Button.jsx';

/** Dialog dering memakai elemen <dialog> bawaan: fokus terkunci dan tombol Esc ditangani browser. */
export function RingDialog({ reminders, onDismiss, onSnooze }) {
  const dialogRef = useRef(null);
  const hasReminders = reminders.length > 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (hasReminders && !dialog.open) dialog.showModal();
    if (!hasReminders && dialog.open) dialog.close();
  }, [hasReminders]);

  function handleCancel(event) {
    event.preventDefault(); // Esc dianggap "matikan", bukan menutup tanpa menghentikan bunyi
    onDismiss();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      aria-labelledby="ring-title"
      className="m-auto w-full max-w-md rounded-2xl bg-white p-7 text-center shadow-2xl backdrop:bg-slate-900/70"
    >
      <p className="animate-bell text-5xl" aria-hidden="true">
        &#128276;
      </p>
      <h2 id="ring-title" className="mt-2 text-xl font-bold text-slate-900">
        Pengingat
      </h2>
      <ul className="mt-3 divide-y divide-slate-200 text-sm text-slate-700">
        {reminders.map((reminder) => (
          <li key={reminder.key} className="py-2">
            <strong className="block">{reminder.title}</strong>
            {reminder.text}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex justify-center gap-3">
        <Button variant="ghost" onClick={onSnooze}>
          Tunda 5 menit
        </Button>
        <Button onClick={onDismiss}>Matikan</Button>
      </div>
    </dialog>
  );
}
