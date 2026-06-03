# Frontend Refactor Design — shadcn-admin style

Date: 2026-06-02

## Overview

Complete refactor of the Next.js frontend (`apps/frontend`) inspired by [shadcn-admin](https://github.com/satnaing/shadcn-admin). The goal is a production-quality admin dashboard with feature-slice architecture, reusable UI patterns, and full integration with the existing NestJS backend.

## Architecture

### File Structure

```
src/
  app/
    (dashboard)/          ← Shell layout (sidebar + header)
      layout.tsx          ← ShadcnUI Sidebar + header
      page.tsx            ← Dashboard: stats cards + recharts
      account/
        users/page.tsx    ← Users CRUD
        roles/page.tsx    ← Roles CRUD
        audit-logs/page.tsx ← Audit logs (read-only)
      notifications/page.tsx ← Notification centre
      files/page.tsx      ← File manager
      settings/
        page.tsx          ← Settings profile tab (default)
        app/page.tsx      ← App settings tab (admin)
        preferences/page.tsx ← User preferences tab
      webhooks/page.tsx   ← Webhooks CRUD + deliveries
      messaging/page.tsx  ← Chat (conversations list + message thread)
    auth/[path]/          ← Auth (better-auth-ui, already done)
    (errors)/
      not-found.tsx       ← 404
      error.tsx           ← 500
  features/               ← Feature slices
    dashboard/
    users/
    roles/
    audit-logs/
    notifications/
    files/
    settings/
    webhooks/
    messaging/
  components/
    layout/               ← AppSidebar, Header, NavGroup, NavUser
    data-table/           ← Reusable TanStack Table components
    ui/                   ← ShadcnUI components
  hooks/                  ← Shared hooks
  lib/                    ← utils, auth-client, api, query-client
```

### Feature Slice Structure

Each feature follows this internal structure:

```
features/<name>/
  index.tsx           ← Main page component (exported)
  columns.tsx         ← Table column definitions (if table)
  <name>-table.tsx    ← Table component with toolbar
  <name>-form.tsx     ← Form component (shared by dialog/page)
  create-dialog.tsx   ← Create form dialog
  edit-dialog.tsx     ← Edit form dialog (or unified mutate-dialog)
  delete-dialog.tsx   ← Confirm delete dialog
  detail-sheet.tsx    ← Detail slide-over sheet
  hooks.ts            ← React Query hooks (useXxx, useCreateXxx, etc.)
  schema.ts           ← Zod validation schemas
  types.ts            ← TypeScript interfaces/types
```

## Pages & Features

### Dashboard

- Stat cards: total users, active sessions, files stored, notifications
- Area chart: activity over time (Recharts)
- Recent users list

### Users (`/account/users`)

- Data table: name, email, role, status, created_at
- Toolbar: search, status filter, role filter
- Actions: create (dialog), edit (dialog), ban/unban (confirm dialog), view details (sheet)
- Bulk actions: delete selected

### Roles (`/account/roles`)

- Data table: name, description, user count
- Actions: create, edit, delete (dialogs)
- Assign role to user (dialog)

### Audit Logs (`/account/audit-logs`)

- Data table: user, action, resource, timestamp, IP
- Filters: date range, user, action type
- Read-only (no mutations)

### Notifications (`/notifications`)

- List view (card style) with unread badge
- Actions: mark read, mark all read, delete
- Real-time unread count in sidebar badge

### Files (`/files`)

- Dual view: table and card grid (toggle)
- Upload via presigned S3 URL (dialog)
- Preview sheet, delete action
- Filters: type, date

### Settings (`/settings`)

- Tabs: Profile (user preferences), App Settings (admin), Preferences (display)
- Profile: name, avatar, email display
- App: app name, logo, theme defaults
- Preferences: language, notifications, display density

### Webhooks (`/webhooks`)

- Data table: name, URL, events, status, last delivery
- Create/Edit dialog: URL, events checkboxes, secret, active toggle
- Detail sheet: webhook info + deliveries history table

### Messaging (`/messaging`)

- Two-pane layout: conversation list (left) + message thread (right)
- Conversation list: avatar, name, last message, unread badge
- Message thread: messages with reactions, timestamp, sender avatar
- Compose: textarea + send button + attachment upload
- Real-time via WebSocket (`ws://`) with reconnection logic
- New conversation dialog

### Error Pages

- 404, 500 — styled error pages with back button

## Component Patterns

### Data Table

TanStack Table v8 with:

- Sortable column headers
- Search input
- Faceted filters (popover multi-select)
- Pagination (page size select + prev/next)
- Column visibility toggle
- Row actions (dropdown)
- Bulk selection + bulk action bar

### Form Dialogs

React Hook Form + Zod:

- Dialog wraps Form
- Submit triggers React Query mutation
- Loading state on submit button
- Toast on success/error (Sonner)
- Reset on close

### Detail Sheets

Slide-over Sheet:

- Header: title + close button + action buttons
- Body: key-value detail grid
- Optional sub-table (e.g., webhook deliveries)

## State Management

- **Server state**: TanStack Query (useQuery/useMutation)
- **Client state**: React useState/useReducer (component-local)
- **Auth state**: better-auth client (nanostores)
- **Real-time**: WebSocket hook with nanostores

## Libraries

- TanStack Table v8 (`@tanstack/react-table`)
- TanStack Query v5 (already installed)
- React Hook Form + Zod (already installed)
- Recharts (already installed)
- ShadcnUI components (already installed)
- Sonner (already installed)

## Skills to Create

| Skill                 | Description                                                             |
| --------------------- | ----------------------------------------------------------------------- |
| `nextjs-list-page`    | Data table with toolbar, filters, pagination, row actions, bulk actions |
| `nextjs-form-dialog`  | Form in Dialog with RHF+Zod, mutation, toast                            |
| `nextjs-detail-sheet` | Detail Sheet with key-value grid, optional sub-table, actions           |
| `nextjs-detail-page`  | Full detail page layout                                                 |
| `nextjs-form-page`    | Standalone form page (settings-style)                                   |
| `nextjs-api-hooks`    | React Query hooks pattern with @hey-api/client-fetch                    |
