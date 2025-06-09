import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

const ProtectedRoute = () => {
  let { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
