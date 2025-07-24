// scriptly-frontend/src/components/PrivateRoute.jsx

import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// This component will protect routes
// It checks if a user is authenticated and optionally if they have the required role(s)
function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    // Show a loading indicator while authentication status is being determined
    return (
      <div className="flex justify-center items-center min-h-screen text-lg text-gray-700">
        Loading user data...
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if the user's role matches
  if (roles && user && !roles.includes(user.role)) {
    // If user does not have required role, redirect to unauthorized page or dashboard
    return <Navigate to="/dashboard" replace />; // Or a dedicated /unauthorized page
  }

  // If authenticated and authorized (if roles specified), render the children components
  return children ? children : <Outlet />; // Outlet is used for nested routes
}

export default PrivateRoute;
