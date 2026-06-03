---
name: nextjs-detail-sheet
description: Create a ShadcnUI Sheet (slide-over panel) showing resource details with key-value grid, action buttons, and optional sub-table. Use when building detail panels for table rows (user detail, webhook detail with deliveries, file preview) in this Next.js project.
---

# Next.js Detail Sheet

## Stack

- **ShadcnUI** `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`, `Button`, `Separator`, `ScrollArea`, `Skeleton`
- **DetailField / DetailGrid / DetailSection** (`@/components/detail-field`) — structured key-value display
- **UserAvatar** (`@/components/user-avatar`) — avatar with fallback initials
- **StatusBadge** (`@/components/status-badge`) — colored status pill
- **Icons** — always use `Icon` from `@/components/ui/icon` + barrel from `@/lib/icons`. Never use `lucide-react`.
- **TanStack Query** for fetching full detail data
- Optional: nested `DataTable` for sub-resources (e.g. webhook deliveries)

## File Structure

```
features/<name>/
  detail-sheet.tsx    ← Sheet component
  hooks.ts            ← useGetXxx(id) hook for detail fetch
```

## Quick Start

### Detail Sheet (`detail-sheet.tsx`)

```tsx
"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DetailField,
  DetailGrid,
  DetailSection,
} from "@/components/detail-field";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import { Icon } from "@/components/ui/icon";
import { EditIcon, Delete02Icon as TrashIcon } from "@/lib/icons";
import { useGetUser } from "./hooks";
import { formatDate } from "@/lib/utils";

interface UserDetailSheetProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserDetailSheet({
  userId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: UserDetailSheetProps) {
  const { data: user, isLoading } = useGetUser(userId, {
    enabled: !!userId && open,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <DetailSkeleton />
          ) : user ? (
            <div className="space-y-6 p-6">
              {/* Header: avatar + name */}
              <div className="flex items-center gap-4">
                <UserAvatar name={user.name} src={user.avatarUrl} size="lg" />
                <div>
                  <p className="text-lg font-semibold">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <StatusBadge status={user.status} className="mt-1" />
                </div>
              </div>

              <Separator />

              {/* Details grid */}
              <DetailSection title="Account Info">
                <DetailGrid>
                  <DetailField label="Role">
                    {user.role?.name ?? "—"}
                  </DetailField>
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

              <Separator />

              {/* Action buttons */}
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Icon icon={EditIcon} />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(user)}
                  >
                    <Icon icon={TrashIcon} />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
```

## DetailField / DetailGrid / DetailSection API

```tsx
import { DetailField, DetailGrid, DetailSection } from "@/components/detail-field"

// Grid of 2-column key-value pairs
<DetailGrid>
  <DetailField label="Status"><StatusBadge status={item.status} /></DetailField>
  <DetailField label="Role">{item.role?.name ?? "—"}</DetailField>
  <DetailField label="Created">{formatDate(item.createdAt)}</DetailField>
  <DetailField label="ID" mono>{item.id}</DetailField>  {/* monospace font */}
</DetailGrid>

// Named section with title above the grid
<DetailSection title="Metadata">
  <DetailGrid>
    <DetailField label="Source">{item.source}</DetailField>
  </DetailGrid>
</DetailSection>
```

## With Sub-Table (e.g., Webhook Deliveries)

```tsx
import { DeliveriesTable } from "./deliveries-table"

// Inside the sheet body, after main details:
<Separator />
<DetailSection title="Recent Deliveries">
  <DeliveriesTable webhookId={webhook.id} />
</DetailSection>
```

## Trigger Pattern (from parent list page)

```tsx
const [selectedId, setSelectedId] = useState<string | null>(null)
const [sheetOpen, setSheetOpen] = useState(false)

// In CellActions:
{ label: "View details", icon: ViewIcon, onClick: (r) => { setSelectedId(r.original.id); setSheetOpen(true) } }

// At bottom of JSX:
<UserDetailSheet
  userId={selectedId}
  open={sheetOpen}
  onOpenChange={setSheetOpen}
  onEdit={(user) => { setEditTarget(user); setDialogOpen(true) }}
  onDelete={(user) => setDeleteId(user.id)}
/>
```

## Notes

- Sheet width: `sm:max-w-[480px]` for simple, `sm:max-w-[640px]` for complex (with sub-table)
- Fetch detail data lazily: use `enabled: !!id && open` in useQuery
- Keep `selectedId` in state even when sheet is closed — prevents data flash during close animation
- Use `flex flex-col` + `ScrollArea className="flex-1"` — ensures sheet header stays fixed at top
- `UserAvatar size="lg"` for sheet headers, `size="sm"` for inline table cells
