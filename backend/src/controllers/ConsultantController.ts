import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';

export class ConsultantController {
  
  // Endpoint para um usuário se inscrever ou alterar seu plano como Consultor
  async subscribe(req: Request, res: Response) {
    const userId = req.user?.id;
    const { planType } = req.body; // START, PRO, ENTERPRISE
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    let maxTenants = 3;
    let maxSubmissions = 150;

    if (planType === 'PRO') {
      maxTenants = 10;
      maxSubmissions = 600;
    } else if (planType === 'ENTERPRISE') {
      maxTenants = 25;
      maxSubmissions = 2000;
    }

    try {
      const subscription = await prisma.subscription.upsert({
        where: { ownerId: userId },
        update: {
          planType,
          maxTenants,
          maxSubmissions
        },
        create: {
          ownerId: userId,
          planType,
          maxTenants,
          maxSubmissions
        }
      });

      return res.json({ message: 'Plano atualizado com sucesso', subscription });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao processar assinatura' });
    }
  }

  // Consultor lista as empresas clientes que ele gerencia
  async listClientTenants(req: Request, res: Response) {
    const userId = req.user?.id;

    try {
      const subscription = await prisma.subscription.findUnique({
        where: { ownerId: userId },
        include: {
          tenants: {
            include: {
              _count: { select: { surveys: true, users: true } },
              surveys: {
                include: { _count: { select: { submissions: true } } }
              }
            }
          }
        }
      });

      if (!subscription) {
        return res.status(404).json({ error: 'Assinatura de consultor não encontrada' });
      }

      // Format response to show submission usage
      let totalSubmissions = 0;
      const tenants = subscription.tenants.map((tenant: any) => {
        let tenantSubmissions = 0;
        tenant.surveys.forEach((survey: any) => {
          tenantSubmissions += survey._count.submissions;
        });
        totalSubmissions += tenantSubmissions;
        
        return {
          id: tenant.id,
          name: tenant.name,
          document: tenant.document,
          createdAt: tenant.createdAt,
          totalSurveys: tenant._count.surveys,
          totalUsers: tenant._count.users,
          totalSubmissions: tenantSubmissions
        };
      });

      return res.json({
        subscription: {
          planType: subscription.planType,
          maxTenants: subscription.maxTenants,
          maxSubmissions: subscription.maxSubmissions,
          currentTenants: tenants.length,
          currentSubmissions: totalSubmissions
        },
        tenants
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar empresas clientes' });
    }
  }

  // Consultor cria uma empresa cliente diretamente (sem depender do SuperAdmin)
  async createClientTenant(req: Request, res: Response) {
    const userId = req.user?.id;
    const { name, document, adminName, adminEmail, adminPassword } = req.body;

    try {
      // 1. Validar assinatura e limites
      const subscription = await prisma.subscription.findUnique({
        where: { ownerId: userId },
        include: { _count: { select: { tenants: true } } }
      });

      if (!subscription) {
        return res.status(403).json({ error: 'Você não possui uma assinatura de consultor ativa.' });
      }

      if (subscription._count.tenants >= subscription.maxTenants) {
        return res.status(403).json({ error: 'Limite de empresas atingido para o seu plano. Faça upgrade para adicionar mais clientes.' });
      }

      const tenantExists = await prisma.tenant.findUnique({ where: { document } });
      if (tenantExists) {
        return res.status(400).json({ error: 'Empresa (documento) já cadastrada.' });
      }

      const userExists = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (userExists) {
        return res.status(400).json({ error: 'E-mail do administrador da empresa cliente já está em uso.' });
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 8);

      // 2. Criar Tenant vinculado à assinatura do Consultor
      const tenant = await prisma.tenant.create({
        data: {
          name,
          document,
          subscriptionId: subscription.id, // Vínculo com a assinatura
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
      return res.status(500).json({ error: 'Erro ao criar empresa cliente' });
    }
  }

  // Editar um Tenant
  async updateClientTenant(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, document, maxTenants, maxSubmissions } = req.body;

    try {
      const subscription = await prisma.subscription.findUnique({ where: { ownerId: userId } });
      if (!subscription) return res.status(403).json({ error: 'Acesso negado' });

      const tenant = await prisma.tenant.findFirst({ where: { id, subscriptionId: subscription.id } });
      if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado ou não pertence a você' });

      const updated = await prisma.tenant.update({
        where: { id },
        data: { name, document }
      });
      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar tenant' });
    }
  }

  // Excluir um Tenant
  async deleteClientTenant(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
      const subscription = await prisma.subscription.findUnique({ where: { ownerId: userId } });
      if (!subscription) return res.status(403).json({ error: 'Acesso negado' });

      const tenant = await prisma.tenant.findFirst({ where: { id, subscriptionId: subscription.id } });
      if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado ou não pertence a você' });

      await prisma.tenant.delete({ where: { id } });
      return res.json({ message: 'Tenant excluído com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao excluir tenant' });
    }
  }

  // Impersonate (Acessar a conta do cliente)
  async impersonateClientTenant(req: Request, res: Response) {
    const userId = req.user?.id;
    const { id } = req.params; // ID do tenant a ser acessado

    try {
      const subscription = await prisma.subscription.findUnique({ where: { ownerId: userId } });
      if (!subscription) return res.status(403).json({ error: 'Acesso negado' });

      const tenant = await prisma.tenant.findFirst({ where: { id, subscriptionId: subscription.id } });
      if (!tenant) return res.status(404).json({ error: 'Tenant não encontrado ou não pertence a você' });

      // Gera um token efêmero para o Consultor, mas dizendo que ele é ADMIN e tem o tenantId da empresa
      const secret = process.env.JWT_SECRET || 'supersecret_key_change_in_production';
      const jwt = require('jsonwebtoken');
      
      const impersonateToken = jwt.sign(
        { id: userId, tenantId: tenant.id, role: 'ADMIN' },
        secret,
        { expiresIn: '12h' } // Token expira em 12h
      );

      return res.json({ token: impersonateToken, tenantName: tenant.name });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao acessar conta do cliente' });
    }
  }
}

