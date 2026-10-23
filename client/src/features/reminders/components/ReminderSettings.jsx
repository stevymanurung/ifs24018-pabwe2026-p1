import { Button } from '../../../components/ui/Button.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';

const LEAD_OPTIONS = [
  { value: 0, label: 'Mati' },
  { value: 5, label: '5 menit' },
  { value: 10, label: '10 menit' },
  { value: 15, label: '15 menit' },
  { value: 30, label: '30 menit' },
];

const PERMISSION_TEXT = {
  granted: 'aktif',
  denied: 'diblokir di pengaturan browser',
  unsupported: 'tidak didukung',
  default: 'belum diizinkan',
};

/** Pengaturan global pengingat: menit sebelum kuliah, status bunyi, dan status notifikasi browser. */
export function ReminderSettings({ lead, onChangeLead, controls }) {
  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <Button onClick={controls.enable}>Aktifkan pengingat</Button>
        <Button variant="ghost" onClick={controls.testRing}>
          Tes bunyi
        </Button>
        <SelectField label="Ingatkan kuliah sebelum mulai" className="sm:ml-auto" value={lead} onChange={(event) => onChangeLead(Number(event.target.value))}>
          {LEAD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>
      </div>
      <p role="status" className="mt-3 text-sm text-slate-500">
        Bunyi alarm: {controls.soundReady ? 'aktif' : 'belum diaktifkan (klik "Aktifkan pengingat")'}. Notifikasi browser:{' '}
        {PERMISSION_TEXT[controls.permission] ?? controls.permission}.
      </p>
    </div>
  );
}
