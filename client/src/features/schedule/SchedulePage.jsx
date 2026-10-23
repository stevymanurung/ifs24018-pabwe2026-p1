import { useMemo } from 'react';
import { Card } from '../../components/ui/Card.jsx';
import { ErrorBanner } from '../../components/ui/ErrorBanner.jsx';
import { FormError } from '../../components/ui/FormError.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';
import { usePlanner } from '../../hooks/usePlanner.js';
import { useSubmit } from '../../hooks/useSubmit.js';
import { groupSessionsByDay } from '../../lib/sessions.js';
import { SessionForm } from './components/SessionForm.jsx';
import { WeekGrid } from './components/WeekGrid.jsx';

export default function SchedulePage() {
  const { sessions } = usePlanner();
  const days = useMemo(() => groupSessionsByDay(sessions.items), [sessions.items]);
  const { submit: removeSession, error: removeError } = useSubmit(sessions.remove);

  return (
    <Card>
      <SessionForm onCreate={sessions.create} />
      <FormError message={removeError} />
      {sessions.status === 'loading' && <LoadingState />}
      {sessions.status === 'error' && <ErrorBanner message={sessions.error.message} onRetry={sessions.reload} />}
      {sessions.status === 'ready' && <WeekGrid days={days} onRemove={removeSession} />}
    </Card>
  );
}
