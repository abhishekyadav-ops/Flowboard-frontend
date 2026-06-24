import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem("token");

  // If the user does not possess an active token string, send them back to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;