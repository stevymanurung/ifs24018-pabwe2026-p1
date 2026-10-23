const VARIANTS = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  ghost: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
  danger: 'bg-transparent text-red-600 hover:bg-red-50',
};

const SIZES = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-2.5 py-1 text-xs',
};

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ' +
  'disabled:cursor-not-allowed disabled:opacity-60';

export function Button({ variant = 'primary', size = 'md', type = 'button', className = '', ...props }) {
  return <button type={type} className={`${BASE} ${SIZES[size]} ${VARIANTS[variant]} ${className}`} {...props} />;
}
