import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { FormError } from '../../../components/ui/FormError.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { useFormFields } from '../../../hooks/useFormFields.js';
import { useSubmit } from '../../../hooks/useSubmit.js';
import { DayPicker } from './DayPicker.jsx';

const INITIAL_VALUES = { label: '', time: '' };

export function AlarmForm({ onCreate }) {
  const { values, bind, reset } = useFormFields(INITIAL_VALUES);
  const [days, setDays] = useState([]);
  const { submit, pending, error } = useSubmit(onCreate);

  async function handleSubmit(event) {
    event.preventDefault();
    if (await submit({ ...values, days })) {
      reset();
      setDays([]);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-wrap items-end gap-3">
        <TextField label="Nama alarm" className="min-w-48 flex-1" placeholder="Mis. Belajar mandiri" maxLength={40} autoComplete="off" {...bind('label')} />
        <TextField label="Jam alarm" type="time" {...bind('time')} />
        <DayPicker value={days} onChange={setDays} />
        <Button type="submit" disabled={pending}>
          Tambah Alarm
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}
