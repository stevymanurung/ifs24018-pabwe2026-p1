import { Button } from '../../../components/ui/Button.jsx';
import { FormError } from '../../../components/ui/FormError.jsx';
import { SelectField } from '../../../components/ui/SelectField.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { useFormFields } from '../../../hooks/useFormFields.js';
import { useSubmit } from '../../../hooks/useSubmit.js';
import { DAY_NAMES } from '../../../lib/time.js';

const INITIAL_VALUES = { course: '', day: '0', start: '', end: '', room: '' };

/** Formulir tambah sesi. Validasi dilakukan server; pesan kesalahannya ditampilkan apa adanya. */
export function SessionForm({ onCreate }) {
  const { values, bind, reset } = useFormFields(INITIAL_VALUES);
  const { submit, pending, error } = useSubmit(onCreate);

  async function handleSubmit(event) {
    event.preventDefault();
    if (await submit({ ...values, day: Number(values.day) })) reset();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <TextField label="Mata kuliah / kegiatan" className="lg:col-span-2" maxLength={80} autoComplete="off" {...bind('course')} />
        <SelectField label="Hari" {...bind('day')}>
          {DAY_NAMES.map((name, day) => (
            <option key={name} value={day}>
              {name}
            </option>
          ))}
        </SelectField>
        <TextField label="Jam mulai" type="time" {...bind('start')} />
        <TextField label="Jam selesai" type="time" {...bind('end')} />
        <TextField label="Ruang (opsional)" maxLength={30} {...bind('room')} />
      </div>
      <div className="mt-3">
        <Button type="submit" disabled={pending}>
          Tambah Jadwal
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}
