const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 8);
  await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: hash,
      name: 'Administrador Local',
      role: 'SUPERADMIN'
    }
  });
  console.log("Admin criado com sucesso!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
