// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { FaFireAlt, FaUserCircle } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import { useUserProfile } from "@/services/profileServices";
import logoSrc from "@/assets/FullLogo.jpg";

function Navbar({ onLogout = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [storedUser, setStoredUser] = useState(null);
  const avatarRef = useRef(null);
  const location = useLocation();

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

  const userId =
    storedUser?.id ?? storedUser?._id ?? storedUser?.userId ?? null;

  // useUserProfile will be disabled when there's no userId
  const { data: profileResp, isLoading: profileLoading } = useUserProfile(
    userId,
    { enabled: !!userId },
  );

  // normalize profile object (your fetcher sometimes returns { success, data })
  const profile = profileResp?.data ?? profileResp ?? null;

  // Safely extract streak numbers (support multiple shapes)
  const safeNumber = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "object") {
      return v.currentStreak ?? v.current ?? v.value ?? 0;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  // Use profile dsa/aptitude streaks if available; fall back to 0
  const dsaStreak = safeNumber(
    profile?.dsaStreak ?? profile?.streaks?.dsa ?? null,
  );
  const aptitudeStreak = safeNumber(
    profile?.aptitudeStreak ?? profile?.streaks?.aptitude ?? null,
  );

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "DSA", href: "/dsa" },
    { name: "Aptitude", href: "/aptitude" },
    { name: "Study Rooms", href: "/rooms" },
    { name: "CompanyPrep", href: "/company" },
  ];

  const navBaseClass =
    "rounded-lg px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-300 relative";

  const getNavClass = ({ isActive }) =>
    `${navBaseClass} ${
      isActive
        ? "bg-gradient-to-r from-[var(--brand-primary)] to-[#6EDBF0] text-white shadow-md font-extrabold"
        : "text-slate-700 hover:text-[var(--brand-secondary)] hover:shadow-sm"
    }`;

  useEffect(() => {
    function handleClickOutside(e) {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo (image) + Text */}
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--brand-primary)_16%,white)] bg-white/80 p-1">
            {navLinks.map((link, i) => (
              <div key={i}>
                <NavLink to={link.href} end={link.href === "/"} className={getNavClass}>
                  {link.name}
                </NavLink>
              </div>
            ))}
          </div>

          {/* Streak Icons — only show when logged in */}
          {userId && (
            <div className="flex items-center gap-6 ml-3">
              <Link
                to="/dsa-streak"
                className="flex flex-col items-center"
                title="DSA Streak"
              >
                <FaFireAlt className="text-red-500 w-6 h-6" />
                <span className="text-xs font-semibold text-slate-700">
                  {profileLoading ? "…" : dsaStreak}
                </span>
              </Link>
              <Link
                to="/aptitude-streak"
                className="flex flex-col items-center"
                title="Aptitude Streak"
              >
                <IoFlash className="text-yellow-400 w-6 h-6" />
                <span className="text-xs font-semibold text-slate-700">
                  {profileLoading ? "…" : aptitudeStreak}
                </span>
              </Link>
            </div>
          )}

          {/* Auth / Profile */}
          <div className="flex items-center gap-3 ml-4">
            {!userId ? (
              <>
                <Motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold text-sm transition-all duration-300 hover:shadow-md"
                >
                  <Link to="/login" className="flex items-center gap-2 no-underline text-[var(--brand-primary)]">
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                </Motion.button>
                <Motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm text-white transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
                  style={{
                    background: "linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)",
                  }}
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:translate-x-full transition-transform duration-500" />
                  <Link to="/register" className="flex items-center gap-2 no-underline text-white relative z-10">
                    <UserPlus size={18} />
                    <span>Signup</span>
                  </Link>
                </Motion.button>
              </>
            ) : (
              <div className="relative" ref={avatarRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 transition"
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt="profile"
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                  ) : (
                    <FaUserCircle className="w-10 h-10 text-slate-600" />
                  )}

                  <div className="hidden sm:block text-left">
                    <div
                      className="text-sm font-medium text-slate-800 truncate"
                      style={{ maxWidth: 140 }}
                    >
                      {profile?.name ?? storedUser?.name ?? "You"}
                    </div>
                  </div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2.5 text-sm font-bold tracking-wide text-slate-700 transition-all duration-200 hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,white)] hover:text-[var(--brand-secondary)]"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setStoredUser(null);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-bold tracking-wide text-slate-700 transition-all duration-200 hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,white)] hover:text-[var(--brand-secondary)]"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            className="md:hidden overflow-hidden bg-white border-t border-gray-200 shadow-lg"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link, i) => (
                <NavLink
                  key={i}
                  to={link.href}
                  end={link.href === "/"}
                  className={getNavClass}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}

              {/* Streak Icons - Mobile */}
              {userId && (
                <div className="flex items-center gap-6 pt-2">
                  <Link to="/dsa-streak" className="flex flex-col items-center">
                    <FaFireAlt className="text-red-500 w-6 h-6" />
                    <span className="text-xs font-semibold text-gray-700">
                      {profileLoading ? "…" : dsaStreak}
                    </span>
                  </Link>
                  <Link
                    to="/aptitude-streak"
                    className="flex flex-col items-center"
                  >
                    <IoFlash className="text-yellow-400 w-6 h-6" />
                    <span className="text-xs font-semibold text-gray-700">
                      {profileLoading ? "…" : aptitudeStreak}
                    </span>
                  </Link>
                </div>
              )}

              {/* Auth / Profile - Mobile */}
              <div className="pt-2">
                {!userId ? (
                  <div className="flex gap-3">
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold text-sm transition-all duration-300 hover:shadow-md"
                    >
                      <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-2 no-underline text-[var(--brand-primary)] w-full justify-center">
                        <LogIn size={18} />
                        <span>Login</span>
                      </Link>
                    </Motion.button>
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm text-white transition-all duration-300 shadow-lg hover:shadow-2xl relative overflow-hidden group"
                      style={{
                        background: "linear-gradient(135deg, var(--brand-secondary) 0%, var(--brand-primary) 100%)",
                      }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 group-hover:translate-x-full transition-transform duration-500" />
                      <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center gap-2 no-underline text-white relative z-10 w-full justify-center">
                        <UserPlus size={18} />
                        <span>Signup</span>
                      </Link>
                    </Motion.button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      className="rounded-lg px-4 py-2.5 text-sm font-bold tracking-wide text-slate-700 transition-all duration-200 hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,white)] hover:text-[var(--brand-secondary)]"
                      onClick={() => setIsOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setStoredUser(null);
                        onLogout();
                      }}
                      className="w-full rounded-lg px-4 py-2.5 text-left text-sm font-bold tracking-wide text-slate-700 transition-all duration-200 hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,white)] hover:text-[var(--brand-secondary)]"
                    >
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
