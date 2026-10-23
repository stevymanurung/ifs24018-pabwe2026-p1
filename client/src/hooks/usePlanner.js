import { useContext } from 'react';
import { PlannerContext } from '../context/plannerContext.js';

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlanner harus dipakai di dalam <PlannerProvider>');
  return context;
}
