import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "./axios";
import toast from "react-hot-toast";
import socket from "../socket.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      authRole: null,
      isSigningIn: false,
      isAccepting: false,
      isLoggingIn: false,
      isUpdating: false,
      isCheckingApproval: false,
      isReportingIncident: false,
      hasSocketListener: false,
      incidents: [],
      registrations: [],
      notifications: [],

      initializeAuth: async () => {
        try {
          const res = await axiosInstance.get("/auth/me");

          set({
            authUser: res.data.user,
            authRole: res.data.user.role,
          });

          if (!socket.connected) socket.connect();

          socket.emit("register", {
            userId: res.data.user._id,
            role: res.data.user.role,
          });

          await get().fetchNotifications(); // baseline
          get().listenToNotifications(); // realtime
        } catch {
          set({ authUser: null, authRole: null });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/auth/login", data);
          if (res.data.success) {
            toast.success("Login successful!");
            set({
              authUser: res.data.user,
              authRole: res.data.user.role || null,
            });
            if (!socket.connected) {
              socket.connect();
            }
            const loggedInUser = res.data.user;
            socket.emit("register", {
              userId: loggedInUser._id,
              role: loggedInUser.role,
            });
            const userRole = res.data.user.role;
            if (userRole === "admin") {
              window.location.href = "/admin-dashboard";
            } else if (userRole === "authority") {
              window.location.href = "/authority-dashboard";
            } else if (userRole === "user") {
              window.location.href = "/user-dashboard";
            }
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed!";
          toast.error(errorMessage);
        } finally {
          set({ isLoggingIn: false });
        }
      },

      listenToNotifications: () => {
        const { hasSocketListener } = get();
        if (hasSocketListener) return;

        socket.on("notification", (notification) => {
          const normalized = {
            ...notification,
            isRead: false,
          };

          set((state) => ({
            notifications: [normalized, ...state.notifications],
          }));

          toast.success(notification.text);
        });

        set({ hasSocketListener: true });
      },

      register: async (data) => {
        set({ isSigningIn: true });
        try {
          const res = await axiosInstance.post("/auth/signup", data);
          if (res.data.success) {
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Registration failed!";
          toast.error(errorMessage);
        } finally {
          set({ isSigningIn: false });
        }
      },

      logout: async () => {
        try {
          const res = await axiosInstance.post("/auth/logout");

          set({
            authUser: null,
            authRole: null,
            incidents: [],
          });

          toast.success("Logout successful");

          set({ authUser: null, authRole: null });

          socket.disconnect();
          window.location.href = "/login";
        } catch (error) {
          toast.error(error.response?.data?.message || "Logout failed!");
        }
      },

      checkApproval: async (data) => {
        set({ isCheckingApproval: true });
        try {
          const res = await axiosInstance.post("/auth/check-approval", data);
          if (res.data.success) {
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Internal Server Error!",
          );
        } finally {
          set({ isCheckingApproval: false });
        }
      },

      reportIncident: async (data) => {
        set({ isReportingIncident: true });
        try {
          const res = await axiosInstance.post("/auth/report-incident", data);
          if (res.data.success) {
            toast.success(
              "Incident reported successfully! We'll review it shortly.",
            );
            return true;
          } else {
            toast.error(res.data.message);
            return false;
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Error in reporting! Try again.",
          );
        } finally {
          set({ isReportingIncident: false });
        }
      },

      findUser: async (id) => {
        try {
          const res = await axiosInstance.get(`/authority/user/${id}`);
          return res.data.user;
        } catch (error) {
          return null;
        }
      },

      viewRegistrations: async () => {
        try {
          const res = await axiosInstance.get("/admin/view-registrations");
          if (Array.isArray(res.data.users)) {
            set({ registrations: res.data.users });
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Failed to fetch registrations.");
        }
      },

      acceptUser: async (data) => {
        set({ isAccepting: true });
        try {
          const res = await axiosInstance.post(`/admin/verify/${data.userId}`, {
            approval: data.approval,
          });
          if (res.data.success) {
            toast.success(data.approval ? "User accepted!" : "User rejected!");
            return true;
          } else {
            toast.error(res.data.message);
            return false;
          }
        } catch (error) {
          toast.error("Error in accepting registration!");
          return false;
        } finally {
          set({ isAccepting: false });
        }
      },

      incident: {},

      // inside useAuthStore create() object
      setIncident: (incidentOrUpdater) =>
        set((state) => {
          // if a function is passed, call it with current incident
          if (typeof incidentOrUpdater === "function") {
            const newIncident = incidentOrUpdater(state.incident);
            return { incident: newIncident };
          }
          // otherwise treat it as plain incident object
          return { incident: incidentOrUpdater };
        }),

      viewIncident: async (id) => {
        try {
          console.log("🔄 Fetching incident with ID:", id);
          const res = await axiosInstance.get(`/auth/view-incident/${id}`);

          if (res.data.success) {
            set({ incident: res.data.incident });
            console.log("✅ Incident fetched:", res.data.incident);
            toast.success("Incident fetched successfully!");
            return res.data.incident; // Return the incident data
          } else {
            toast.error(res.data.message || "Failed to fetch incident");
            return null;
          }
        } catch (error) {
          console.error("❌ Error fetching incident:", error);
          const errorMessage =
            error.response?.data?.message || "Internal server error!";
          toast.error(errorMessage);
          return null;
        }
      },

      getUserIncidents: async () => {
        try {
          const res = await axiosInstance.get("/auth/user-incidents");
          if (res.data.success) {
            return res.data.incidents;
          } else {
            toast.error(res.data.message || "Failed to fetch incidents");
            return [];
          }
        } catch (error) {
          toast.error("Internal Server Error");
          return [];
        }
      },
      // Inside useAuthStore or useIncidentStore
      updateStatus: async (id, status) => {
        try {
          const res = await axiosInstance.put(
            `/authority/update-status/${id}`,
            {
              status,
            },
          );
          if (res.data.success) {
            toast.success("Status updated successfully!");
            return true;
          } else {
            toast.error(res.data.message || "Failed to update status");
            return false;
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to update status";
          toast.error(errorMessage);
          return false;
        }
      },

      assignIncident: async (id, authorityId) => {
        try {
          const res = await axiosInstance.put(`/admin/assign/${id}`, {
            authorityId,
          });
          if (res.data.success) {
            toast.success("Incident assigned successfully!");
            return true;
          } else {
            toast.error(res.data.message || "Failed to assign incident");
            return false;
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to assign incident";
          toast.error(errorMessage);
          return false;
        }
      },

      getAllUsers: async () => {
        try {
          const res = await axiosInstance.get("/admin/all-users");
          if (res.data.success) {
            return res.data.users;
          }
          toast.error(res.data.message);
        } catch (error) {
          toast.error("Error fetching users");
        }
        return [];
      },

      removeUser: async (id) => {
        try {
          const res = await axiosInstance.delete(`/admin/delete-user/${id}`);
          if (res.data.success) {
            toast.success("User removed successfully!");
            return true;
          }
          toast.error(res.data.message);
        } catch (error) {
          toast.error("Failed to delete user");
        }
        return false;
      },

      getAllAuthorities: async () => {
        try {
          const res = await axiosInstance.get(`/admin/all-authorities`);
          if (res.data.success) {
            return res.data.authorities || [];
          } else {
            toast.error(res.data.message || "Failed to fetch authorities");
            return [];
          }
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to fetch authorities";
          toast.error(errorMessage);
          return [];
        }
      },
      // Add to your authStore methods
      addFeedback: async (incidentId, message) => {
        try {
          const res = await axiosInstance.post("/auth/submit-feedback", {
            incidentId,
            feedback: message,
          });

          if (res.data.success) {
            // Prefer returning the updated feedback array (backend returns it)
            // If backend returns whole incident instead, return res.data.incident.feedback
            return {
              success: true,
              feedback: res.data.feedback || res.data.incident?.feedback || [],
            };
          } else {
            return {
              success: false,
              message: res.data.message || "Failed to add feedback",
            };
          }
        } catch (error) {
          console.error("addFeedback error:", error);
          return {
            success: false,
            message: error.response?.data?.message || "Internal server error",
          };
        }
      },

      viewIncidents: async () => {
        try {
          const res = await axiosInstance.get("/auth/view-incidents");
          if (Array.isArray(res.data.data)) {
            set({ incidents: res.data.data });
          } else {
            toast.error(res.data.message);
          }
        } catch (error) {
          toast.error("Failed to fetch incidents.");
        }
      },

      // FETCH ALL NOTIFICATIONS
      fetchNotifications: async () => {
        try {
          const res = await axiosInstance.get("/auth/notifications");

          if (res.data.success) {
            const normalized = res.data.notifications.map((n) => ({
              ...n,
              isRead: n.isRead ?? false,
            }));

            set({ notifications: normalized });
          }
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      },

      // MARK SPECIFIC NOTIFICATION AS READ
      markNotificationAsRead: async (id) => {
        try {
          const res = await axiosInstance.post(
            "/auth/mark-notification-read",
            { notificationId: id }, // FIX
          );

          if (res.data.success) {
            // remove notification from UI OR update it
            set((state) => ({
              notifications: state.notifications.map((n) =>
                n._id === id ? { ...n, isRead: true } : n,
              ),
            }));
          }

          return res.data;
        } catch (err) {
          console.log("❌ markNotificationAsRead error", err);
        }
      },

      markAllNotificationsRead: async () => {
        try {
          const res = await axiosInstance.post(
            "/auth/mark-all-notifications-read",
          );
          if (res.data.success) {
            set((state) => ({
              notifications: state.notifications.map((n) => ({
                ...n,
                isRead: true,
              })),
            }));
          }
        } catch (err) {
          console.error(err);
        }
      },

      // CLEAR ALL NOTIFICATIONS
      clearNotifications: async () => {
        try {
          const res = await axiosInstance.delete("/auth/clear-notifications");

          if (res.data.success) {
            set({ notifications: [] });
          }
        } catch (error) {
          console.error("Error clearing notifications:", error);
        }
      },
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        authUser: state.authUser,
        authRole: state.authRole,
      }),
    },
  ),
);
