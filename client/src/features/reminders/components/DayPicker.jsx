import { DAY_SHORT_NAMES } from '../../../lib/time.js';

/** Pilihan hari berupa chip; `value` adalah daftar indeks hari (0 = Senin) yang terpilih. */
export function DayPicker({ value, onChange }) {
  const toggle = (day) => onChange(value.includes(day) ? value.filter((selected) => selected !== day) : [...value, day].sort((a, b) => a - b));

  return (
    <fieldset className="flex flex-wrap gap-1.5">
      <legend className="sr-only">Hari alarm</legend>
      {DAY_SHORT_NAMES.map((label, day) => (
        <label key={label} className="cursor-pointer">
          <input type="checkbox" className="peer sr-only" checked={value.includes(day)} onChange={() => toggle(day)} />
          <span className="block rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs select-none peer-checked:border-indigo-600 peer-checked:bg-indigo-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300">
            {label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
