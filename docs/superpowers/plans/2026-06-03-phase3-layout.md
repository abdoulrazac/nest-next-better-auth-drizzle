# Phase 3 — Layout (Sidebar, NavMain, CommandMenu, BasePage)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Porter le layout de `sfe_pi` : sidebar collapsible icon-only, nav collapsible avec groupes, command menu ⌘K, base-page avec header complet.

**Architecture:** `AppSidebar` (collapsible="icon") → `NavMain` (groupes collapsibles, localStorage) → `BasePage` (header h-16 : SidebarTrigger + Breadcrumb + CommandMenu + ThemeSwitcher + NavUser). `sidebar-data.ts` adapté aux routes du projet.

**Tech Stack:** Shadcn/ui Sidebar primitives, HugeIcons via `@/lib/icons`, `next/navigation`, `localStorage`

**Prérequis :** Phase 1 (HugeIcons) + Phase 2 (composants) terminés

---

## Task 1 — Adapter sidebar-data.ts

**Files:**

- Modify: `apps/frontend/src/components/layout/sidebar-data.ts`

- [ ] **Remplacer le contenu**

```ts
import {
  BellIcon,
  DashboardIcon,
  DocumentIcon,
  FileIcon,
  SettingsIcon,
  ShieldUserIcon,
  TagIcon,
  UsersIcon,
  WebhookIcon,
} from "@/lib/icons";
import type { IconSvgElement } from "@hugeicons/react";

export type NavLink = {
  title: string;
  url: string;
  icon?: IconSvgElement;
  badge?: string;
  addUrl?: string;
};

export type NavCollapsible = {
  title: string;
  url: string;
  icon?: IconSvgElement;
  badge?: string;
  items: NavLink[];
  color?: string;
};

export type NavItem = NavLink | NavCollapsible;

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export function isNavCollapsible(item: NavItem): item is NavCollapsible {
  return "items" in item;
}

export const sidebarData: { navGroups: NavGroup[] } = {
  navGroups: [
    {
      title: "Général",
      items: [{ title: "Tableau de bord", url: "/", icon: DashboardIcon }],
    },
    {
      title: "Comptes",
      items: [
        {
          title: "Utilisateurs & Rôles",
          url: "/account",
          icon: UsersIcon,
          color: "orange",
          items: [
            { title: "Utilisateurs", url: "/account/users", icon: UsersIcon },
            { title: "Rôles", url: "/account/roles", icon: ShieldUserIcon },
            {
              title: "Journaux d'audit",
              url: "/account/audit-logs",
              icon: DocumentIcon,
            },
          ],
        },
      ],
    },
    {
      title: "Système",
      items: [
        { title: "Notifications", url: "/notifications", icon: BellIcon },
        { title: "Fichiers", url: "/files", icon: FileIcon },
        { title: "Webhooks", url: "/webhooks", icon: WebhookIcon },
      ],
    },
    {
      title: "Paramètres",
      items: [
        {
          title: "Configuration",
          url: "/settings",
          icon: SettingsIcon,
          color: "purple",
          items: [
            { title: "Général", url: "/settings/general", icon: SettingsIcon },
            {
              title: "Modèles",
              url: "/settings/templates",
              icon: DocumentIcon,
            },
            { title: "Unités", url: "/settings/units", icon: TagIcon },
          ],
        },
      ],
    },
  ],
};
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "sidebar-data"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/layout/sidebar-data.ts
git commit -m "feat(frontend): update sidebar-data with project routes and French labels"
```

---

## Task 2 — Créer NavMain

**Files:**

- Create: `apps/frontend/src/components/layout/nav-main.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronDownIcon, PlusIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  isNavCollapsible,
  type NavGroup,
  type NavCollapsible,
  type NavLink,
} from "./sidebar-data";

function useLocalStorageState(
  key: string,
  defaultValue: boolean,
): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    return stored !== null ? stored === "true" : defaultValue;
  });

  const set = (v: boolean) => {
    setValue(v);
    localStorage.setItem(key, String(v));
  };

  return [value, set];
}

function NavCollapsibleItem({ item }: { item: NavCollapsible }) {
  const pathname = usePathname();
  const isActive = item.items.some(
    (sub) => pathname === sub.url || pathname.startsWith(sub.url + "/"),
  );
  const [open, setOpen] = useLocalStorageState(
    `nav-open-${item.title}`,
    isActive,
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isActive}>
            {item.icon && <Icon icon={item.icon} className="h-4 w-4" />}
            <span>{item.title}</span>
            <Icon
              icon={ChevronDownIcon}
              className={`ml-auto h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((sub) => {
              const subActive =
                pathname === sub.url || pathname.startsWith(sub.url + "/");
              return (
                <SidebarMenuSubItem key={sub.url}>
                  <SidebarMenuSubButton asChild isActive={subActive}>
                    <Link href={sub.url}>
                      {sub.icon && (
                        <Icon icon={sub.icon} className="h-3.5 w-3.5" />
                      )}
                      <span>{sub.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function NavLinkItem({ item }: { item: NavLink }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.url ||
    (item.url !== "/" && pathname.startsWith(item.url + "/"));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link href={item.url}>
          {item.icon && <Icon icon={item.icon} className="h-4 w-4" />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMain({ groups }: { groups: NavGroup[] }) {
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.title}>
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) =>
              isNavCollapsible(item) ? (
                <NavCollapsibleItem key={item.url} item={item} />
              ) : (
                <NavLinkItem key={item.url} item={item} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "nav-main"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/layout/nav-main.tsx
git commit -m "feat(frontend): add NavMain with collapsible groups and localStorage state"
```

---

## Task 3 — Remplacer AppSidebar (collapsible icon)

**Files:**

- Modify: `apps/frontend/src/components/layout/app-sidebar.tsx`

- [ ] **Remplacer le contenu**

```tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { sidebarData } from "./sidebar-data";

function Logo({ iconOnly }: { iconOnly: boolean }) {
  if (iconOnly) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
        A
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
        A
      </div>
      <span className="font-semibold text-sm">App</span>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4">
        <Logo iconOnly={!open} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={sidebarData.navGroups} />
      </SidebarContent>
    </Sidebar>
  );
}
```

> 💡 Personnaliser `Logo` avec le vrai nom et logo de l'app.

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "app-sidebar"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/layout/app-sidebar.tsx
git commit -m "feat(frontend): update AppSidebar to collapsible icon variant with NavMain"
```

---

## Task 4 — Créer CommandMenu

**Files:**

- Create: `apps/frontend/src/components/layout/command-menu.tsx`

- [ ] **Créer le fichier**

```tsx
"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { SearchIcon } from "@/lib/icons";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isNavCollapsible, sidebarData } from "./sidebar-data";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const navigate = (url: string) => {
    router.push(url);
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground text-sm w-48 justify-between"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2">
          <Icon icon={SearchIcon} className="h-3.5 w-3.5" />
          Rechercher...
        </span>
        <kbd className="pointer-events-none rounded border bg-muted px-1.5 font-mono text-xs">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher une page..." />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          {sidebarData.navGroups.map((group, gi) => (
            <div key={group.title}>
              {gi > 0 && <CommandSeparator />}
              <CommandGroup heading={group.title}>
                {group.items.flatMap((item) => {
                  if (isNavCollapsible(item)) {
                    return item.items.map((sub) => (
                      <CommandItem
                        key={sub.url}
                        onSelect={() => navigate(sub.url)}
                      >
                        {sub.icon && (
                          <Icon icon={sub.icon} className="mr-2 h-4 w-4" />
                        )}
                        {sub.title}
                      </CommandItem>
                    ));
                  }
                  return [
                    <CommandItem
                      key={item.url}
                      onSelect={() => navigate(item.url)}
                    >
                      {item.icon && (
                        <Icon icon={item.icon} className="mr-2 h-4 w-4" />
                      )}
                      {item.title}
                    </CommandItem>,
                  ];
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
```

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "command-menu"
```

- [ ] **Commit**

```bash
git add apps/frontend/src/components/layout/command-menu.tsx
git commit -m "feat(frontend): add CommandMenu with ⌘K search over sidebar items"
```

---

## Task 5 — Enrichir BasePage

**Files:**

- Modify: `apps/frontend/src/components/layout/base-page.tsx`

- [ ] **Remplacer le contenu**

```tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CommandMenu } from "./command-menu";
import { ModeToggle } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";
import { Fragment } from "react";

// Import NavUser si disponible, sinon créer un placeholder
// import { NavUser } from "./nav-user";

interface Crumb {
  title: string;
  url?: string;
}

interface BasePageProps {
  breadcrumbs?: Crumb[];
  children: ReactNode;
  className?: string;
}

export function BasePage({ breadcrumbs, children, className }: BasePageProps) {
  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        {/* Gauche */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          {breadcrumbs && breadcrumbs.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, i) => (
                    <Fragment key={crumb.url ?? crumb.title}>
                      <BreadcrumbItem>
                        {crumb.url && i < breadcrumbs.length - 1 ? (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.url}>{crumb.title}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {i < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </>
          )}
        </div>

        {/* Droite */}
        <div className="ml-auto flex items-center gap-2">
          <CommandMenu />
          <ModeToggle />
          {/* <NavUser /> */}
        </div>
      </header>

      {/* Contenu */}
      <main
        className={cn(
          "p-4 pt-0 mx-auto w-full max-w-6xl 2xl:max-w-7xl mt-6",
          className,
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default BasePage;
```

> 💡 `ModeToggle` est déjà présent dans `theme-provider.tsx`. Décommenter `NavUser` quand disponible.

- [ ] **Vérifier que `ModeToggle` est bien exporté depuis `theme-provider.tsx`**

```bash
cd apps/frontend && grep "ModeToggle" src/components/theme-provider.tsx
```

Si absent, ajouter un simple toggle de thème ou importer depuis `@/components/header.tsx`.

- [ ] **Vérifier la compilation**

```bash
cd apps/frontend && bun run tsc --noEmit 2>&1 | grep "base-page"
```

- [ ] **Tester visuellement l'app**

```bash
cd apps/frontend && bun run dev
```

Ouvrir http://localhost:3002 et vérifier :

- Sidebar collapsible (icon-only quand réduite)
- NavMain avec groupes collapsibles "Comptes" et "Paramètres"
- État des groupes persisté après refresh (localStorage)
- BasePage header : SidebarTrigger + breadcrumbs + CommandMenu + ThemeSwitcher
- ⌘K ouvre le CommandDialog

- [ ] **Commit final phase 3**

```bash
git add apps/frontend/src/components/layout/
git commit -m "feat(frontend): complete layout migration — collapsible sidebar, NavMain, CommandMenu, BasePage"
```
