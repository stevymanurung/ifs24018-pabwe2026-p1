import { describeNextSession } from '../../lib/time.js';

/** Widget "Kuliah berikutnya" di dasar sidebar. */
export function NextClassCard({ next }) {
  const { course, when } = describeNextSession(next);
  return (
    <div className="m-3 rounded-xl bg-slate-800 p-4">
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Kuliah berikutnya</p>
      <p className="mt-1 text-sm font-semibold text-white">{course}</p>
      <p className="text-xs text-slate-400">{when}</p>
    </div>
  );
}
