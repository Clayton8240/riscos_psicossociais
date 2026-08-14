import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prismaClient';

export class AuthController {
  async authenticate(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const isValidPassword = user.password ? await bcrypt.compare(password, user.password) : false;

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      const secret = process.env.JWT_SECRET || 'supersecret_key_change_in_production';
      
      const token = jwt.sign(
        { id: user.id, tenantId: user.tenantId, role: user.role },
        secret,
        { expiresIn: '1d' }
      );

      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Apenas para testes/setup inicial (normalmente em outro controller)
  async createTenantAndUser(req: Request, res: Response) {
    const { tenantName, document, userName, email, password } = req.body;

    try {
      const tenantExists = await prisma.tenant.findUnique({ where: { document } });
      if (tenantExists) {
        return res.status(400).json({ error: 'Tenant já existe' });
      }

      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          document,
          users: {
            create: {
              name: userName,
              email,
              password: hashedPassword,
              role: 'ADMIN'
            }
          }
        },
        include: {
          users: true
        }
      });

      return res.status(201).json(tenant);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Endpoint para criar o primeiro SUPERADMIN do sistema (normalmente fechado após o setup)
  async createSuperAdmin(req: Request, res: Response) {
    const { name, email, password } = req.body;

    try {
      const userExists = await prisma.user.findUnique({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Usuário já existe' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);

      const superadmin = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'SUPERADMIN'
        }
      });

      return res.status(201).json(superadmin);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao criar Super Admin' });
    }
  }

  // Novo endpoint: Preparação para SSO Corporativo (Active Directory)
  async loginSSO(req: Request, res: Response) {
    const { ssoToken, email, name, tenantId } = req.body; 
    // Em um ambiente real, receberíamos apenas um código/token do provedor de SSO (ex: SAML/OIDC)
    // e o backend faria a troca do token com o provedor para obter email, nome e grupo.

    try {
      // 1. Simular Validação do Token no Provedor SSO
      if (!ssoToken || ssoToken !== 'mock-valid-ad-token') {
        return res.status(401).json({ error: 'Token SSO Inválido' });
      }

      // 2. Buscar o usuário pelo ssoId (aqui usaremos o email como identificador do SSO mockado)
      let user = await prisma.user.findFirst({
        where: { OR: [{ ssoId: email }, { email }] }
      });

      // 3. Se o usuário não existir, verificar o tenant e criar automaticamente (Auto-provisionamento JIT)
      if (!user) {
        // Verifica se o domínio da empresa (tenantId) existe
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
          return res.status(400).json({ error: 'Empresa não encontrada no sistema' });
        }

        // Criar usuário vinculado ao tenant sem senha (login via SSO)
        user = await prisma.user.create({
          data: {
            name,
            email,
            ssoId: email,
            role: 'EMPLOYEE',
            tenantId: tenant.id
          }
        });
      } else if (!user.ssoId) {
        // Se o usuário existe mas ainda não tem ssoId linkado, vamos fazer o link agora
        user = await prisma.user.update({
          where: { id: user.id },
          data: { ssoId: email }
        });
      }

      // 4. Gerar nosso token JWT interno
      const secret = process.env.JWT_SECRET || 'supersecret_key_change_in_production';
      const token = jwt.sign(
        { id: user.id, tenantId: user.tenantId, role: user.role },
        secret,
        { expiresIn: '1d' }
      );

      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro no processo de Single Sign-On' });
    }
  }
}
