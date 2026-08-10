'use client';

import { Check, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { IconButton } from '@/components/ui/icon-button';

export function BookingTitle({ defaultValue, formId }: { defaultValue: string; formId: string }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  function toggleEditing() {
    if (editing) {
      setEditing(false);
      return;
    }

    setEditing(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }

  return (
    <div className="-mx-2 mt-2 w-[calc(100%+1rem)] sm:mt-1">
      <input form={formId} name="title" type="hidden" value={title} />
      <div className="relative h-9">
        {editing ? (
          <input
            aria-label="Meeting title"
            className="border-divider bg-card/35 focus:border-primary dark:border-divider-dark dark:bg-card-dark/35 h-9 w-full rounded-md border px-2 pr-10 text-xl font-semibold tracking-tight transition-colors outline-none"
            onChange={event => setTitle(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              setEditing(false);
            }}
            ref={inputRef}
            required
            value={title}
          />
        ) : (
          <h1 className="flex h-9 min-w-0 items-center truncate px-2 pr-10 text-xl font-semibold tracking-tight">
            {title}
          </h1>
        )}
        <IconButton
          className="absolute top-1/2 right-1 -translate-y-1/2"
          label={editing ? 'Finish editing meeting title' : 'Edit meeting title'}
          onClick={toggleEditing}
          size="sm"
        >
          {editing ? <Check className="size-4" /> : <Pencil className="size-4" />}
        </IconButton>
      </div>
    </div>
  );
}
