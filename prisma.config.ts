import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';
import { normalizeDatabaseUrl } from './lib/database-url';

config({ path: '.env.local' });
config({ path: '.env' });

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

export default defineConfig({
  datasource: {
    url: normalizeDatabaseUrl(url),
  },
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  schema: 'prisma/schema.prisma',
});
