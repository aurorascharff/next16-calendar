'use client';

import { Check, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';

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
    <div className="mt-1">
      <Input form={formId} name="title" type="hidden" value={title} variant="unstyled" />
      <div className="relative h-12">
        {editing ? (
          <Input
            aria-label="Meeting title"
            onChange={event => setTitle(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              setEditing(false);
            }}
            ref={inputRef}
            required
            value={title}
            variant="title"
          />
        ) : (
          <h1
            className="flex h-12 min-w-0 items-center truncate pr-10 text-base font-semibold tracking-tight sm:text-xl"
            title={title}
          >
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
