import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { dateKey } from '@/features/calendar/calendar-utils'

export const instant = false

export default async function HomePage() {
  await connection()
  redirect(`/calendar/${dateKey(new Date())}`)
}
