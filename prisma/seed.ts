import { config } from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { createDemoWorkspace } from '../features/calendar/demo-workspace'
import { normalizeDatabaseUrl } from '../lib/database-url'

config({ path: '.env.local' })

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: normalizeDatabaseUrl(process.env.DATABASE_URL!) }),
})

async function main() {
  await prisma.booking.deleteMany()
  await prisma.bookingPage.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.calendar.deleteMany()
  await prisma.user.deleteMany()

  const aurora = await prisma.user.create({ data: { handle: 'aurora', name: 'Aurora Scharff' } })
  await createDemoWorkspace(prisma, aurora.id, aurora.handle)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
