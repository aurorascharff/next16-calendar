import 'server-only'

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
const url = process.env.DATABASE_URL ?? 'file:./prisma/pace.db'
const adapter = new PrismaBetterSqlite3({ url: url.replace(/^file:/, '') })

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
