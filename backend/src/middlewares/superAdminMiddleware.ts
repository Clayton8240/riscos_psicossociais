import { Request, Response, NextFunction } from 'express';

export function superAdminMiddleware(req: Request, res: Response, next: NextFunction) {
  const role = req.user?.role;
  if (role !== 'SUPERADMIN') {
    return res.status(403).json({ error: 'Acesso negado. Requer privilégios de Super Admin.' });
  }
  return next();
}
