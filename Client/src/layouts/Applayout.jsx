import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function AppLayout() {
  return (
    <>
      <Navbar />
      {/* keep content below the fixed navbar */}
      <main className="pt-20">
        <Outlet />
      </main>
    </>
  );
}
