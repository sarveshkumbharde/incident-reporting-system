import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Incidents from "./pages/Incidents/Incidents";
import Profile from "./pages/Profile/Profile";
// import { ToastContainer } from "react-toastify";
import { Toaster, toast } from "react-hot-toast";

// Add a custom .info method to react-hot-toast if not present
toast.info = (message, options) => {
  return toast(message, {
    ...options,
    icon: "ℹ️",
    style: {
      borderLeft: "5px solid #3b82f6",
      background: "#eff6ff",
      color: "#1e3a8a",
    },
  });
};
import { useAuthStore } from "./stores/authStore";
import CheckApproval from "./pages/CheckApproval/CheckApproval";
import IncidentForm from "./pages/IncidentForm/IncidentForm";
import UserProfile from "./pages/UserProfile/UserProfile";
import ViewRegistrations from "./pages/ViewRegistrations/ViewRegistrations";
import ViewIncident from "./pages/ViewIncident/ViewIncident";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard/AuthorityDashboard";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import AuthRedirect from "./components/AuthRedirect/AuthRedirect.jsx";
import AdminUsers from "./pages/AdminUsers/AdminUsers.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";

function App() {
  const { authUser, authRole, initializeAuth } = useAuthStore();

  // Initialize authentication on app startup
  useEffect(() => {
    initializeAuth();
  }, []);

  // Debug auth state changes
  useEffect(() => {
    console.log("👤 App - Auth state changed:", {
      hasUser: !!authUser,
      role: authRole,
      user: authUser,
    });
  }, [authUser, authRole]);

  return (
    <>
      <Toaster
        limit={1}
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            color: "#1e293b",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(226, 232, 240, 0.8)",
            padding: "16px 20px",
            borderRadius: "16px",
            fontSize: "14px",
            fontWeight: "500",
            fontFamily: '"Outfit", "Inter", sans-serif',
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            maxWidth: "400px",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#ffffff",
            },
            style: {
              borderLeft: "5px solid #10b981",
              background: "#f0fdf4",
              color: "#14532d",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
            style: {
              borderLeft: "5px solid #ef4444",
              background: "#fef2f2",
              color: "#7f1d1d",
            },
          },
        }}
      />
      <Navbar />
      <Routes>
        {/* Catch-all route for 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
                <p className="text-xl text-gray-700">Page not found!</p>
              </div>
            </div>
          }
        />

        {/* Root route - Uses AuthRedirect for automatic navigation */}
        <Route path="/" element={authUser ? <AuthRedirect /> : <Home />} />

        <Route
          path="/admin-users"
          element={
            authUser && authRole === "admin" ? (
              <AdminUsers />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/notifications"
          element={authUser ? <Notifications /> : <Login />}
        />

        {/* Login route - Redirects if already authenticated */}
        <Route
          path="/login"
          element={authUser ? <AuthRedirect /> : <Login />}
        />

        {/* Signup route - Redirects if already authenticated */}
        <Route
          path="/signup"
          element={authUser ? <AuthRedirect /> : <Signup />}
        />

        <Route
          path="/incidents"
          element={!authUser ? <AuthRedirect /> : <Incidents />}
        />
        <Route path="/view-user/:id" element={<UserProfile />} />

        <Route
          path="/report"
          element={!authUser ? <AuthRedirect /> : <IncidentForm />}
        />

        <Route path="/check-approval" element={<CheckApproval />} />

        <Route
          path="/profile"
          element={!authUser ? <AuthRedirect /> : <Profile user={authUser} />}
        />

        <Route
          path="/view-registrations"
          element={!authUser ? <AuthRedirect /> : <ViewRegistrations />}
        />

        <Route
          path="/view-incident/:id"
          element={!authUser ? <AuthRedirect /> : <ViewIncident />}
        />

        {/* Dashboard Routes */}
        <Route
          path="/admin-dashboard"
          element={
            !authUser ? (
              <AuthRedirect />
            ) : authRole !== "admin" ? (
              <AuthRedirect />
            ) : (
              <AdminDashboard />
            )
          }
        />

        <Route
          path="/authority-dashboard"
          element={
            !authUser ? (
              <AuthRedirect />
            ) : authRole !== "authority" ? (
              <AuthRedirect />
            ) : (
              <AuthorityDashboard />
            )
          }
        />

        <Route
          path="/user-dashboard"
          element={
            !authUser ? (
              <AuthRedirect />
            ) : authRole !== "user" ? (
              <AuthRedirect />
            ) : (
              <UserDashboard />
            )
          }
        />
      </Routes>
      <Footer />
      {/* <ToastContainer /> */}
    </>
  );
}

export default App;
