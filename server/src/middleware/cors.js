/** CORS sederhana, aktif hanya jika CORS_ORIGIN diisi (di pengembangan, Vite memakai proxy sehingga tidak perlu). */
export const cors = (origin) => (req, res, next) => {
  if (!origin) return next();
  res.set('Access-Control-Allow-Origin', origin);
  res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  return req.method === 'OPTIONS' ? res.sendStatus(204) : next();
};
