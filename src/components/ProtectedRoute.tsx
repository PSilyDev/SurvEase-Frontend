import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();
  const loc = useLocation();
  return !token ? <Navigate to="/login" replace state={{ from: loc }} /> : <Outlet />;
}
