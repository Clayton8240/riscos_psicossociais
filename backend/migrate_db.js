const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const db = new Database('./prisma/dev.db');
const prisma = new PrismaClient();

async function migrate() {
    console.log("Starting migration...");
    
    const tables = [
        { name: 'tenants', model: prisma.tenant },
        { name: 'users', model: prisma.user },
        { name: 'surveys', model: prisma.survey },
        { name: 'questions', model: prisma.question },
        { name: 'submissions', model: prisma.submission },
        { name: 'answers', model: prisma.answer },
        { name: 'action_plans', model: prisma.actionPlan }
    ];

    for (const table of tables) {
        console.log(`Migrating ${table.name}...`);
        const rows = db.prepare(`SELECT * FROM ${table.name}`).all();
        console.log(`Found ${rows.length} rows in ${table.name}.`);
        
        for (const row of rows) {
            // Convert SQLite numeric/string dates to JS Date objects if they exist
            if (row.createdAt) row.createdAt = new Date(row.createdAt);
            if (row.updatedAt) row.updatedAt = new Date(row.updatedAt);
            if (row.deadline) row.deadline = new Date(row.deadline);
            
            try {
                await table.model.create({ data: row });
            } catch (e) {
                console.error(`Failed to insert row in ${table.name}:`, e.message);
            }
        }
        console.log(`Finished ${table.name}.`);
    }
    
    console.log("Migration complete!");
}

migrate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
