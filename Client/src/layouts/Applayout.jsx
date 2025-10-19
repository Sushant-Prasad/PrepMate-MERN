// src/layouts/AppLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function AppLayout({ user, onLogout }) {
  // Treat either boolean flag or role string as admin
  const isAdmin =
    user?.isAdmin === true ||
    (typeof user?.role === "string" && user.role.toLowerCase() === "admin");

  // smaller top padding when navbar is hidden so page doesn't have too much gap
  const topPaddingClass = isAdmin ? "pt-6" : "pt-20";

  return (
    <>
      {/* Navbar hidden for admin users */}
      {!isAdmin && <Navbar user={user} onLogout={onLogout} />}

      <main className={topPaddingClass}>
        <Outlet />
      </main>
    </>
  );
}
