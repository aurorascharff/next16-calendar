<div align="center">

<img src="public/logo.svg" alt="Dayline" width="72" height="72" />

# Dayline

A [Next.js 16.3](https://nextjs.org/blog/next-16-3) calendar workspace demonstrating [Instant Navigations](https://nextjs.org/docs/app/guides/instant-navigation).

</div>

---

## Features

- **[Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)** cache each week with `'use cache'`, name the data with `cacheTag`, and set its lifetime with `cacheLife`, so repeated reads come from the cache until a tag is invalidated.
- **[Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)** prefetches the shared app shell as links enter the viewport, so week-to-week navigation commits instantly and the schedule streams in behind it.
- **[Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data)** run mutations — moving, creating, editing, and deleting events, and booking a slot — on the server and invalidate only the tags they change with [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag).
- **[View Transitions](https://nextjs.org/docs/app/guides/view-transitions)** slide the schedule left/right as you move through weeks while the header and controls stay pinned.
- **[Async React](https://react.dev/)** keeps the UI interactive with `Suspense`, `useOptimistic`, `useTransition`, and `useFormStatus` — drag-and-drop rescheduling and event edits apply optimistically.
- **[React Compiler](https://react.dev/learn/react-compiler)** memoizes components automatically, so the code needs no manual `useMemo`/`useCallback`.

## Getting started

Dayline runs on SQLite locally with zero setup:

```bash
pnpm install
pnpm run prisma.push
pnpm run prisma.seed
pnpm run dev
```

The default `DATABASE_URL` is `file:./prisma/pace.db`.

<details>
<summary>Run on Postgres for production</summary>

Swap `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`, replace `@prisma/adapter-better-sqlite3` with `@prisma/adapter-pg` in `lib/db.ts` and `prisma/seed.ts`, and set `DATABASE_URL` to your Postgres connection string in `.env.local`. The schema is otherwise identical.

</details>

## Testing

End-to-end tests use [`@next/playwright`](https://nextjs.org/docs/app/guides/testing/playwright):

```bash
pnpm test:e2e
```

## Stack

- **[Next.js 16.3](https://nextjs.org/)**: App Router, Cache Components, Server Functions
- **[React 19](https://react.dev/)** with React Compiler: Suspense, View Transitions, `useOptimistic`
- **[TypeScript](https://www.typescriptlang.org/)** and **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Prisma 7](https://www.prisma.io/)** on SQLite (Postgres-ready)
- **[Ariakit](https://ariakit.org/)** for accessible dialogs and popovers

## License

[MIT](LICENSE)
