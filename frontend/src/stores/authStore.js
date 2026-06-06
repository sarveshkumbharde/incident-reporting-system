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
          const res = await axiosInstance.get("/api/auth/me");

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
          get().listenToIncidentUpdates(); // realtime incident updates
        } catch {
          set({ authUser: null, authRole: null });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/api/auth/login", data);
          if (res.data.success) {
            const loggedInUser = res.data.user;
            toast.success("Login successful!");
            set({
              authUser: loggedInUser,
              authRole: loggedInUser.role || null,
            });
            if (!socket.connected) {
              socket.connect();
            }
            socket.emit("register", {
              userId: loggedInUser._id,
              role: loggedInUser.role,
            });
            await get().fetchNotifications();
            get().listenToNotifications();
            get().listenToIncidentUpdates();
            return loggedInUser;
          } else {
            toast.error(res.data.message);
            return null;
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed!";
          toast.error(errorMessage);
          return null;
        } finally {
          set({ isLoggingIn: false });
        }
      },

      listenToNotifications: () => {
        const { hasSocketListener } = get();
        if (hasSocketListener) return;

        socket.on("notification", (notification) => {
          const incoming =
            typeof notification === "string"
              ? { text: notification }
              : notification;

          const normalized = {
            ...incoming,
            isRead: incoming.isRead ?? false,
          };

          set((state) => ({
            notifications: normalized._id
              ? [
                  normalized,
                  ...state.notifications.filter((n) => n._id !== normalized._id),
                ]
              : [normalized, ...state.notifications],
          }));

          toast.success(normalized.text);
        });

        set({ hasSocketListener: true });
      },

      listenToIncidentUpdates: () => {
        socket.off("incident_updated");

        socket.on("incident_updated", (data) => {
          const currentIncidents = get().incidents || [];
          const incidentId = data.incident?._id || data.incidentId;
          
          if (!incidentId) return;

          const exists = currentIncidents.some((inc) => inc._id === incidentId);
          if (!exists) return; // not relevant to us

          // Show notifications if update by another user
          if (data.updatedBy !== get().authUser?._id) {
            if (data.type === "feedback") {
              toast.info(`New feedback on incident: "${data.incident?.title || "Incident"}"`);
            } else if (data.type === "status") {
              toast.success(`Incident status updated to: "${data.status}"`);
            } else if (data.type === "assignment") {
              toast.success(`Incident was assigned to ${data.assignedTo?.firstName} ${data.assignedTo?.lastName}`);
            }
          }

          // Map and update list
          const updatedIncidents = currentIncidents.map((inc) => {
            if (inc._id !== incidentId) return inc;

            if (data.type === "feedback" && data.incident) {
              return {
                ...inc,
                ...data.incident,
              };
            } else if (data.type === "status") {
              return { ...inc, status: data.status };
            } else if (data.type === "assignment") {
              return { ...inc, assignedTo: data.assignedTo };
            }
            return inc;
          });

          set({ incidents: updatedIncidents });
        });
      },

      register: async (data) => {
        set({ isSigningIn: true });
        try {
          const res = await axiosInstance.post("/api/auth/signup", data);
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
          const res = await axiosInstance.post("/api/auth/logout");

          socket.off("notification");
          socket.off("incident_updated");
          socket.disconnect();

          toast.success("Logout successful");

          set({
            authUser: null,
            authRole: null,
            incidents: [],
            notifications: [],
            hasSocketListener: false,
          });
          return true;
        } catch (error) {
          toast.error(error.response?.data?.message || "Logout failed!");
          return false;
        }
      },

      checkApproval: async (data) => {
        set({ isCheckingApproval: true });
        try {
          const res = await axiosInstance.post("/api/auth/check-approval", data);
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
          const res = await axiosInstance.post("/api/auth/report-incident", data);
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
          const res = await axiosInstance.get(`/api/authority/user/${id}`);
          return res.data.user;
        } catch (error) {
          return null;
        }
      },

      viewRegistrations: async () => {
        try {
          const res = await axiosInstance.get("/api/admin/view-registrations");
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
          const res = await axiosInstance.post(`/api/admin/verify/${data.userId}`, {
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
          const res = await axiosInstance.get(`/api/auth/view-incident/${id}`);

          const incident = res.data.success
            ? res.data.incident
            : res.data?._id
              ? res.data
              : null;

          if (incident) {
            set({ incident });
            console.log("✅ Incident fetched:", res.data.incident);
            toast.success("Incident fetched successfully!");
            return incident; // Return the incident data
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
          const res = await axiosInstance.get("/api/auth/user-incidents");
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
            `/api/authority/update-status/${id}`,
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
          const res = await axiosInstance.put(`/api/admin/assign/${id}`, {
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
          const res = await axiosInstance.get("/api/admin/all-users");
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
          const res = await axiosInstance.delete(`/api/admin/delete-user/${id}`);
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
          const res = await axiosInstance.get(`/api/admin/all-authorities`);
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
          const res = await axiosInstance.post("/api/auth/submit-feedback", {
            incidentId,
            feedback: message,
          });

          if (res.data.success) {
            return {
              success: true,
              feedback: res.data.feedback || res.data.incident?.feedback || [],
              incident: res.data.incident,
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
          const res = await axiosInstance.get("/api/auth/view-incidents");
          const incidents = Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
              ? res.data
              : null;

          if (incidents) {
            set({ incidents });
            // Join socket rooms for all incidents in the list
            incidents.forEach((inc) => {
              if (inc._id) {
                socket.emit("join_incident", inc._id);
              }
            });
          } else {
            toast.error(res.data?.message || "Failed to fetch incidents.");
          }
        } catch (error) {
          toast.error("Failed to fetch incidents.");
        }
      },

      // FETCH ALL NOTIFICATIONS
      fetchNotifications: async () => {
        try {
          const res = await axiosInstance.get("/api/auth/notifications");

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
            "/api/auth/mark-notification-read",
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
            "/api/auth/mark-all-notifications-read",
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
          const res = await axiosInstance.delete("/api/auth/clear-notifications");

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
