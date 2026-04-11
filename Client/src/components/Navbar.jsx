// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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

  // Keep auth UI synced with localStorage changes and route transitions.
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
    "rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200";

  const getNavClass = ({ isActive }) =>
    `${navBaseClass} ${
      isActive
        ? "bg-[color:color-mix(in_srgb,var(--brand-primary)_22%,white)] text-[var(--brand-secondary)] shadow-sm"
        : "text-slate-700 hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,white)] hover:text-[var(--brand-secondary)]"
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
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Signup</Link>
                </Button>
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setStoredUser(null);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Logout
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
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
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

              {/* Streak Icons - Mobile (only when logged in) */}
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
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        Signup
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/profile"
                      className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setStoredUser(null);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
