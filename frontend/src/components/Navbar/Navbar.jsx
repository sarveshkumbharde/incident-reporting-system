import React, { useState, useEffect } from "react";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Shield,
  Users,
  AlertTriangle,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import AvatarImg from "./avatar.jpeg";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authUser = useAuthStore((s) => s.authUser);
  const authRole = useAuthStore((s) => s.authRole);
  const notifications = useAuthStore((s) => s.notifications);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
  console.log("🔔 Navbar notifications changed:", notifications.length);
}, [notifications]);


  const handleLogout = async () => {
    await logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const getRoleBasedNavItems = () => {
    console.log("Navbar - getRoleBasedNavItems - authUser:", authUser);
    console.log("Navbar - getRoleBasedNavItems - authRole:", authRole);

    if (!authUser) {
      console.log("Navbar - No authUser, showing public nav items");
      return (
        <>
          <Link
            to="/"
            className="text-base font-medium text-gray-700 hover:text-primary"
          >
            Home
          </Link>
          <Link
            to="/report"
            className="text-base font-medium text-gray-700 hover:text-primary"
          >
            Report
          </Link>
        </>
      );
    }

    console.log("Navbar - User authenticated, checking role:", authRole);
    switch (authRole) {
      case "admin":
        return (
          <>
            <Link
              to="/admin-dashboard"
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/view-registrations"
              className="text-base font-medium text-gray-700 hover:text-primary flex items-center"
            >
              <Users className="w-4 h-4 mr-1" />
              Manage Users
            </Link>
            <Link
              to="/incidents"
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              All Incidents
            </Link>
            <Link
              to="/admin-users"
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              All Users
            </Link>
          </>
        );

      case "authority":
        return (
          <>
            <Link
              to="/authority-dashboard"
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/incidents"
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              Manage Incidents
            </Link>
          </>
        );

      case "user":
      default:
        return (
          <>
            <Link
              to="/user-dashboard"
              className="text-base font-medium text-gray-700 hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/incidents"
              className="text-base font-medium text-gray-700 hover:text-primary flex items-center"
            >
              <Shield className="w-4 h-4 mr-1" />
              Incidents
            </Link>
            <Link
              to="/report"
              className="text-base font-medium text-gray-700 hover:text-primary flex items-center"
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Report Incident
            </Link>
          </>
        );
    }
  };

  const getMobileNavItems = () => {
    if (!authUser) {
      return (
        <>
          <li>
            <Link to="/" onClick={toggleMobileMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/report" onClick={toggleMobileMenu}>
              Report
            </Link>
          </li>
        </>
      );
    }

    switch (authRole) {
      case "admin":
        return (
          <>
            <li>
              <Link to="/admin-dashboard" onClick={toggleMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/view-registrations"
                onClick={toggleMobileMenu}
                className="flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </li>
            <li>
              <Link to="/incidents" onClick={toggleMobileMenu}>
                All Incidents
              </Link>
            </li>
          </>
        );

      case "authority":
        return (
          <>
            <li>
              <Link to="/authority-dashboard" onClick={toggleMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/incidents" onClick={toggleMobileMenu}>
                Manage Incidents
              </Link>
            </li>
          </>
        );

      case "user":
      default:
        return (
          <>
            <li>
              <Link to="/user-dashboard" onClick={toggleMobileMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/report"
                onClick={toggleMobileMenu}
                className="flex items-center"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Incident
              </Link>
            </li>
            <li>
              <Link to="/incidents" onClick={toggleMobileMenu}>
                My Incidents
              </Link>
            </li>
          </>
        );
    }
  };

  // Show bell icon for ALL authenticated users (admin, authority, user)
  const shouldShowBellIcon = authUser;

  // Unread count
  const unreadCount = notifications?.filter((n) => !n.isRead)?.length || 0;

  return (
    <nav className="navbar bg-base-100 shadow-md px-4 relative">
      {/* Logo Section */}
      <div className="flex-1">
        <Link
          to={
            authUser
              ? authRole === "admin"
                ? "/admin-dashboard"
                : authRole === "authority"
                ? "/authority-dashboard"
                : authRole === "user"
                ? "/user-dashboard"
                : "/"
              : "/"
          }
          className="text-2xl font-semibold flex items-center space-x-2"
        >
          <Menu className="w-6 h-6" />
          <span>Incident Reporter</span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden lg:flex flex-1 justify-center space-x-8">
        {getRoleBasedNavItems()}
      </div>

      {/* User Section */}
      <div className="flex-none space-x-4">
        {/* Notifications - visible to ALL roles */}
        {shouldShowBellIcon && (
          <div className="dropdown dropdown-end">
            <button
              onClick={() => navigate("/notifications")}
              className="btn btn-ghost btn-circle"
            >
              <div className="indicator">
                <Bell className="w-6 h-6" />

                {/* Red count badge */}
                {unreadCount > 0 && (
                  <span className="badge badge-error badge-sm indicator-item">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Profile Dropdown */}
        {authUser && (
          <div className="dropdown dropdown-end hidden lg:block">
            <button className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src={AvatarImg} alt="User avatar" />
              </div>
            </button>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52 z-50"
            >
              <li>
                <Link to="/profile" className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </li>
              {authRole === "admin" && (
                <li>
                  <Link
                    to="/admin-dashboard"
                    className="flex items-center space-x-2"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                  </Link>
                </li>
              )}
              {authRole === "authority" && (
                <li>
                  <Link
                    to="/authority-dashboard"
                    className="flex items-center space-x-2"
                  >
                    <Users className="w-5 h-5" />
                    <span>Authority Dashboard</span>
                  </Link>
                </li>
              )}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Auth Buttons */}
        {!authUser ? (
          <>
            <div className="hidden lg:flex space-x-4">
              <Link to="/signup" className="btn btn-outline">
                Sign Up
              </Link>
              <Link to="/login" className="btn btn-primary">
                Log In
              </Link>
            </div>
          </>
        ) : (
          <div className="hidden lg:flex space-x-4">
            <button onClick={handleLogout} className="btn btn-warning">
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden">
        <button className="btn btn-ghost" onClick={toggleMobileMenu}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-base-100 shadow-lg lg:hidden z-50 border-t">
          <div className="p-4">
            <ul className="menu menu-vertical space-y-2 w-full">
              {getMobileNavItems()}
              {authUser ? (
                <>
                  {/* <li>
                    <Link to="/profile" onClick={toggleMobileMenu}>Profile</Link>
                  </li> */}
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();
                      }}
                      className="text-red-600 text-left"
                    >
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/signup" onClick={toggleMobileMenu}>
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" onClick={toggleMobileMenu}>
                      Log In
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
