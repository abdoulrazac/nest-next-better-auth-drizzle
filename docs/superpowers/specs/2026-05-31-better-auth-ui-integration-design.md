# Design: better-auth-ui Integration

**Date:** 2026-05-31  
**Scope:** `apps/frontend` auth pages  
**Library:** better-auth-ui (shadcn/ui flavor)

---

## Goal

Replace the hand-rolled auth pages (`login`, `register`, `forgot-password`) with pre-built components from `better-auth-ui`, add the missing `reset-password` and `sign-out` routes, and wire up the required data layer (`@tanstack/react-query` + `AuthProvider`).

---

## Dependencies

| Package                 | How                                                            |
| ----------------------- | -------------------------------------------------------------- |
| `@tanstack/react-query` | `npm install`                                                  |
| `@better-auth-ui/react` | `npm install`                                                  |
| Sonner                  | `npx shadcn@latest add sonner`                                 |
| Auth components         | `npx shadcn@latest add https://better-auth-ui.com/r/auth.json` |

---

## Architecture

### Provider stack (bottom → top)

```
ThemeProvider
  TooltipProvider
    QueryClientProvider
      AuthProvider
        {children}
```

All providers are composed in a single `src/components/providers.tsx` client component. The root layout imports `<Providers>` and wraps children with it.

### QueryClient

`src/lib/query-client.ts` exports a `getQueryClient()` function:

- **Server:** returns a fresh `QueryClient` per call (no cross-request cache bleed)
- **Client:** returns a stable singleton so React Query cache persists across navigations

### AuthProvider config

`AuthProvider` receives:

- `authClient` — the existing `authClient` from `src/lib/auth-client.ts`
- `navigate` — wraps Next.js `useRouter` push/replace
- `Link` — Next.js `Link` component

---

## Route changes

| Old                                 | New                                       | Action                           |
| ----------------------------------- | ----------------------------------------- | -------------------------------- |
| `app/auth/login/page.tsx`           | `app/auth/[path]/page.tsx` (sign-in view) | Delete old, create dynamic route |
| `app/auth/register/page.tsx`        | dynamic route (sign-up view)              | Delete old                       |
| `app/auth/forgot-password/page.tsx` | dynamic route (forgot-password view)      | Delete old                       |
| _(missing)_                         | dynamic route (reset-password view)       | Added automatically              |
| _(missing)_                         | dynamic route (sign-out view)             | Added automatically              |

The `<Auth />` component from better-auth-ui reads the `[path]` segment and renders the correct view. Valid paths: `sign-in`, `sign-up`, `forgot-password`, `reset-password`, `sign-out`.

---

## Files modified

- `src/app/layout.tsx` — swap direct `ThemeProvider` for `<Providers>`
- `src/lib/auth-client.ts` — no change

## Files created

- `src/lib/query-client.ts`
- `src/components/providers.tsx`
- `src/app/auth/[path]/page.tsx`

## Files deleted

- `src/app/auth/login/` (entire folder)
- `src/app/auth/register/` (entire folder)
- `src/app/auth/forgot-password/` (entire folder)

---

## Internal link updates

Any existing links pointing to `/auth/login` or `/auth/register` must be updated to `/auth/sign-in` and `/auth/sign-up` respectively.

---

## Out of scope

- Settings page (`/settings/[path]`)
- UserButton component
- Social providers
- Magic link / passkey plugins
