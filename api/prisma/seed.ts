import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Carrega as variáveis de ambiente manualmente se não estiverem carregadas
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed dos alimentos da tabela TACO...');
  const jsonPath = path.join(process.cwd(), 'src/data/taco.json');
  
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Arquivo taco.json não encontrado em: ${jsonPath}`);
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const foods = JSON.parse(fileContent);

  for (const food of foods) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: {
        calories: food.calories,
        carbs: food.carbs,
        protein: food.protein,
        fat: food.fat,
        isCustom: false,
      },
      create: {
        name: food.name,
        calories: food.calories,
        carbs: food.carbs,
        protein: food.protein,
        fat: food.fat,
        isCustom: false,
      },
    });
  }

  console.log(`✅ Seed concluído! ${foods.length} alimentos cadastrados/atualizados.`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
