import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { dateKey } from '@/features/calendar/calendar-utils'

// `connection()` opts this redirect into request-time rendering so reading the
// current date is allowed under Cache Components.
export default async function HomePage() {
  await connection()
  redirect(`/calendar/${dateKey(new Date())}`)
}
