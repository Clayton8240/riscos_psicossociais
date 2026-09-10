import { Request, Response } from 'express';
import { prisma } from '../prismaClient';
import bcrypt from 'bcryptjs';

export class SettingsController {
  async getProfile(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user?.id },
        include: { 
          tenant: {
            include: { subscription: true }
          }
        }
      });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      let companyName = user.tenant?.name || '';
      let sectors = user.tenant?.sectors || '[]';
      let subscription = user.tenant?.subscription || null;

      if (req.user?.tenantId && req.user.tenantId !== user.tenantId) {
        const impersonatedTenant = await prisma.tenant.findUnique({ 
          where: { id: req.user.tenantId },
          include: { subscription: true }
        });
        if (impersonatedTenant) {
          companyName = impersonatedTenant.name;
          sectors = impersonatedTenant.sectors;
          subscription = impersonatedTenant.subscription;
        }
      }

      let totalSubmissions = 0;
      if (req.user?.tenantId) {
        totalSubmissions = await prisma.submission.count({
          where: { survey: { tenantId: req.user.tenantId } }
        });
      }

      return res.json({
        name: user.name,
        email: user.email,
        role: req.user?.role || user.role, // Use role from token for impersonation
        companyName,
        sectors: JSON.parse(sectors),
        subscription,
        totalSubmissions
      });
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { name, email, currentPassword, newPassword, companyName, sectors } = req.body;
      const user = await prisma.user.findUnique({ where: { id: req.user?.id } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

      // Se for atualizar email, checar se já existe
      if (email && email !== user.email) {
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) return res.status(400).json({ error: 'E-mail já está em uso' });
      }

      // Se quiser mudar a senha, deve informar a atual
      let updatedPassword = user.password;
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Senha atual é obrigatória para mudar a senha' });
        }
        if (!user.password) {
          return res.status(400).json({ error: 'Usuário não possui senha configurada (SSO)' });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: 'Senha atual incorreta' });
        }
        updatedPassword = await bcrypt.hash(newPassword, 8);
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name || user.name,
          email: email || user.email,
          password: updatedPassword
        }
      });

      if (user.tenantId) {
        const tenantUpdateData: any = {};
        if (companyName) tenantUpdateData.name = companyName;
        // Apenas ADMIN ou SUPERADMIN podem atualizar os setores
        if (sectors && Array.isArray(sectors) && (user.role === 'ADMIN' || user.role === 'SUPERADMIN')) {
          tenantUpdateData.sectors = JSON.stringify(sectors);
        }
        
        if (Object.keys(tenantUpdateData).length > 0) {
          await prisma.tenant.update({
            where: { id: user.tenantId },
            data: tenantUpdateData
          });
        }
      }

      return res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }
}
