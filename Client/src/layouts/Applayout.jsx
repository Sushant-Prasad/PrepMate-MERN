import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function AppLayout({ user, onLogout }) {
  return (
    <>
      {/* Pass user + onLogout to Navbar */}
      <Navbar user={user} onLogout={onLogout} />

      {/* keep content below the fixed navbar */}
      <main className="pt-20">
        <Outlet />
      </main>
    </>
  );
}
