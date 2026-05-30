"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ShieldCheck,
  ScrollText,
  Bell,
  FileUp,
  Settings,
  Webhook,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/account/users", label: "Users", icon: Users },
  { href: "/account/roles", label: "Roles", icon: ShieldCheck },
  { href: "/account/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/files", label: "Files", icon: FileUp },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/webhooks", label: "Webhooks", icon: Webhook },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-56 flex-col border-r bg-sidebar h-screen sticky top-0">
      <div className="px-4 py-5 border-b">
        <span className="text-sm font-semibold tracking-tight">
          Enterprise App
        </span>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/60"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
