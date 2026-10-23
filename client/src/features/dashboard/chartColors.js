export const CHART_COLORS = {
  primary: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  muted: '#cbd5e1',
};

/** Warna donat status tugas, menurut `key` dari API. */
export const STATUS_COLORS = {
  done: CHART_COLORS.success,
  active: CHART_COLORS.primary,
  overdue: CHART_COLORS.danger,
};
