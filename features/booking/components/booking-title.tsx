'use client';

import { Check, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export function BookingTitle({ defaultValue, formId }: { defaultValue: string; formId: string }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(defaultValue);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="relative h-12 sm:h-14">
        {editing ? (
          <Textarea
            aria-label="Meeting title"
            onChange={event => setTitle(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              setEditing(false);
            }}
            ref={inputRef}
            required
            rows={2}
            value={title}
            variant="title"
          />
        ) : (
          <h1 className="line-clamp-2 h-12 min-w-0 pt-0.5 pr-10 text-base leading-5 font-semibold tracking-tight sm:h-14 sm:pt-0.5 sm:text-xl sm:leading-7">
            {title}
          </h1>
        )}
        <IconButton
          className="absolute top-1/2 right-0 -translate-y-1/2"
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
