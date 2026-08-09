import { CalendarDays } from 'lucide-react'
import { SignInForm } from '@/features/user/components/sign-in-form'

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-surface px-6 dark:bg-surface-dark">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-md bg-accent text-white">
            <CalendarDays className="size-5" strokeWidth={2.25} />
          </span>
          <span>Cadence</span>
        </div>
        <SignInForm />
      </div>
    </main>
  )
}
