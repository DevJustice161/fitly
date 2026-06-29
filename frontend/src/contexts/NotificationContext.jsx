import { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { toast } from "sonner";

const NotificationContext = createContext();

const socket = io("http://localhost:5000");

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getHoursAgo = (pastDateString) => {
    const pastDate = new Date(pastDateString);
    const currentDate = new Date(); // Uses your local current time

    const diffInMs = currentDate - pastDate;

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInWeeks = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 7));
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30));
    const yearsRatio = diffInMs / (1000 * 60 * 60 * 24 * 30 * 12);

    const parts = yearsRatio.toString().split(".");

    const years = parts[0];
    const months = parts[1] ? parts[1].charAt(0) : 0;

    if (yearsRatio === 1) return "1 year ago";
    if (yearsRatio > 1) {
      if (years == 1 && months != 0) {
        return `${years} year ${months} months ago`;
      }
      if (months == 0) {
        return `${years} years ago`;
      }
      return `${years} years ${months} months ago`;
    }
    if (diffInMonths >= 1) {
      if (diffInMonths > 1) {
        return `${diffInMonths} months ago`;
      }
      return "1 month ago";
    }
    if (diffInWeeks >= 1) {
      if (diffInWeeks > 1) {
        return `${diffInWeeks} weeks ago`;
      }
      return "1 week ago";
    }
    if (diffInDays >= 1) {
      if (diffInDays > 1) {
        return `${diffInDays} days ago`;
      }
      return "1 day ago";
    }
    if (diffInHours == 1) {
      return "1 hour ago";
    }
    if (diffInHours <= 0) return "Less than an hour ago";

    return `${diffInHours} hours ago`;
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;

    const res = await fetch(
      `http://localhost:5000/api/notification/${user.id}`,
    );
    const data = await res.json();

    if (res.ok) setNotifications(data);
  };
  useEffect(() => {
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("join", user.id);

    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("new-notification", handleNotification);

    return () => {
      socket.off("new-notification", handleNotification);
    };
  }, [user]);

  const markAsRead = async (id) => {
    if (unreadCount === 0) {
      toast.info("No unread notifications");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/notification/mark-as-read/${id}`,
        {
          method: "PUT",
        },
      );
      toast.success("Notification marked as read");
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to update notification:", error);
      toast({
        title: "Error",
        description:
          "Failed to update your notification. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const markAsUnread = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notification/mark-as-unread/${id}`,
        {
          method: "PUT",
        },
      );
      toast.success("Notification marked as unread");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to update notification:", error);
      toast({
        title: "Error",
        description:
          "Failed to update your notification. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) {
      toast.info("No unread notifications");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/notification/mark-all-read/${user.id}`,
        {
          method: "PUT",
        },
      );
      toast.success("All notifications marked as read");
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to update notifications:", error);
      toast({
        title: "Error",
        description:
          "Failed to update your notifications. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const deleteOne = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notification/delete-one/${id}`,
        {
          method: "DELETE",
        },
      );
      toast.success("Notification deleted");
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast({
        title: "Error",
        description:
          "Failed to delete your notification. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const clearAll = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/notification/clear/${user.id}`,
        {
          method: "DELETE",
        },
      );
      toast.success("All Notifications deleted");
      await fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notifications:", error);
      toast({
        title: "Error",
        description:
          "Failed to delete your notifications. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <NotificationContext.Provider
      value={{
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  return ctx;
};
