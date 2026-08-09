<div align="center">

<img src="public/logo.svg" alt="Dayline" width="72" height="72" />

# Next 16 Calendar "Dayline"

A calendar and booking-link workspace that demonstrates [Instant Navigations](https://nextjs.org/docs/app/guides/instant-navigation) in [Next.js 16.3](https://nextjs.org/blog/next-16-3-instant-navigations).

[**Live demo →**](https://next16-calendar.vercel.app/)

</div>

---

The architecture follows the [Next.js App Architecture](https://github.com/aurorascharff/skills/tree/main/skills/nextjs-app-architecture) skill and the [Component Architecture for React Server Components](https://aurorascharff.no/posts/component-architecture-for-react-server-components/) blog post.

## Features

- **[Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)** cache calendar weeks and booking-link data with `'use cache'`, name the data with `cacheTag`, and set its lifetime with `cacheLife`, so repeated reads come from the cache until a tag is invalidated.
- **[Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)** prefetches the shared app shell as links enter the viewport, so week-to-week navigation commits instantly and the schedule streams in behind it.
- **[Runtime prefetching](https://nextjs.org/docs/app/guides/runtime-prefetching)** lets calendar and booking links prefetch URL-specific data with `<Link prefetch={true}>` before navigation.
- **[Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data)** run mutations — moving, creating, editing, and deleting events, and booking a slot — on the server and invalidate only the tags they change with [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag).
- **[React Compiler](https://react.dev/learn/react-compiler)** memoizes components automatically, so the code needs no manual `useMemo`/`useCallback`.
- **[View Transitions](https://nextjs.org/docs/app/guides/view-transitions)** cross-fade booking content and keep persistent calendar chrome stable as data streams in from Suspense.
- **[Async React](https://github.com/rickhanlonii/async-react)** keeps the UI interactive with `Suspense`, `useOptimistic`, `useTransition`, `useActionState`, `useFormStatus`, and `use`.

## Getting started

Dayline runs on SQLite locally with zero setup:

```bash
pnpm install
pnpm run prisma.push
pnpm run prisma.seed
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The default `DATABASE_URL` is `file:./prisma/pace.db`. You can browse the data with `pnpm run prisma.studio`, or wipe and re-seed the database with `pnpm run prisma.reset`.

<details>
<summary>Run on Postgres for production</summary>

Swap `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`, replace `@prisma/adapter-better-sqlite3` with `@prisma/adapter-pg` in `lib/db.ts` and `prisma/seed.ts`, and set `DATABASE_URL` to your Postgres connection string in `.env.local`.

The schema is otherwise identical, so the rest of the app behaves the same as production.

</details>

## Testing

The end-to-end tests use [`@next/playwright`](https://nextjs.org/docs/app/guides/testing/playwright) with the [`instant()`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant) API to assert that loading states appear and that navigations stay instant.

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
