import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    // Nest `nest build` only emits `src/` → `dist/src/`, so `dist/prisma/seed.js` never exists.
    // Run the TypeScript seed directly (tsx handles ESM + path aliases).
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
