import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, Flame, Zap } from "lucide-react";
import { FaFireAlt } from "react-icons/fa";
import { IoFlash } from "react-icons/io5";
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "DSA", href: "/dsa" },
    { name: "Aptitude", href: "/aptitude" },
    { name: "Study Rooms", href: "/rooms" },
    { name: "CompanyPrep", href: "/company" },
  ];

  // Temporary streak values
  const dsaStreak = 5;
  const aptitudeStreak = 3;

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.a
          href="/"
          className="text-2xl font-extrabold text-indigo-600 tracking-tight"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          PrepMate
        </motion.a>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:flex items-center mx-8 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search topics, questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link, i) => (
            <motion.a
              key={i}
              href={link.href}
              className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {link.name}
            </motion.a>
          ))}

          {/* Streak Icons */}
          <div className="flex items-center gap-6 ml-2">
            {/* DSA Streak */}
            <a href="/dsa-streak" className="flex flex-col items-center">
              <FaFireAlt className="text-red-500 w-6 h-6" />
              <span className="text-xs font-semibold text-gray-700">{dsaStreak}</span>
            </a>
            {/* Aptitude Streak */}
            <a href="/aptitude-streak" className="flex flex-col items-center">
              <IoFlash className="text-yellow-400 w-6 h-6" />
              <span className="text-xs font-semibold text-gray-700">{aptitudeStreak}</span>
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex gap-3 ml-4">
            <Button variant="outline" asChild>
              <a href="/login">Login</a>
            </Button>
            <Button asChild>
              <a href="/register">Signup</a>
            </Button>
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
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col px-6 py-4 space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search topics, questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

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

              {/* Streak Icons - Mobile */}
              <div className="flex items-center gap-6 pt-2">
                <a href="/dsa-streak" className="flex flex-col items-center">
                  <FaFireAlt className="text-red-500 w-6 h-6" />
                  <span className="text-xs font-semibold text-gray-700">{dsaStreak}</span>
                </a>
                <a href="/aptitude-streak" className="flex flex-col items-center">
                  <IoFlash className="text-yellow-500 w-6 h-6" />
                  <span className="text-xs font-semibold text-gray-700">{aptitudeStreak}</span>
                </a>
              </div>

              {/* Auth Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" asChild className="w-full">
                  <a href="/login" onClick={() => setIsOpen(false)}>
                    Login
                  </a>
                </Button>
                <Button asChild className="w-full">
                  <a href="/register" onClick={() => setIsOpen(false)}>
                    Signup
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
