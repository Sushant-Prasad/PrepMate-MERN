import { Navigate } from "react-router-dom";

function ProtectedRoute({ element }) {
  // Check if user is logged in by reading from localStorage
  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const storedUser = readStoredUser();
  const isLoggedIn = !!(storedUser?.id || storedUser?._id || storedUser?.userId);

  // If user is logged in, render the element
  // If not logged in, redirect to login page
  return isLoggedIn ? element : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
