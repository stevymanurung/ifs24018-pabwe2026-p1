import { useId } from 'react';
import { FIELD_CLASS, LABEL_CLASS } from './fieldStyles.js';

/** Input berlabel. `id` dibuat otomatis sehingga label selalu terhubung ke input (aksesibilitas). */
export function TextField({ label, className = '', ...inputProps }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input id={id} className={FIELD_CLASS} {...inputProps} />
    </div>
  );
}
