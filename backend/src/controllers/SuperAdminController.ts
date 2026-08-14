import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';

export class SuperAdminController {
  
  // Lista todos os Tenants (Empresas) cadastrados
  async listTenants(req: Request, res: Response) {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          _count: {
            select: { users: true, surveys: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(tenants);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  }

  // Cria um novo Tenant e já provisiona um primeiro usuário ADMIN para aquela empresa
  async createTenant(req: Request, res: Response) {
    const { name, document, adminName, adminEmail, adminPassword } = req.body;

    try {
      const tenantExists = await prisma.tenant.findUnique({ where: { document } });
      if (tenantExists) {
        return res.status(400).json({ error: 'Empresa (Tenant) já existe' });
      }

      const userExists = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (userExists) {
        return res.status(400).json({ error: 'E-mail de administrador já em uso' });
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 8);

      const tenant = await prisma.tenant.create({
        data: {
          name,
          document,
          users: {
            create: {
              name: adminName,
              email: adminEmail,
              password: hashedPassword,
              role: 'ADMIN'
            }
          }
        },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });

      return res.status(201).json(tenant);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  }
}
