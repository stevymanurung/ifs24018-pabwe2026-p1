import { Button } from '../../../components/ui/Button.jsx';
import { TASK_FILTERS } from '../../../lib/tasks.js';

export function TaskFilter({ value, onChange }) {
  return (
    <div className="mt-3 flex gap-2" role="group" aria-label="Filter tugas">
      {TASK_FILTERS.map((filter) => (
        <Button
          key={filter.value}
          size="sm"
          variant={filter.value === value ? 'primary' : 'ghost'}
          aria-pressed={filter.value === value}
          onClick={() => onChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
