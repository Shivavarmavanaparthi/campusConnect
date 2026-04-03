import { Navigate, useLocation } from "react-router-dom";
import { useStore } from "../state/useStore";

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useStore();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
