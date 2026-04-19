import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "../lib/authToken";

export function RequireAuth() {
  const token = getAuthToken();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}
