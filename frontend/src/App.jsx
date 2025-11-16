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
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import CheckApproval from "./pages/CheckApproval/CheckApproval";
import IncidentForm from "./pages/IncidentForm/IncidentForm";
import UserProfile from "./pages/UserProfile/UserProfile";
import ViewRegistrations from "./pages/ViewRegistrations/ViewRegistrations";
import ViewIncident from "./pages/ViewIncident/ViewIncident";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AuthorityDashboard from "./pages/AuthorityDashboard/AuthorityDashboard";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import GetMessages from "./pages/GetMessages/GetMessages.jsx";
import AuthRedirect from "./components/AuthRedirect/AuthRedirect.jsx";
import AdminUsers from "./pages/AdminUsers/AdminUsers.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";

function App() {
  const { authUser, authRole, initializeAuth } = useAuthStore();

  // Initialize authentication on app startup
  useEffect(() => {
    if (!authUser) initializeAuth();
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
      <Toaster />
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
          path="/get-messages"
          element={authUser ? <GetMessages /> : <Signup />}
        />

        <Route path="/incidents" element={<Incidents />} />
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
