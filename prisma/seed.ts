import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'dev@vigil.local' },
    update: {},
    create: {
      email: 'dev@vigil.local',
      passwordHash: '$2b$10$placeholder_will_be_replaced_in_auth_feature',
      monitors: {
        create: [
          { name: 'Google', url: 'https://google.com' },
          { name: 'GitHub', url: 'https://github.com' },
        ],
      },
    },
  });

  console.log(`Seeded user: ${user.email}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
