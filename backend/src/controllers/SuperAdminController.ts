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

  // Exclui um Tenant e todos os seus dados vinculados
  async deleteTenant(req: Request, res: Response) {
    const { id } = req.params;

    try {
      // Usar transaction para garantir que se algo falhar, faz rollback
      await prisma.$transaction(async (tx) => {
        // Encontrar as pesquisas deste tenant
        const surveys = await tx.survey.findMany({ where: { tenantId: id } });
        const surveyIds = surveys.map(s => s.id);

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

}
