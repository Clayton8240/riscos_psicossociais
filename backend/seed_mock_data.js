const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando o mock de dados...");

  // 1. Pegar o admin existente
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@admin.com' }
  });

  if (!admin) {
    console.error("Usuário admin@admin.com não encontrado. Execute seed_admin.js primeiro.");
    return;
  }

  // 2. Criar um Tenant de Teste
  let tenant = await prisma.tenant.findUnique({
    where: { document: '12.345.678/0001-99' }
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        name: 'Empresa Teste Mock',
        document: '12.345.678/0001-99'
      }
    });
  }

  // Atribuir admin ao tenant
  await prisma.user.update({
    where: { id: admin.id },
    data: { tenantId: tenant.id }
  });

  // 3. Criar Pesquisas e Respostas
  const surveysToCreate = [
    {
      title: 'Pesquisa de Clima e Bem-Estar 2026',
      description: 'Pesquisa geral de clima organizacional e identificação de riscos',
      questions: [
        'Como você avalia a comunicação da liderança?',
        'Você sente que sua carga de trabalho é adequada?',
        'Existe colaboração e respeito no seu setor?',
        'As ferramentas oferecidas são suficientes para realizar seu trabalho?',
        'Você se sente seguro psicologicamente no ambiente?'
      ]
    },
    {
      title: 'Avaliação Específica - Sobrecarga',
      description: 'Foco exclusivo em entender o nível de estresse e burnout',
      questions: [
        'Com que frequência você trabalha além do horário?',
        'Você consegue se desligar do trabalho nos finais de semana?',
        'A cobrança por metas gera ansiedade excessiva?',
        'Você já pensou em pedir demissão por causa do estresse?'
      ]
    }
  ];

  const sectors = ['TI', 'RH', 'Comercial', 'Operacional', 'Administrativo'];

  for (const s of surveysToCreate) {
    const survey = await prisma.survey.create({
      data: {
        title: s.title,
        description: s.description,
        tenantId: tenant.id,
        questions: {
          create: s.questions.map(q => ({
            text: q,
            type: 'PROBABILITY_IMPACT'
          }))
        }
      },
      include: {
        questions: true
      }
    });

    console.log(`Pesquisa criada: ${survey.title}`);

    // Gerar entre 15 e 40 respostas aleatórias por pesquisa
    const numSubmissions = Math.floor(Math.random() * 25) + 15;
    
    for (let i = 0; i < numSubmissions; i++) {
      const randomSector = sectors[Math.floor(Math.random() * sectors.length)];
      
      const submission = await prisma.submission.create({
        data: {
          surveyId: survey.id,
          sector: randomSector
        }
      });

      // Gerar respostas para cada pergunta da pesquisa
      for (const question of survey.questions) {
        // Mocking random scores between 1 and 3
        const prob = Math.floor(Math.random() * 3) + 1;
        
        // Let's create some intentional higher risks for 'Comercial' and 'Operacional'
        let impact = Math.floor(Math.random() * 2) + 1;
        if (randomSector === 'Comercial' || randomSector === 'Operacional') {
           impact = Math.floor(Math.random() * 3) + 1; // More chance of high impact
        }

        await prisma.answer.create({
          data: {
            submissionId: submission.id,
            questionId: question.id,
            probabilityScore: prob,
            impactScore: impact
          }
        });
      }
    }
    console.log(` -> Criadas ${numSubmissions} submissões.`);
  }

  console.log("Mock de dados finalizado com sucesso!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
