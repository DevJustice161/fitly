import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Package,
  Tag,
  Check,
  CheckCheck,
  ScrollText,
  MonitorCog,
  Trash2,
  Filter,
  BellOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000");

const iconMap = {
  order: Package,
  promo: Tag,
  review: CheckCheck,
  wishlist: ScrollText,
  vendor: Package,
  system: MonitorCog,
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    getHoursAgo,
    setNotifications,
    fetchNotifications,
    markAsRead,
    markAsUnread,
    markAllRead,
    deleteOne,
    clearAll,
  } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.is_read);
    if (filter === "read") return notifications.filter((n) => n.is_read);
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs border-border"
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-3 w-3 mr-1" /> Mark all read
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs border-border text-destructive hover:text-destructive"
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Clear all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove all your notifications. This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearAll}>
                  Clear all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="rounded-full">
          <TabsTrigger value="all" className="rounded-full text-xs">
            <Filter className="h-3 w-3 mr-1" /> All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="rounded-full text-xs">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="read" className="rounded-full text-xs">
            Read ({notifications.length - unreadCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3 mt-4">
        {filtered.length === 0 ? (
          <Card className="border border-dashed border-border shadow-none">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <BellOff className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No notifications
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You're all caught up. We'll let you know when something new
                arrives.
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <Card
                key={n.id}
                className={`border shadow-sm transition-colors ${
                  !n.is_read
                    ? "border-primary/30 bg-primary/[0.02]"
                    : "border-border"
                }`}
              >
                <CardContent className="p-4 flex notifications-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !n.is_read ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${!n.is_read ? "text-primary" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex notifications-start justify-between gap-2">
                      <p
                        className={`text-sm ${!n.is_read ? "font-semibold text-foreground" : "text-foreground"}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {getHoursAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                      {!n.is_read ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                          onClick={() => markAsRead(n.id)}
                        >
                          <Check className="h-3 w-3 mr-1" /> Mark as read
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                          onClick={() => markAsUnread(n.id)}
                        >
                          <Bell className="h-3 w-3 mr-1" /> Mark as unread
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-[11px] text-destructive hover:text-destructive"
                        onClick={() => deleteOne(n.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Delete
                      </Button>
                    </div>
                  </div>
                  {!n.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
