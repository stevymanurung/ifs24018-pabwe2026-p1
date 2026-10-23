import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card.jsx';

export default function NotFoundPage() {
  return (
    <Card title="Halaman tidak ditemukan">
      <p className="text-sm text-slate-600">Alamat yang Anda buka tidak tersedia.</p>
      <Link to="/" className="mt-3 inline-block text-sm font-medium text-indigo-600 hover:underline">
        Kembali ke Dashboard
      </Link>
    </Card>
  );
}
