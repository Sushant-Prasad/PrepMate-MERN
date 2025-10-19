import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  LayoutDashboard,
  Users,
  FileText,
  Code,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // load user from localStorage
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {
    // ignore parse error
  }

  const isAdmin =
    storedUser?.isAdmin === true ||
    (typeof storedUser?.role === "string" &&
      storedUser.role.toLowerCase() === "admin");

  useEffect(() => {
    // If not admin, redirect to login
    if (!isAdmin) {
      navigate("/login", { replace: true });
    }
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    // client-side logout: clear local user and redirect
    try {
      localStorage.removeItem("user");
    } catch (e) {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    { to: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
    {
      to: "/admin/dsa-questions",
      label: "DSA Questions",
      icon: <Code className="w-5 h-5" />,
    },
    {
      to: "/admin/aptitude-questions",
      label: "Aptitude Questions",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const NavLinkItem = ({ to, label, icon }) => (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-200"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`
      }
      onClick={() => setSidebarOpen(false)}
    >
      <span className={`transition-transform group-hover:scale-110`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );

  // If not admin, don't render anything (redirect effect triggers)
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-indigo-50/30 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 shadow-lg shadow-indigo-200">
                  <svg
                    className="w-6 h-6 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M6 12c1.5-4 5-6 9-6-1 4-3 7-6 9-2-2-3-3-3-3z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div>
                  <div className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                    PrepMate
                  </div>
                  <div className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                    Admin Panel
                  </div>
                </div>
              </div>
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-6 flex-1 overflow-y-auto space-y-1.5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
              Main Menu
            </div>
            {navItems.map((it) => (
              <NavLinkItem
                key={it.to}
                to={it.to}
                label={it.label}
                icon={it.icon}
              />
            ))}
          </nav>

          {/* User Section */}
          <div className="px-4 py-5 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-white border border-gray-200">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-md">
                {storedUser?.name?.charAt(0).toUpperCase() ?? "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {storedUser?.name ?? "Admin"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {storedUser?.email ?? "admin@prepmate.com"}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>

              <div>
                <div className="text-lg font-bold text-gray-900">
                  Admin Dashboard
                </div>
                <div className="text-xs text-gray-500">
                  Welcome back, {storedUser?.name ?? "Admin"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
