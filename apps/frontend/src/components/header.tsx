"use client";

import { useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useStore } from "@nanostores/react";
import { authClient, signOut } from "../lib/auth-client";

export function Header() {
  const router = useRouter();
  const session = useStore(authClient.useSession);
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 bg-background">
      <div />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        <span className="text-sm text-muted-foreground">
          {session?.data?.user?.name ?? session?.data?.user?.email}
        </span>

        <button
          onClick={handleSignOut}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
