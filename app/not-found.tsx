import { NotFoundState } from '@/components/ui/not-found-state';

export default function NotFound() {
  return (
    <main className="bg-surface dark:bg-surface-dark grid min-h-dvh place-items-center px-6 text-center">
      <NotFoundState body="The page you were looking for does not exist." />
    </main>
  );
}
