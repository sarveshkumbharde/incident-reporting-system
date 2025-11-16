import React, { useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Check, Trash2, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Notifications = () => {
  const {
    notifications,
    fetchNotifications,
    markNotificationAsRead,
    clearNotifications,
  } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Bell className="w-7 h-7 text-blue-500" />
        Notifications 
      </h1>

      {/* Buttons */}
      <div className="flex justify-between mb-4">
        <button
          onClick={() => clearNotifications()}
          className="btn btn-error btn-sm flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>

        <button
          onClick={() => notifications.forEach(n => !n.isRead && markNotificationAsRead(n._id))}
          className="btn btn-success btn-sm flex items-center gap-1"
        >
          <Check className="w-4 h-4" />
          Mark All Read
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">No notifications found.</p>
        ) : (
          notifications.map((noti) => (
            <div
              key={noti._id}
              className={`p-4 rounded-lg border ${
                noti.isRead
                  ? "bg-gray-100 border-gray-300"
                  : "bg-blue-50 border-blue-500"
              }`}
            >
              <div className="flex justify-between">
                <p className="font-medium text-gray-800">{noti.text}</p>
                {!noti.isRead && (
                  <button
                    className="btn btn-xs btn-outline"
                    onClick={() => markNotificationAsRead(noti._id)}
                  >
                    Mark Read
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {new Date(noti.createdAt).toLocaleString()}
                </p>

                {/* VIEW INCIDENT BUTTON */}
                {noti.incidentId && (
                  <Link
                    to={`/view-incident/${noti.incidentId}`}
                    className="btn btn-sm btn-primary flex items-center gap-1"
                  >
                    View Incident
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
