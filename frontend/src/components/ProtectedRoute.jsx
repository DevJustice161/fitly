import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Still loading auth state
  if (loading) {
    return <div className="margin-auto">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin" />;
    } else if (user.role === "vendor") {
      return <Navigate to="/vendor" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
    //return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
