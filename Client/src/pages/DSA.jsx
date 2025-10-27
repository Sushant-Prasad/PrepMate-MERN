// src/pages/DSA.jsx
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Code2, Zap, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useDSAQuestions } from "@/services/DSAServices";

const PRIMARY = "#3DBFD9";
const SECONDARY = "#03045e";
const ACCENT = "#0ea5a4";
const GRADIENT = `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})`;

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

const getDifficultyColor = (difficulty) => {
  switch ((difficulty || "").toLowerCase()) {
    case "easy":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "medium":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "hard":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    default:
      return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
  }
};

export default function DSA() {
  const navigate = useNavigate();

  // UI state
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [search, setSearch] = useState("");
  const [hoveredProblem, setHoveredProblem] = useState(null);

  // Data
  const { data, isLoading, isError, error, refetch } = useDSAQuestions({}, { keepPreviousData: true });
  const questions = data?.data || [];

  // Tags derived from questions
  const tags = useMemo(() => {
    const t = new Set();
    for (const q of questions) {
      (q.tags || []).forEach((tag) => tag && t.add(tag.trim()));
    }
    return ["all", ...Array.from(t).sort((a, b) => a.localeCompare(b))];
  }, [questions]);

  // Filtered list
  const filtered = useMemo(() => {
    const term = (search || "").trim().toLowerCase();
    return (questions || []).filter((q) => {
      const byTag =
        selectedTag === "all" ||
        (q.tags || []).map((t) => (t || "").toLowerCase()).includes((selectedTag || "").toLowerCase());

      const byDiff =
        selectedDifficulty === "all" ||
        ((q.difficulty || "").toLowerCase() === (selectedDifficulty || "").toLowerCase());

      const inText =
        !term ||
        (q.title || "").toLowerCase().includes(term) ||
        (q.description || "").toLowerCase().includes(term) ||
        (q.companyTags || []).some((t) => (t || "").toLowerCase().includes(term)) ||
        (q.tags || []).some((t) => (t || "").toLowerCase().includes(term));

      return byTag && byDiff && inText;
    });
  }, [questions, selectedTag, selectedDifficulty, search]);

  const stats = useMemo(() => {
    const total = questions.length;
    return {
      total,
      easy: questions.filter((q) => (q.difficulty || "").toLowerCase() === "easy").length,
      medium: questions.filter((q) => (q.difficulty || "").toLowerCase() === "medium").length,
      hard: questions.filter((q) => (q.difficulty || "").toLowerCase() === "hard").length,
    };
  }, [questions]);

  // MAIN container height: subtract header (approx 92px). Adjust if your header height differs.
  const mainHeightStyle = { height: "calc(100vh - 92px)" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      {/* Compact Hero */}
      <header className="relative" style={{ background: GRADIENT }}>
        <div className="absolute inset-0 opacity-6 pointer-events-none">
          <div className="absolute -left-12 -top-12 w-44 h-44 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute -right-12 -bottom-12 w-44 h-44 rounded-full bg-white/6 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-3 md:py-4">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32 }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-3 bg-white/12 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Code2 className="w-5 h-5 text-white" />
                  <span className="text-white text-sm font-medium">Practice • Learn</span>
                </div>

                <div>
                  <h1 className="text-lg md:text-2xl font-extrabold text-white leading-tight">
                    Data Structures & Algorithms
                  </h1>
                  <p className="text-xs md:text-sm text-white/90">
                    Curated interview problems — quickly filter, practice and submit.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <MiniStat label="Total" value={stats.total} />
                <MiniStat label="Easy" value={stats.easy} color="emerald" />
                <MiniStat label="Medium" value={stats.medium} color="amber" />
                <MiniStat label="Hard" value={stats.hard} color="rose" />
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Main content area uses remaining viewport height */}
      <main className="max-w-7xl mx-auto px-4" style={mainHeightStyle}>
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 h-full items-start">
          {/* Sidebar */}
          <aside className="hidden lg:block h-full">
            <div className="sticky top-6 h-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 ">
                  <Filter className="w-5 h-5 " style={{ color: PRIMARY }} />
                  Topics
                </h2>
                <p className="text-xs text-gray-500 mt-1">Filter problems by tag</p>
              </div>

              <div className="overflow-y-auto p-3 h-[calc(100% - 72px)]"> {/* remaining height for content */}
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <motion.button
                      key={tag}
                      whileHover={{ x: 4 }}
                      onClick={() => setSelectedTag(tag)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-between ${
                        selectedTag === tag ? "text-white shadow-md" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      style={selectedTag === tag ? { background: GRADIENT } : {}}
                      aria-pressed={selectedTag === tag}
                    >
                      <span className="truncate">{tag}</span>
                      {selectedTag === tag && <span className="text-xs opacity-90">✓</span>}
                    </motion.button>
                  ))}
                </div>

                {/* Quick actions at bottom */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setSelectedTag("all"); setSelectedDifficulty("all"); setSearch(""); }}
                    className="w-full text-sm px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Right column (search + list) */}
          <section className="h-full flex flex-col">
            {/* Search / filters (sticky header for right column) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search problems, tags, or companies..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 py-2"
                    style={{ borderRadius: "10px" }}
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">{filtered.length}</span>
                </div>

                <Button  variant="outline" onClick={() => refetch()}>Refresh</Button>
              </div>

              <div className="flex gap-2 flex-wrap mt-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDifficulty(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${selectedDifficulty === d ? "text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    style={selectedDifficulty === d ? { background: SECONDARY } : {}}
                    aria-pressed={selectedDifficulty === d}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Problems list card that fills the column and scrolls */}
            <div className="flex-1 overflow-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full overflow-hidden">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center">
                      <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/40 flex items-center justify-center" style={{ boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06)" }}>
                        <svg className="animate-spin w-5 h-5" viewBox="0 0 50 50">
                          <circle cx="25" cy="25" r="20" stroke={SECONDARY} strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" fill="none" style={{ opacity: 0.9 }} />
                        </svg>
                      </div>
                      <p className="text-gray-500">Loading problems…</p>
                    </motion.div>
                  ) : isError ? (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center text-sm text-red-600">
                      {error?.message || "Failed to load questions"}
                    </motion.div>
                  ) : filtered.length === 0 ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-10 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No problems found.</p>
                    </motion.div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filtered.map((q, idx) => (
                        <ProblemItem
                          key={q._id}
                          problem={q}
                          index={idx + 1}
                          isHovered={hoveredProblem === q._id}
                          onHover={() => setHoveredProblem(q._id)}
                          onLeave={() => setHoveredProblem(null)}
                          onClick={() => navigate(`/dsa/submit/${q._id}`)}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------------- small subcomponents ---------------- */

function MiniStat({ label, value, color = "blue" }) {
  const colorMap = {
    blue: "from-blue-400 to-blue-600",
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-400 to-amber-600",
    rose: "from-rose-400 to-rose-600",
  };
  return (
    <div className="flex flex-col items-start px-3 py-1 rounded-md bg-white/10">
      <span className="text-xs text-white/90">{label}</span>
      <div className={`text-sm font-bold mt-0.5 bg-clip-text text-transparent bg-gradient-to-r ${colorMap[color]}`}>
        {value}
      </div>
    </div>
  );
}

function ProblemItem({ problem, index, isHovered, onHover, onLeave, onClick }) {
  const diff = getDifficultyColor(problem.difficulty);
  const company = (problem.companyTags || []).slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.12 }}
      whileHover={{ x: 6 }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className="group border-b border-gray-100 last:border-0 cursor-pointer relative overflow-hidden"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    >
      <div
        className="absolute inset-y-0 left-0 w-1 transition-all duration-200"
        style={{
          background: isHovered ? GRADIENT : "transparent",
          opacity: isHovered ? 1 : 0,
        }}
      />

      <div className="p-3 pl-5 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-200">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-sm"
               style={{ background: `linear-gradient(180deg, ${PRIMARY}, ${SECONDARY})` }}>
            {index}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <h3 className="font-semibold text-gray-900 truncate group-hover:text-slate-700 transition-colors">
                {problem.title}
              </h3>

              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${diff.bg} ${diff.text} ${diff.border} ml-1`}>
                {problem.difficulty ?? "unknown"}
              </span>
            </div>

            {problem.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{problem.description}</p>}

            <div className="flex items-center gap-2 mt-2">
              {(problem.tags || []).slice(0, 3).map((t, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs">{t}</span>
              ))}

              {company.length > 0 && (
                <div className="ml-2 flex items-center gap-1">
                  {company.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium border border-indigo-100">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ChevronRight className={`w-5 h-5 transition-all duration-200 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} style={{ color: PRIMARY }} />
        </div>
      </div>
    </motion.div>
  );
}
