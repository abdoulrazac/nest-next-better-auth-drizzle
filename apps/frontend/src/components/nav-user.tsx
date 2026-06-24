"use client";

import { useStore } from "@nanostores/react";
import { useRouter } from "next/navigation";
import { authClient, signOut } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { LogoutIcon } from "@/lib/icons";

export function NavUser() {
  const router = useRouter();
  const session = useStore(authClient.useSession);
  const user = session?.data?.user;

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/sign-in");
    router.refresh();
  };

  if (!user) return null;

  const initials = user.name
    ? user.name.slice(0, 2).toUpperCase()
    : (user.email?.slice(0, 2).toUpperCase() ?? "??");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 p-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              {user.name && (
                <span className="text-sm font-semibold leading-none">
                  {user.name}
                </span>
              )}
              <span className="text-xs text-muted-foreground leading-none mt-0.5">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-destructive focus:text-destructive"
        >
          <Icon icon={LogoutIcon} className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
