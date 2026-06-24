"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { useListUsers } from "@/features/users/hooks";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { useCreateConversation } from "./hooks";

interface Props {
  children: React.ReactNode;
  onCreated?: (conversationId: string) => void;
}

export function NewConversationDialog({ children, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"direct" | "group">("direct");
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const session = useStore(authClient.useSession);
  const currentUserId = session.data?.user?.id;

  const { data: usersData } = useListUsers(
    { pageSize: 100 },
    { enabled: open },
  );

  const users = (usersData?.items ?? []).filter((u) => u.id !== currentUserId);

  const { mutate: create, isPending } = useCreateConversation();

  function toggle(userId: string) {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : type === "direct"
          ? [userId]
          : [...prev, userId],
    );
  }

  function handleSubmit() {
    create(
      {
        type,
        name: type === "group" ? name : undefined,
        participantIds: selectedIds,
      },
      {
        onSuccess: (conv: any) => {
          setOpen(false);
          setSelectedIds([]);
          setName("");
          onCreated?.(conv?.id);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nouvelle conversation</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Type selector */}
          <div className="flex gap-2">
            <Button
              variant={type === "direct" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setType("direct");
                setSelectedIds([]);
              }}
            >
              Message direct
            </Button>
            <Button
              variant={type === "group" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setType("group");
                setSelectedIds([]);
              }}
            >
              Groupe
            </Button>
          </div>

          {type === "group" && (
            <div>
              <Label htmlFor="group-name">Nom du groupe</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nom du groupe"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label>Participants</Label>
            <div className="mt-1 max-h-48 overflow-y-auto rounded-md border divide-y">
              {users.length === 0 && (
                <p className="p-3 text-sm text-muted-foreground">
                  Aucun utilisateur trouvé
                </p>
              )}
              {users.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggle(user.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                    selectedIds.includes(user.id) ? "bg-primary/10" : ""
                  }`}
                >
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      selectedIds.includes(user.id)
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isPending ||
              selectedIds.length === 0 ||
              (type === "group" && !name.trim())
            }
          >
            {isPending ? "Création..." : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
