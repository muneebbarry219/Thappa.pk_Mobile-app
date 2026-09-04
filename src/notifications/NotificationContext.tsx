import { createContext, ReactNode, useContext, useState } from "react";

export interface AppNotification {
  id: string;
  headline: string;
  description: string;
  createdAt: Date;
  read: boolean;
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  addNotification: (notification: Pick<AppNotification, "headline" | "description">) => void;
  markAsRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  function addNotification(notification: Pick<AppNotification, "headline" | "description">) {
    setNotifications((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date(),
        read: false,
        ...notification,
      },
      ...current,
    ]);
  }

  function markAsRead(id: string) {
    setNotifications((current) => current.map((notification) => (
      notification.id === id ? { ...notification, read: true } : notification
    )));
  }

  return <NotificationsContext.Provider value={{ notifications, addNotification, markAsRead }}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used within NotificationsProvider");
  return context;
}
