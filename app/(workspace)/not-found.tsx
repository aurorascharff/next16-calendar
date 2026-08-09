import { NotFoundState } from '@/components/ui/not-found-state';

export default function WorkspaceNotFound() {
  return (
    <main className="grid min-h-0 min-w-0 flex-1 place-items-center px-6 text-center">
      <NotFoundState body="Pick a date or return to your calendar workspace." />
    </main>
  );
}
