import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="margin-auto"></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") {
      return <Navigate to="/admin" />;
    } else if (user.role === "vendor") {
      return <Navigate to="/vendor" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
}

export default ProtectedRoute;
