// src/layouts/AdminLayout.jsx
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
  Brain,
  Settings,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logoSrc from "@/assets/FullLogo.jpg";

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
      color: "cyan",
    },
    { 
      to: "/admin/users", 
      label: "Users", 
      icon: <Users className="w-5 h-5" />,
      color: "blue",
    },
    {
      to: "/admin/dsa-questions",
      label: "DSA Questions",
      icon: <Code className="w-5 h-5" />,
      color: "emerald",
    },
    {
      to: "/admin/aptitude-questions",
      label: "Aptitude Questions",
      icon: <Brain className="w-5 h-5" />,
      color: "purple",
    },
  ];

  const NavLinkItem = ({ to, label, icon, color }) => (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? "bg-gradient-to-r from-[#3DBFD9] to-[#0096c7] text-white shadow-lg shadow-[#3DBFD9]/30"
            : "text-gray-600 hover:bg-gradient-to-r hover:from-[#3DBFD9]/10 hover:to-transparent hover:text-[#03045E]"
        }`
      }
      onClick={() => setSidebarOpen(false)}
    >
      {({ isActive }) => (
        <>
          {/* Active indicator */}
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
          )}
          
          <span className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
            {icon}
          </span>
          <span className="font-medium flex-1">{label}</span>
          
          {isActive && (
            <ChevronRight className="w-4 h-4 animate-pulse" />
          )}
        </>
      )}
    </NavLink>
  );

  // If not admin, don't render anything (redirect effect triggers)
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40 flex">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="px-6 py-6 border-b border-gray-100 bg-gradient-to-br from-[#03045E]/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* logo image */}
                <div className="flex items-center justify-center p-1.5 bg-white rounded-xl shadow-md">
                  <img src={logoSrc} alt="PrepMate" className="w-10 h-10" />
                </div>

                {/* brand text */}
                <div>
                  <div className="text-xl font-bold leading-tight">
                    <span className="text-2xl font-bold tracking-tight text-[#3DBFD9]">
                      Prep
                    </span>
                    <span className="text-2xl font-bold tracking-tight text-[#03045E]">
                      Mate
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">Admin Panel</div>
                </div>
              </div>
              <button
                className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-4 py-6 flex-1 overflow-y-auto space-y-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-4 flex items-center gap-2">
              <div className="w-8 h-px bg-gradient-to-r from-[#3DBFD9] to-transparent" />
              <span>Main Menu</span>
            </div>
            {navItems.map((it) => (
              <NavLinkItem
                key={it.to}
                to={it.to}
                label={it.label}
                icon={it.icon}
                color={it.color}
              />
            ))}
          </nav>

          {/* User Section */}
          <div className="px-4 py-5 border-t border-gray-100 bg-gradient-to-br from-[#03045E]/5 to-transparent">
            <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl bg-gradient-to-r from-[#03045E] to-[#0353a4] shadow-lg relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full -ml-8 -mb-8" />
              
              <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#3DBFD9] to-[#0096c7] text-white font-bold text-lg shadow-lg border-2 border-white/30">
                {storedUser?.name?.charAt(0)?.toUpperCase() ?? "A"}
              </div>
              <div className="flex-1 min-w-0 relative">
                <div className="text-sm font-bold text-white truncate">
                  {storedUser?.name ?? "Admin"}
                </div>
                <div className="text-xs text-gray-200 truncate">
                  {storedUser?.email ?? "admin@prepmate.com"}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-300 rounded-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:pl-72 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-xl hover:bg-[#3DBFD9]/10 transition-all duration-300 group"
                onClick={() => setSidebarOpen(true)}
                aria-label="Toggle sidebar"
              >
                <Menu className="w-6 h-6 text-[#03045E] group-hover:text-[#3DBFD9] transition-colors" />
              </button>

              {/* Breadcrumb/Title */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-[#3DBFD9]/10 to-transparent rounded-lg">
                    <LayoutDashboard className="w-5 h-5 text-[#3DBFD9]" />
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#03045E] to-[#3DBFD9] bg-clip-text text-transparent">
                    Admin Panel
                  </h1>
                </div>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* User avatar on mobile */}
              <div className="md:hidden">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#3DBFD9] to-[#0096c7] text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {storedUser?.name?.charAt(0)?.toUpperCase() ?? "A"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>©️ 2024</span>
              <span className="font-semibold text-[#3DBFD9]">PrepMate</span>
              <span>- All rights reserved</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <a href="#" className="hover:text-[#3DBFD9] transition-colors">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:text-[#3DBFD9] transition-colors">Terms</a>
              <span>•</span>
              <a href="#" className="hover:text-[#3DBFD9] transition-colors">Support</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}