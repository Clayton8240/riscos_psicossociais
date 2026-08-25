const { PrismaClient } = require('./backend/node_modules/@prisma/client');
const bcrypt = require('./backend/node_modules/bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 8);
  await prisma.user.update({
    where: { email: 'admin@admin.com' },
    data: { password: hash }
  });
  console.log("Senha resetada para 123456 no usuario admin@admin.com");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
