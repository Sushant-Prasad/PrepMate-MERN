// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Flame, Zap } from "lucide-react";
import { FaFireAlt } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useUserProfile } from "@/services/profileServices";
import logoSrc from "@/assets/FullLogo.jpg"; 

function Navbar({ user = null, onLogout = () => {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef(null);

  // derive current userId from localStorage (same parsing logic used across app)
  let storedUser = null;
  try {
    const raw = localStorage.getItem("user");
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {
    // ignore parse errors
  }
  const userId = storedUser?.id ?? storedUser?._id ?? storedUser?.userId ?? null;

  // useUserProfile will be disabled when there's no userId
  const { data: profileResp, isLoading: profileLoading } = useUserProfile(userId, { enabled: !!userId });

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
  const dsaStreak = safeNumber(profile?.dsaStreak ?? profile?.streaks?.dsa ?? null);
  const aptitudeStreak = safeNumber(profile?.aptitudeStreak ?? profile?.streaks?.aptitude ?? null);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "DSA", href: "/dsa" },
    { name: "Aptitude", href: "/aptitude" },
    { name: "Study Rooms", href: "/rooms" },
    { name: "CompanyPrep", href: "/company" },
  ];

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
        <a
          href="/"
          className="flex items-center gap-3 no-underline"
          aria-label="PrepMate home"
        >
          {/* logo image */}
          <div
            className="flex items-center justify-center  "
            
          >
            <img
              src={logoSrc}
              alt="PrepMate logo"
              className="w-16 h-16 p-0"
             
            />
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
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-6">
            {navLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                className="text-slate-700 hover:text-indigo-600 font-medium transition-colors"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {link.name}
              </motion.a>
            ))}
          </div>

          {/* Streak Icons — only show when logged in */}
          {userId && (
            <div className="flex items-center gap-6 ml-3">
              <a href="/dsa-streak" className="flex flex-col items-center" title="DSA Streak">
                <FaFireAlt className="text-red-500 w-6 h-6" />
                <span className="text-xs font-semibold text-slate-700">{profileLoading ? "…" : dsaStreak}</span>
              </a>
              <a href="/aptitude-streak" className="flex flex-col items-center" title="Aptitude Streak">
                <IoFlash className="text-yellow-400 w-6 h-6" />
                <span className="text-xs font-semibold text-slate-700">{profileLoading ? "…" : aptitudeStreak}</span>
              </a>
            </div>
          )}

          {/* Auth Buttons / User Icon */}
          <div className="flex items-center gap-3 ml-4">
            {!user && !userId ? (
              <>
                <Button variant="outline" asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button asChild>
                  <a href="/register">Signup</a>
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
                  <FaUserCircle className="w-10 h-10 text-slate-600" />
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-800 truncate" style={{ maxWidth: 140 }}>
                      {profile?.name ?? storedUser?.name ?? "You"}
                    </div>
                  </div>
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Profile
                      </a>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </motion.div>
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
          <motion.div
            className="md:hidden bg-white border-t border-gray-200 shadow-lg"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.28 }}
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {navLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              {/* Streak Icons - Mobile (only when logged in) */}
              {userId && (
                <div className="flex items-center gap-6 pt-2">
                  <a href="/dsa-streak" className="flex flex-col items-center">
                    <Flame className="text-orange-500 w-6 h-6" />
                    <span className="text-xs font-semibold text-gray-700">{profileLoading ? "…" : dsaStreak}</span>
                  </a>
                  <a href="/aptitude-streak" className="flex flex-col items-center">
                    <Zap className="text-yellow-500 w-6 h-6" />
                    <span className="text-xs font-semibold text-gray-700">{profileLoading ? "…" : aptitudeStreak}</span>
                  </a>
                </div>
              )}

              {/* Auth Buttons / User Icon - Mobile */}
              <div className="pt-2">
                {!user && !userId ? (
                  <div className="flex gap-3">
                    <Button variant="outline" asChild className="w-full">
                      <a href="/login" onClick={() => setIsOpen(false)}>Login</a>
                    </Button>
                    <Button asChild className="w-full">
                      <a href="/register" onClick={() => setIsOpen(false)}>Signup</a>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <a href="/profile" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100" onClick={() => setIsOpen(false)}>
                      Profile
                    </a>
                    <button
                      onClick={() => {
                        setIsOpen(false);
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
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
