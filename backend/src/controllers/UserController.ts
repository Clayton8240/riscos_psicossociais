import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';

export class UserController {
  
  // GET /users (Listar usuários do tenant, útil para popular o select de "Responsável")
  async list(req: Request, res: Response) {
    const tenantId = req.user?.tenantId;

    if (!tenantId) return res.status(403).json({ error: 'Acesso negado' });

    try {
      const users = await prisma.user.findMany({
        where: { tenantId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { name: 'asc' }
      });
      return res.json(users);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // POST /users (Criar novo usuário/líder)
  async create(req: Request, res: Response) {
    const { name, email, password, role } = req.body;
    const tenantId = req.user?.tenantId;
    const myRole = req.user?.role;

    if (!tenantId) return res.status(403).json({ error: 'Acesso negado' });
    if (myRole !== 'ADMIN' && myRole !== 'SUPERADMIN') {
      return res.status(403).json({ error: 'Apenas administradores podem criar usuários' });
    }

    try {
      // Verifica se e-mail já existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'LEADER',
          tenantId
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }
}
