"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import {
  BellIcon,
  InfoIcon,
  AlertIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  TrashIcon,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/page-header";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import {
  useListNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "./hooks";
import type { Notification } from "./types";

function relativeTime(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return Math.floor(diff / 86400000) + "d ago";
}

const TYPE_ICON: Record<string, typeof InfoIcon> = {
  info: InfoIcon,
  warning: AlertIcon,
  error: AlertCircleIcon,
  success: CheckCircleIcon,
};

const TYPE_COLOR: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  success: "text-green-500",
};

type FilterType = "all" | "unread" | "read";

interface NotificationCardProps {
  notification: Notification;
}

function NotificationCard({ notification }: NotificationCardProps) {
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const icon = TYPE_ICON[notification.type] ?? InfoIcon;
  const iconColor = TYPE_COLOR[notification.type] ?? "text-blue-500";

  return (
    <Card
      className={cn(
        "transition-colors",
        !notification.read &&
          "bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900",
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className={cn("mt-0.5 shrink-0", iconColor)}>
          <Icon icon={icon} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {notification.title}
              </p>
              {!notification.read && (
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {relativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {notification.body}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => markAsRead.mutate(notification.id)}
              disabled={markAsRead.isPending}
              title="Mark as read"
            >
              <Icon icon={CheckIcon} size={14} strokeWidth={1.5} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => deleteNotification.mutate(notification.id)}
            disabled={deleteNotification.isPending}
            title="Delete"
          >
            <Icon icon={TrashIcon} size={14} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationsPage() {
  const [filter, setFilter] = React.useState<FilterType>("all");
  const { data, isLoading } = useListNotifications();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = data?.items ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const FILTERS: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: readCount },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay up to date with system events."
        secondaryActions={[
          {
            label: "Mark all as read",
            icon: <HugeiconsIcon icon={CheckIcon} className="h-4 w-4" />,
            onClick: () => markAllAsRead.mutate(),
            disabled: markAllAsRead.isPending || unreadCount === 0,
            variant: "outline",
          },
        ]}
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b pb-2">
        {FILTERS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors",
              filter === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {label}
            <Badge
              variant={filter === key ? "secondary" : "outline"}
              className="text-xs h-4 px-1.5"
            >
              {count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Notification list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <Icon icon={BellIcon} size={40} className="text-muted-foreground" />
            <div>
              <p className="font-medium text-muted-foreground">
                No notifications
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "Nothing here yet."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </div>
      )}
    </div>
  );
}
