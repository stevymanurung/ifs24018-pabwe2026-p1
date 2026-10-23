/** Ruang pesan error tetap disediakan (min-h) supaya tata letak tidak melompat saat pesan muncul. */
export function FormError({ message }) {
  return (
    <p role="alert" className="mt-2 min-h-5 text-sm text-red-600">
      {message}
    </p>
  );
}
