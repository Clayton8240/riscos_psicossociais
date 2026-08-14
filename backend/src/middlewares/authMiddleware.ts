import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  tenantId: string;
  role: string;
  iat: number;
  exp: number;
}

// Extendendo o Request do Express para incluir o usuário logado
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_key_change_in_production');
    
    const { id, tenantId, role } = decoded as TokenPayload;

    req.user = {
      id,
      tenantId,
      role,
      iat: (decoded as any).iat,
      exp: (decoded as any).exp
    };

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
