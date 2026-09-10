import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class SuperAdminController {
  
  // Lista todos os Tenants (Empresas) cadastrados
  async listTenants(req: Request, res: Response) {
    try {
      const tenants = await prisma.tenant.findMany({
        include: {
          _count: {
            select: { users: true, surveys: true }
          },
          subscription: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(tenants);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  }

  // Edita um Tenant existente
  async updateTenant(req: Request, res: Response) {
    const { id } = req.params;
    const { name, document, maxSubmissions, isActive, adminPassword } = req.body;
    try {
      const updateData: any = { name, document };
      if (typeof isActive !== 'undefined') {
        updateData.isActive = isActive;
      }

      let tenant = await prisma.tenant.update({
        where: { id },
        data: updateData
      });

      if (adminPassword) {
        const adminUser = await prisma.user.findFirst({
          where: { tenantId: id, role: 'ADMIN' }
        });
        if (adminUser) {
          const hashedPassword = await bcrypt.hash(adminPassword, 8);
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { password: hashedPassword }
          });
        }
      }
      
      // Atualiza o maxSubmissions da Subscription se for um Tenant Single
      if (tenant.subscriptionId && maxSubmissions) {
        await prisma.subscription.update({
          where: { id: tenant.subscriptionId },
          data: { maxSubmissions: parseInt(maxSubmissions) }
        });
      }
      return res.json(tenant);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao editar empresa' });
    }
  }

  // Cria um novo Tenant e já provisiona um primeiro usuário ADMIN para aquela empresa
  async createTenant(req: Request, res: Response) {
    const { name, document, adminName, adminEmail, adminPassword, subscriptionId, maxSubmissions } = req.body;

    try {
      const tenantExists = await prisma.tenant.findUnique({ where: { document } });
      if (tenantExists) {
        return res.status(400).json({ error: 'Empresa (Tenant) já existe' });
      }

      const userExists = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (userExists) {
        return res.status(400).json({ error: 'E-mail de administrador já em uso' });
      }

      if (subscriptionId) {
        const subscription = await prisma.subscription.findUnique({
          where: { id: subscriptionId },
          include: { _count: { select: { tenants: true } } }
        });

        if (!subscription) {
          return res.status(404).json({ error: 'Assinatura não encontrada' });
        }

        if (!['DEMAND', 'LICENSE'].includes(subscription.planType) && subscription._count.tenants >= subscription.maxTenants) {
          return res.status(403).json({ error: 'Limite de empresas atingido para este plano. Faça upgrade para adicionar mais empresas.' });
        }
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 8);

      // Passo 1: Cria a empresa sem usuários
      let tenant = await prisma.tenant.create({
        data: { name, document }
      });

      // Passo 2: Cria o administrador atrelado à empresa
      const user = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          tenantId: tenant.id
        }
      });

      // Passo 3: Cria ou vincula a Assinatura (Subscription)
      if (subscriptionId) {
        tenant = await prisma.tenant.update({
          where: { id: tenant.id },
          data: { subscriptionId }
        });
      } else {
        // Se não foi passado subscriptionId, é uma "Empresa Única" (SINGLE) criada pelo SuperAdmin
        const sub = await prisma.subscription.create({
          data: {
            planType: 'SINGLE',
            maxTenants: 1,
            maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : 50,
            ownerId: user.id
          }
        });
        tenant = await prisma.tenant.update({
          where: { id: tenant.id },
          data: { subscriptionId: sub.id }
        });
      }

      return res.status(201).json(tenant);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  }

  // Cria um Consultor e sua respectiva Assinatura (Plano)
  async createConsultant(req: Request, res: Response) {
    const { adminName, adminEmail, adminPassword, plan, maxTenants, maxSubmissions } = req.body;
    try {
      const userExists = await prisma.user.findUnique({ where: { email: adminEmail } });
      if (userExists) {
        return res.status(400).json({ error: 'E-mail de consultor já em uso' });
      }

      const hashedPassword = await bcrypt.hash(adminPassword, 8);

      const user = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: 'CONSULTANT'
        }
      });

      const subscription = await prisma.subscription.create({
        data: {
          planType: plan || 'BRONZE',
          maxTenants: maxTenants ? parseInt(maxTenants) : 5,
          maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : 100,
          ownerId: user.id
        }
      });

      return res.status(201).json({ user, subscription });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar consultor' });
    }
  }

  // Lista todos os Consultores
  async listConsultants(req: Request, res: Response) {
    try {
      const consultants = await prisma.user.findMany({
        where: { role: 'CONSULTANT' },
        include: {
          subscription: true // o ownerId da subscription
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(consultants);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar consultores' });
    }
  }

  // Edita um Consultor
  async updateConsultant(req: Request, res: Response) {
    const { id } = req.params;
    const { adminName, plan, maxTenants, maxSubmissions, isActive, adminPassword } = req.body;
    try {
      const updateData: any = { name: adminName };
      if (typeof isActive !== 'undefined') {
        updateData.isActive = isActive;
      }
      if (adminPassword) {
        updateData.password = await bcrypt.hash(adminPassword, 8);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });
      
      // O Consultor tem uma subscription que ele é dono (owner)
      const sub = await prisma.subscription.findFirst({ where: { ownerId: id } });
      if (sub) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            planType: plan || sub.planType,
            maxTenants: maxTenants ? parseInt(maxTenants) : sub.maxTenants,
            maxSubmissions: maxSubmissions ? parseInt(maxSubmissions) : sub.maxSubmissions
          }
        });
      }
      return res.json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao editar consultor' });
    }
  }

  // Exclui um Consultor e seus Tenants (se quiser ser drástico) ou apenas o consultor
  async deleteConsultant(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.$transaction(async (tx: any) => {
        // Encontra a subscription do consultor
        const sub = await tx.subscription.findFirst({ where: { ownerId: id } });
        if (sub) {
           // Encontrar tenants da subscription e apagar todos (opcional, mas necessário se formos limpar tudo)
           const tenants = await tx.tenant.findMany({ where: { subscriptionId: sub.id } });
           for (const t of tenants) {
             const surveys = await tx.survey.findMany({ where: { tenantId: t.id } });
             const surveyIds = surveys.map((s: any) => s.id);
             if (surveyIds.length > 0) {
               await tx.answer.deleteMany({
                 where: { OR: [ { submission: { surveyId: { in: surveyIds } } }, { question: { surveyId: { in: surveyIds } } } ] }
               });
               await tx.submission.deleteMany({ where: { surveyId: { in: surveyIds } } });
               await tx.question.deleteMany({ where: { surveyId: { in: surveyIds } } });
               await tx.survey.deleteMany({ where: { tenantId: t.id } });
             }
             await tx.actionPlan.deleteMany({ where: { tenantId: t.id } });
             await tx.user.deleteMany({ where: { tenantId: t.id } });
             await tx.tenant.delete({ where: { id: t.id } });
           }
           await tx.subscription.delete({ where: { id: sub.id } });
        }
        await tx.user.delete({ where: { id } });
      });
      return res.status(200).json({ message: 'Consultor excluído com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao excluir consultor' });
    }
  }

  // Exclui um Tenant e todos os seus dados vinculados
  async deleteTenant(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Usar transaction para garantir que se algo falhar, faz rollback
      await prisma.$transaction(async (tx: any) => {
        // Encontrar as pesquisas deste tenant
        const surveys = await tx.survey.findMany({ where: { tenantId: id } });
        const surveyIds = surveys.map((s: any) => s.id);

        if (surveyIds.length > 0) {
          // Deletar respostas (Answers) vinculadas às Submissions das Surveys ou Questions das Surveys
          await tx.answer.deleteMany({
            where: {
              OR: [
                { submission: { surveyId: { in: surveyIds } } },
                { question: { surveyId: { in: surveyIds } } }
              ]
            }
          });

          // Deletar Submissions e Questions
          await tx.submission.deleteMany({ where: { surveyId: { in: surveyIds } } });
          await tx.question.deleteMany({ where: { surveyId: { in: surveyIds } } });
          
          // Deletar as Surveys
          await tx.survey.deleteMany({ where: { tenantId: id } });
        }

        // Deletar Action Plans
        await tx.actionPlan.deleteMany({ where: { tenantId: id } });

        // Deletar Users
        await tx.user.deleteMany({ where: { tenantId: id } });

        // Por fim, deletar o Tenant
        await tx.tenant.delete({ where: { id } });
      });

      return res.status(200).json({ message: 'Empresa excluída com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao excluir empresa' });
    }
  }

  // Gera um token para o SuperAdmin assumir o controle como ADMIN de uma empresa específica
  async impersonateTenant(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const tenant = await prisma.tenant.findUnique({ where: { id } });
      if (!tenant) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      // Procura o primeiro admin daquela empresa para usar como base (ou gera um token solto)
      const admin = await prisma.user.findFirst({
        where: { tenantId: id, role: 'ADMIN' }
      });

      const userId = admin ? admin.id : req.user?.id; // Se não tiver admin, usa o id do superadmin

      const token = jwt.sign(
        { id: userId, role: 'ADMIN', tenantId: id },
        process.env.JWT_SECRET || 'supersecret_key_change_in_production',
        { expiresIn: '1d' }
      );

      return res.json({ token, role: 'ADMIN', tenantId: id });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao gerar acesso para a empresa' });
    }
  }

  // Retorna configurações globais (ex: pagamentos)
  async getPaymentSettings(req: Request, res: Response) {
    try {
      const configs = await prisma.systemConfig.findMany();
      const settings: Record<string, any> = {};
      
      // Converte array de chave/valor para um objeto
      configs.forEach((c) => {
        try {
          settings[c.key] = JSON.parse(c.value);
        } catch {
          settings[c.key] = c.value;
        }
      });
      return res.json(settings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao buscar configurações de pagamento' });
    }
  }

  // Atualiza configurações globais
  async updatePaymentSettings(req: Request, res: Response) {
    try {
      const updates = req.body; // { stripe_key: "...", payment_method_pix_enabled: true }
      
      const transactions = Object.entries(updates).map(([key, value]) => {
        const stringValue = typeof value === 'object' || typeof value === 'boolean' 
          ? JSON.stringify(value) 
          : String(value);

        return prisma.systemConfig.upsert({
          where: { key },
          update: { value: stringValue },
          create: { key, value: stringValue }
        });
      });

      await prisma.$transaction(transactions);

      return res.json({ message: 'Configurações de pagamento salvas com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao salvar configurações de pagamento' });
    }
  }

}
