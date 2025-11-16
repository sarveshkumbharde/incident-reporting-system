import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import {
  Mail,
  Phone,
  User,
  Home,
  CreditCard,
  Calendar,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { axiosInstance } from "../../stores/axios";
import { API_BASE_URL } from "../../api.js";

const Profile = () => {
  const { authUser } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [reportedIncidents, setReportedIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) return;

      try {
        setLoading(true);
        // Fetch complete user data with populated incidents
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
          credentials: "include",
        });

        const data = await response.json();

        if (data.success) {
          setUserData(data.user);
          console.log("Fetched user:", data.user);
          // If reported incidents are populated, set them
          if (data.user.reportedIncidents) {
            setReportedIncidents(data.user.reportedIncidents);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [authUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!userData && !authUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            User Not Found
          </h1>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Use userData if available, otherwise fall back to authUser
  const user = userData || authUser;

  // Safe access to arrays
  const notifications = user.notifications || [];
  const reportedIncidentsList =
    reportedIncidents.length > 0
      ? reportedIncidents
      : user.reportedIncidents || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      reported: { class: "badge-info", icon: Clock },
      "under review": { class: "badge-warning", icon: AlertTriangle },
      "in progress": { class: "badge-primary", icon: Clock },
      resolved: { class: "badge-success", icon: CheckCircle },
      dismissed: { class: "badge-error", icon: AlertTriangle },
    };

    const config = statusConfig[status] || statusConfig["reported"];
    const IconComponent = config.icon;

    return (
      <span className={`badge ${config.class} badge-sm`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            User Profile
          </h1>
          <p className="text-gray-600">
            Manage your account information and view your activity
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img
                    src={
                      user.profilePic
                        ? user.profilePic
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-gray-200"
                  />

                  <div
                    className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                      user.role === "admin"
                        ? "bg-red-500"
                        : user.role === "authority"
                        ? "bg-orange-500"
                        : "bg-green-500"
                    }`}
                  ></div>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {user.firstName} {user.lastName}
                </h2>
                <p
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                    user.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : user.role === "authority"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.role?.toUpperCase() || "USER"}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-700">
                    Reported Incidents
                  </span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                    {reportedIncidentsList.length}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-purple-700">
                    Notifications
                  </span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      First Name
                    </label>
                    <p className="text-gray-800">{user.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Last Name
                    </label>
                    <p className="text-gray-800">{user.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="text-gray-800 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-500" />
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Mobile
                    </label>
                    <p className="text-gray-800 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-green-500" />
                      {user.mobile}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Address
                    </label>
                    <p className="text-gray-800 flex items-center">
                      <Home className="w-4 h-4 mr-2 text-teal-500" />
                      {user.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Aadhar Card
                    </label>
                    <img
                      src={user.aadharCard || "Not provided"}
                      className="w-[100px] h-[200px] mt-2"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-red-500" />
                  <strong>Member since:</strong>
                  <span className="ml-2">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </p>
              </div>
            </div>
            Reported Incidents
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Reported Incidents ({reportedIncidentsList.length})
              </h3>
              {reportedIncidentsList.length > 0 ? (
                <div className="space-y-3">
                  {reportedIncidentsList.map((incident, index) => (
                    <div
                      key={incident._id || index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {incident.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {incident.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Location: {incident.location} • Reported:{" "}
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(incident.status)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No incidents reported yet.</p>
                </div>
              )}
            </div>
            Notifications
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-purple-500" />
                Notifications ({notifications.length})
              </h3>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification._id || index}
                      className={`border-l-4 p-4 rounded-r-lg ${
                        notification.isRead
                          ? "bg-gray-50 border-gray-300"
                          : "bg-blue-50 border-blue-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="text-gray-800">{notification.text}</p>
                        {!notification.isRead && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        • {notification.type}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
