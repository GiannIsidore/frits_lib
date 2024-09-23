// components/NotificationComponent.tsx

import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
// import { useRouter } from "next/navigation";

interface Notification {
  NotificationID: number;
  Message: string;
  CreatedDate: string;
  Type: string;
  Status: string;
}

interface NotificationComponentProps {
  userId: number;
  showAll?: boolean; // Whether to show all notifications or just unread
  onMarkAsRead?: (notificationId: number) => void;
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({
  userId,
  showAll = true,
  onMarkAsRead,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  //   const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    // Optionally, set up a polling mechanism or WebSocket for real-time updates
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get(
        `/backend/api/Notification.php?action=getByUser&userId=${userId}`
      );
      let data = response.data.notifications;
      if (!showAll) {
        data = data.filter((n: Notification) => n.Status !== "Read");
      }
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await axiosInstance.post(
        "/backend/api/Notification.php?action=markAsRead",
        {
          notificationId,
        }
      );
      setNotifications((prevNotifications) =>
        prevNotifications.map((n) =>
          n.NotificationID === notificationId ? { ...n, Status: "Read" } : n
        )
      );
      if (onMarkAsRead) {
        onMarkAsRead(notificationId);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="notification-component">
      {notifications.length > 0 ? (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li key={notification.NotificationID} className="notification-item">
              <div className="notification-content">
                <p>{notification.Message}</p>
                <small>
                  {new Date(notification.CreatedDate).toLocaleString()}
                </small>
              </div>
              {notification.Status !== "Read" && (
                <button
                  onClick={() => handleMarkAsRead(notification.NotificationID)}
                  className="mark-as-read-button"
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications.</p>
      )}
    </div>
  );
};

export default NotificationComponent;
