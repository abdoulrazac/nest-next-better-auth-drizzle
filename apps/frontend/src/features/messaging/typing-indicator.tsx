"use client";

import type { TypingUser } from "./types";

interface Props {
  users: TypingUser[];
}

export function TypingIndicator({ users }: Props) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.userName);
  let text = "";
  if (names.length === 1) {
    text = `${names[0]} est en train d'écrire…`;
  } else if (names.length === 2) {
    text = `${names[0]} et ${names[1]} écrivent…`;
  } else {
    text = `${names[0]} et ${names.length - 1} autres écrivent…`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-muted-foreground">
      <span className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block size-1.5 rounded-full bg-muted-foreground animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      <span>{text}</span>
    </div>
  );
}
