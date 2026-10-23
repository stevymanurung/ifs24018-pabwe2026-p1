import { badRequest } from '../utils/httpError.js';

const toDetails = (issues) => issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));

/** Memvalidasi bagian request (body/query) dengan skema Zod; hasil bersih menggantikan nilai aslinya. */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const details = toDetails(result.error.issues);
    return next(badRequest(details[0].message, details));
  }
  req[source] = result.data;
  return next();
};

/** Memastikan parameter :id adalah bilangan bulat positif. */
export function parseId(req, _res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return next(badRequest('ID tidak valid'));
  req.params.id = id;
  return next();
}
