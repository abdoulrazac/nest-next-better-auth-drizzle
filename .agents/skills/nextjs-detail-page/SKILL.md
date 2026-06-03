---
name: nextjs-detail-page
description: Create a full detail/show page for a resource with header section, tabbed content, breadcrumb navigation, and action buttons. Use when a resource detail is complex enough to need its own page (not a sheet) in this Next.js project.
---

# Next.js Detail Page

## Stack

- **Next.js App Router** dynamic route `[id]/page.tsx` — `params` is a `Promise` in Next.js 15+
- **ShadcnUI** `Tabs`, `Button`, `Breadcrumb`, `Separator`, `Skeleton`
- **PageHeader** (`@/components/page-header`) — page title + description + action buttons
- **DetailField / DetailGrid / DetailSection** (`@/components/detail-field`) — structured key-value display
- **UserAvatar** (`@/components/user-avatar`) — avatar with fallback initials
- **StatusBadge** (`@/components/status-badge`) — colored status pill
- **Icons** — always use `Icon` from `@/components/ui/icon` + barrel from `@/lib/icons`. Never use `lucide-react`.
- **TanStack Query** for data fetching

## File Structure

```
app/(dashboard)/<resource>/[id]/page.tsx   ← Next.js route
features/<resource>/
  detail/
    index.tsx           ← Detail page component
    overview-tab.tsx    ← Overview tab content
    activity-tab.tsx    ← Activity/history tab
```

## Quick Start

### Route file (`app/(dashboard)/account/users/[id]/page.tsx`)

```tsx
import { UserDetailPage } from "@/features/users/detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  return <UserDetailPage userId={id} />;
}
```

### Detail page component (`features/users/detail/index.tsx`)

```tsx
"use client";
import Link from "next/link";
import { useGetUser } from "../hooks";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import { Icon } from "@/components/ui/icon";
import { EditIcon, Delete02Icon as TrashIcon } from "@/lib/icons";
import { OverviewTab } from "./overview-tab";
import { ActivityTab } from "./activity-tab";

export function UserDetailPage({ userId }: { userId: string }) {
  const { data: user, isLoading } = useGetUser(userId);

  if (isLoading) return <DetailPageSkeleton />;
  if (!user) return <EmptyState text="User not found" />;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/account/users">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} src={user.avatarUrl} size="xl" />
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <StatusBadge status={user.status} />
              {user.role && (
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium">
                  {user.role.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm">
            <Icon icon={EditIcon} /> Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Icon icon={TrashIcon} /> Delete
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabbed content */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <OverviewTab user={user} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <ActivityTab userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailPageSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-64" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
    </div>
  );
}
```

### Overview Tab (`overview-tab.tsx`)

```tsx
import {
  DetailField,
  DetailGrid,
  DetailSection,
} from "@/components/detail-field";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/utils";

export function OverviewTab({ user }: { user: User }) {
  return (
    <div className="space-y-6">
      <DetailSection title="Account Info">
        <DetailGrid>
          <DetailField label="Status">
            <StatusBadge status={user.status} />
          </DetailField>
          <DetailField label="Role">{user.role?.name ?? "—"}</DetailField>
          <DetailField label="Created">
            {formatDate(user.createdAt)}
          </DetailField>
          <DetailField label="Last login">
            {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
          </DetailField>
          <DetailField label="ID" mono>
            {user.id}
          </DetailField>
        </DetailGrid>
      </DetailSection>
    </div>
  );
}
```

## DetailField / DetailGrid / DetailSection API

```tsx
import {
  DetailField,
  DetailGrid,
  DetailSection,
} from "@/components/detail-field";

// Named section wrapper
<DetailSection title="Account Info">
  {/* grid inside */}
  <DetailGrid>
    <DetailField label="Status">
      <StatusBadge status={item.status} />
    </DetailField>
    <DetailField label="ID" mono>
      {item.id}
    </DetailField>{" "}
    {/* mono = monospace font */}
    <DetailField label="Created">{formatDate(item.createdAt)}</DetailField>
  </DetailGrid>
</DetailSection>;
```

## Notes

- `params: Promise<{ id: string }>` — required in Next.js 15+ (always await params)
- Breadcrumb uses `asChild` + `<Link>` for correct Next.js client navigation
- `UserAvatar size="xl"` for detail page header, `size="lg"` for sheet header, `size="sm"` for table cells
- URL-synced tabs: use `searchParams` + `router.push` only if needed (adds complexity)
- Always import `EmptyState` from `@/components/empty-state` for "not found" states
