# Puro UI Test

Base frontend on React + TypeScript + Vite with routing, Tailwind CSS v4, and shadcn/ui.

## Routes

- /tokenize
- /orders
- /tokens

`/` and unknown routes redirect to `/tokenize`.

## Structure

```text
src/
  app/
    layouts/
    providers/
    router/
    styles/
  pages/
    tokenize/
    orders/
    tokens/
  shared/
    api/
    ui/
    lib/
```

## UI Stack

- Tailwind v4 via `@tailwindcss/vite`
- shadcn/ui initialized via `components.json`
- Generated UI primitives in `src/shared/ui/*`
- Utility helper `cn()` in `src/shared/lib/utils.ts`

## Commands

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run lint` - run ESLint
- `npm run preview` - preview production build

## Environment

- Create `.env` from `.env.example`
- Set `VITE_RPC_URL` for Solana connection endpoint
- Set `VITE_API_BASE_URL` for backend API base URL
