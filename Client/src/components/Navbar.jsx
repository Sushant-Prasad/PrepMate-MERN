// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, LogIn, UserPlus, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { FaFireAlt, FaUserCircle } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import { useUserProfile } from "@/services/profileServices";
import logoSrc from "@/assets/FullLogo.jpg";

function Navbar({ onLogout = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [storedUser, setStoredUser] = useState(null);
  const isAdmin = storedUser?.role?.toLowerCase?.() === "admin";
  const avatarRef = useRef(null);
  const location = useLocation();

  // Track scroll to add shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const readStoredUser = () => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    setStoredUser(readStoredUser());
  }, [location.pathname]);

  useEffect(() => {
    const syncAuth = () => setStoredUser(readStoredUser());
    window.addEventListener("storage", syncAuth);
    window.addEventListener("focus", syncAuth);
    window.addEventListener("auth-changed", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("focus", syncAuth);
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const userId = storedUser?.id ?? storedUser?._id ?? storedUser?.userId ?? null;

  const { data: profileResp, isLoading: profileLoading } = useUserProfile(
    userId,
    { enabled: !!userId },
  );
  const profile = profileResp?.data ?? profileResp ?? null;

  const safeNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "object") return v.currentStreak ?? v.current ?? v.value ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const dsaStreak = safeNumber(profile?.dsaStreak ?? profile?.streaks?.dsa ?? null);
  const aptitudeStreak = safeNumber(profile?.aptitudeStreak ?? profile?.streaks?.aptitude ?? null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "DSA", href: "/dsa" },
    { name: "Aptitude", href: "/aptitude" },
    { name: "Study Rooms", href: "/rooms" },
    { name: "Company Prep", href: "/company" },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.name ?? storedUser?.name ?? "You";
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200/60 border-b border-slate-200/80"
          : "bg-white/80 backdrop-blur-sm border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link
          to="/"
          className="flex items-center gap-3 no-underline"
          aria-label="PrepMate home"
        >
          {/* logo image */}
          <div className="flex items-center justify-center  ">
            <img src={logoSrc} alt="PrepMate logo" className="w-12 h-12 p-0" />
          </div>

          {/* brand text */}
          <div className="leading-tight">
            <div className="text-2xl font-bold tracking-tight text-[#3DBFD9]">
              <span className="text-2xl font-bold tracking-tight text-[#3DBFD9]">
                Prep
              </span>
              <span className="text-2xl font-bold tracking-tight text-[#03045e]">
                Mate
              </span>
            </div>
          </div>
        </Link>

          {/* ── Desktop Nav Links ── */}
          <div className="hidden md:flex items-center gap-1 bg-slate-50/80 border border-slate-200 rounded-2xl px-1.5 py-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                end={link.href === "/"}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-[#03045E] to-[#3DBFD9] text-white shadow-md shadow-[#3DBFD9]/30"
                      : "text-slate-600 hover:text-[#03045E] hover:bg-white hover:shadow-sm"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* ── Desktop Right Section ── */}
          <div className="hidden md:flex items-center gap-3">

            {/* Streak Badges — only when logged in */}
            {userId && (
              <div className="flex items-center gap-2">
                <Link
                  to="/dsa-streak"
                  title="DSA Streak"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 rounded-full transition-all duration-200 no-underline group"
                >
                  <FaFireAlt className="text-red-500 w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-red-600">
                    {profileLoading ? "…" : dsaStreak}
                  </span>
                </Link>
                <Link
                  to="/aptitude-streak"
                  title="Aptitude Streak"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full transition-all duration-200 no-underline group"
                >
                  <IoFlash className="text-amber-500 w-3.5 h-3.5" />
                  <span className="text-xs font-bold text-amber-600">
                    {profileLoading ? "…" : aptitudeStreak}
                  </span>
                </Link>
              </div>
            )}

            {/* Auth Buttons / Profile */}
            {!userId ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-[#03045E] border-2 border-[#03045E]/20 hover:border-[#03045E]/60 hover:bg-[#03045E]/5 transition-all duration-200 no-underline"
                >
                  <LogIn size={15} />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#03045E] to-[#3DBFD9] hover:from-[#020347] hover:to-[#30b0ca] shadow-md shadow-[#3DBFD9]/30 hover:shadow-lg hover:shadow-[#3DBFD9]/40 transition-all duration-200 no-underline relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <UserPlus size={15} className="relative z-10" />
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </div>
            ) : (
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-transparent hover:border-slate-200"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {/* Avatar */}
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="profile"
                      className="w-8 h-8 rounded-lg object-cover border-2 border-[#3DBFD9]/40"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#03045E] to-[#3DBFD9] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {initials}
                    </div>
                  )}
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-semibold text-slate-800 leading-none truncate" style={{ maxWidth: 120 }}>
                      {displayName}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {storedUser?.role === "admin" ? "Admin" : "Member"}
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <Motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden z-50"
                    >
                      <div className="p-1">
                        <Link
                          to="/profile"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#03045E] transition-all duration-150 no-underline"
                          onClick={() => setMenuOpen(false)}
                        >
                          <User size={15} className="text-[#3DBFD9]" />
                          My Profile
                        </Link>
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin"
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#03045E] transition-all duration-150 no-underline"
                              onClick={() => setMenuOpen(false)}
                            >
                              <Settings size={15} className="text-[#3DBFD9]" />
                              Admin Panel
                            </Link>
                            <div className="h-px bg-slate-100 mx-2 my-1" />
                          </>
                        )}
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            setStoredUser(null);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-150"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#03045E] transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Nav ── */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            className="md:hidden bg-white/98 backdrop-blur-md border-t border-slate-100 shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-[#03045E] to-[#3DBFD9] text-white shadow-md"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#03045E]"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}

              {/* Streak Badges - Mobile */}
              {userId && (
                <div className="flex items-center gap-3 px-1 pt-2">
                  <Link
                    to="/dsa-streak"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl flex-1 justify-center no-underline"
                  >
                    <FaFireAlt className="text-red-500 w-4 h-4" />
                    <span className="text-sm font-bold text-red-600">
                      {profileLoading ? "…" : dsaStreak} Day Streak
                    </span>
                  </Link>
                  <Link
                    to="/aptitude-streak"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex-1 justify-center no-underline"
                  >
                    <IoFlash className="text-amber-500 w-4 h-4" />
                    <span className="text-sm font-bold text-amber-600">
                      {profileLoading ? "…" : aptitudeStreak} Day Streak
                    </span>
                  </Link>
                </div>
              )}

              {/* Auth - Mobile */}
              <div className="pt-2 border-t border-slate-100 mt-2">
                {!userId ? (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-[#03045E] border-2 border-[#03045E]/20 hover:border-[#03045E]/50 no-underline transition-all"
                    >
                      <LogIn size={16} />
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#03045E] to-[#3DBFD9] no-underline shadow-md transition-all"
                    >
                      <UserPlus size={16} />
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* User Info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl mb-2">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#03045E] to-[#3DBFD9] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{displayName}</div>
                        <div className="text-xs text-slate-400">
                          {storedUser?.role === "admin" ? "Admin" : "Member"}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 no-underline transition-all"
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={16} className="text-[#3DBFD9]" />
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 no-underline transition-all"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings size={16} className="text-[#3DBFD9]" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setStoredUser(null);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
