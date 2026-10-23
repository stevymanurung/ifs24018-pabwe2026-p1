import { Button } from '../../../components/ui/Button.jsx';
import { FormError } from '../../../components/ui/FormError.jsx';
import { TextField } from '../../../components/ui/TextField.jsx';
import { useFormFields } from '../../../hooks/useFormFields.js';
import { useSubmit } from '../../../hooks/useSubmit.js';

const INITIAL_VALUES = { title: '', course: '', dueDate: '', remindAt: '' };
const COURSE_LIST_ID = 'course-suggestions';

/** Formulir tambah tugas. `courses` dipakai sebagai saran mata kuliah (datalist). */
export function TaskForm({ courses, onCreate }) {
  const { values, bind, reset } = useFormFields(INITIAL_VALUES);
  const { submit, pending, error } = useSubmit(onCreate);

  async function handleSubmit(event) {
    event.preventDefault();
    if (await submit(values)) reset();
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <TextField label="Judul tugas" className="lg:col-span-2" maxLength={120} autoComplete="off" {...bind('title')} />
        <TextField label="Mata kuliah (opsional)" className="lg:col-span-2" list={COURSE_LIST_ID} maxLength={80} {...bind('course')} />
        <TextField label="Tenggat" type="date" {...bind('dueDate')} />
        <TextField label="Ingatkan jam (opsional)" type="time" {...bind('remindAt')} />
      </div>
      <datalist id={COURSE_LIST_ID}>
        {courses.map((course) => (
          <option key={course} value={course} />
        ))}
      </datalist>
      <div className="mt-3">
        <Button type="submit" disabled={pending}>
          Tambah Tugas
        </Button>
      </div>
      <FormError message={error} />
    </form>
  );
}
