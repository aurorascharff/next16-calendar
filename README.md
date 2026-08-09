<div align="center">

<img src="public/logo.svg" alt="Flow" width="72" height="72" />

# Next 16 Calendar "Flow"

A calendar and booking-link workspace that demonstrates [Instant Navigations](https://nextjs.org/docs/app/guides/instant-navigation) in [Next.js 16.3](https://nextjs.org/blog/next-16-3-instant-navigations).

[**Live demo →**](https://next16-calendar.vercel.app/)

</div>

---

The architecture follows the [Next.js App Architecture](https://github.com/aurorascharff/skills/tree/main/skills/nextjs-app-architecture) skill and the [Component Architecture for React Server Components](https://aurorascharff.no/posts/component-architecture-for-react-server-components/) blog post.

## Features

- **[Cache Components](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents)** cache calendar weeks and booking-link data with `'use cache'`, name the data with `cacheTag`, and set its lifetime with `cacheLife`, so repeated reads come from the cache until a tag is invalidated.
- **[Partial Prefetching](https://nextjs.org/docs/app/guides/adopting-partial-prefetching)** prefetches the shared app shell as links enter the viewport, so week-to-week navigation commits instantly and the schedule streams in behind it.
- **[Runtime prefetching](https://nextjs.org/docs/app/guides/runtime-prefetching)** lets calendar and booking links prefetch URL-specific data with `<Link prefetch={true}>` before navigation.
- **[Hover-triggered prefetch](https://nextjs.org/docs/app/guides/prefetching#hover-triggered-prefetch)** upgrades only the mini-calendar date reached by pointer, keyboard focus, or touch intent, so the full month does not runtime-prefetch every destination on render.
- **[Server Functions](https://nextjs.org/docs/app/getting-started/mutating-data)** run mutations — moving, creating, editing, and deleting events, and booking a slot — on the server and invalidate only the tags they change with [`updateTag`](https://nextjs.org/docs/app/api-reference/functions/updateTag).
- **[React Compiler](https://react.dev/learn/react-compiler)** memoizes components automatically, so the code needs no manual `useMemo`/`useCallback`.
- **[View Transitions](https://nextjs.org/docs/app/guides/view-transitions)** cross-fade booking content and keep persistent calendar chrome stable as data streams in from Suspense.
- **[Async React](https://github.com/rickhanlonii/async-react)** keeps the UI interactive with `Suspense`, `useOptimistic`, `useTransition`, `useActionState`, `useFormStatus`, and `use`.

## Getting started

Flow runs on Postgres. Set `DATABASE_URL` in `.env.local`, then:

```bash
pnpm install
pnpm run prisma.push
pnpm run prisma.seed
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You can browse the data with `pnpm run prisma.studio`, or wipe and re-seed the database with `pnpm run prisma.reset`.

<details>
<summary>Run locally without Postgres</summary>

Drop this prompt into your agent to swap the datasource for SQLite:

> Set up Flow to run locally on SQLite instead of Postgres. Keep both database adapter stacks installed so the production Postgres setup remains available. Swap `provider = "postgresql"` to `provider = "sqlite"` in `prisma/schema.prisma`. Replace `@prisma/adapter-pg` with `@prisma/adapter-better-sqlite3` in `lib/db.ts` and `prisma/seed.ts`, using `new PrismaBetterSqlite3({ url })` where `url` is `process.env.DATABASE_URL` with the `file:` prefix stripped. Write `DATABASE_URL=file:./prisma/dev.db` to `.env.local`, then run `pnpm run prisma.push` and `pnpm run prisma.seed`.

The schema is otherwise identical, so the rest of the app behaves the same as production.

</details>

## Testing

The end-to-end tests use [`@next/playwright`](https://nextjs.org/docs/app/guides/testing/playwright) with the [`instant()`](https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant) API to assert that loading states appear and that navigations stay instant, and they run in CI.

```bash
pnpm test:e2e
```

## Stack

- **[Next.js 16.3](https://nextjs.org/)**: App Router, Cache Components, Server Functions
- **[React 19](https://react.dev/)** with React Compiler: Suspense, View Transitions, `useOptimistic`
- **[TypeScript](https://www.typescriptlang.org/)** and **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Prisma 7](https://www.prisma.io/)** on PostgreSQL
- **[Ariakit](https://ariakit.org/)** for accessible dialogs and popovers

## License

[MIT](LICENSE)
