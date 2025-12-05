import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDSAQuestions, useDSAByCompanyTag } from "../services/DSAServices";
import { useAptiQuestions } from "../services/aptitudeServices";
import { submitAptitudeAnswer } from "../services/aptitudeSubmitServices";
import { Search, Building2, Code, Brain, ChevronRight, ChevronDown, ChevronUp, Trophy, Target, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "medium":
      return "text-amber-700 bg-amber-50 border-amber-200";
    case "hard":
      return "text-rose-700 bg-rose-50 border-rose-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export default function CompanyPrep() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [activeTab, setActiveTab] = useState("DSA");
  const [searchQuery, setSearchQuery] = useState("");
  const [openSubcats, setOpenSubcats] = useState({});

  // Fetch all questions to extract unique companies
  const { data: allDSAQuestionsData, isLoading: dsaLoading } = useDSAQuestions();
  const { data: allAptitudeQuestionsData, isLoading: aptitudeLoading } = useAptiQuestions();

  // Fetch company-specific questions
  const { data: companyDSAQuestionsData, isLoading: companyDSALoading } =
    useDSAByCompanyTag(selectedCompany, { enabled: !!selectedCompany });

  const { data: companyAptitudeQuestionsData, isLoading: companyAptitudeLoading } =
    useAptiQuestions({ company: selectedCompany }, { enabled: !!selectedCompany });

  // Collect companies from both datasets
  const companies = useMemo(() => {
    const companySet = new Set();
    const dsaList = allDSAQuestionsData?.data ?? [];
    for (const q of dsaList) {
      if (Array.isArray(q.companyTags)) q.companyTags.forEach((t) => t && companySet.add(t));
    }
    const aptList = allAptitudeQuestionsData?.data ?? [];
    for (const q of aptList) {
      if (Array.isArray(q.companyTags)) q.companyTags.forEach((t) => t && companySet.add(t));
      else if (q.company) companySet.add(q.company);
    }
    return Array.from(companySet)
      .filter((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort();
  }, [allDSAQuestionsData, allAptitudeQuestionsData, searchQuery]);

  const isLoading = dsaLoading || aptitudeLoading;
  const isCompanyDataLoading = companyDSALoading || companyAptitudeLoading;

  /*------------- Helpers for Aptitude Subcategories -----------*/
  const aptitudeQuestionsAll = companyAptitudeQuestionsData?.data ?? [];

  // group aptitude questions by subCategory
  const aptitudeBySub = useMemo(() => {
    const map = new Map();
    for (const q of aptitudeQuestionsAll) {
      const key = q.subCategory || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(q);
    }
    return Array.from(map.entries()).map(([sub, items]) => ({
      sub,
      items,
    }));
  }, [aptitudeQuestionsAll]);

  const toggleSub = (sub) => {
    setOpenSubcats((s) => ({ ...s, [sub]: !s[sub] }));
  };

  /********* Rendering components *********/
  const ProblemListItem = ({ q, index, onClick }) => (
    <div
      className="group flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent cursor-pointer border-l-4 border-transparent hover:border-l-[#36B9D0] transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#36B9D0] to-cyan-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
          {index}
        </div>
        <h3 className="text-sm font-semibold text-[#001845] truncate group-hover:text-[#36B9D0] transition-colors">
          {q.title}
        </h3>
      </div>
      <Badge
        variant="outline"
        className={`capitalize text-xs font-semibold ml-3 px-3 py-1 ${getDifficultyColor(q.difficulty)}`}
      >
        {q.difficulty || "unknown"}
      </Badge>
    </div>
  );

  // small aptitude question row with options & submission
  function AptitudeQuestionRow({ question }) {
    // local states per question
    const [choice, setChoice] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [serverCorrect, setServerCorrect] = useState(null);
    const [startTime] = useState(Date.now());

    const opts = toPlainOptions(question.options);

    const onSubmit = async () => {
      if (!choice || submitting) return;
      const timeTaken = Math.max(0, Math.round((Date.now() - startTime) / 1000));
      setSubmitting(true);
      setSubmitted(true);
      setServerCorrect(null);
      try {
        const payload = {
          questionId: question._id,
          selectedOption: choice,
          mode: "practice",
          timeTaken,
        };
        const res = await submitAptitudeAnswer(payload);
        const isCorrect = !!(res?.isCorrect || res?.submission?.isCorrect);
        setServerCorrect(isCorrect);
      } catch (err) {
        console.error("Aptitude submit error", err);
        setSubmitted(false);
        setServerCorrect(null);
        alert(err?.message || "Submission failed");
      } finally {
        setSubmitting(false);
      }
    };

    const onCheckSolution = () => setShowSolution(true);
    const onTryAgain = () => {
      setChoice(null);
      setSubmitted(false);
      setShowSolution(false);
      setServerCorrect(null);
    };

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#001845] to-[#36B9D0] text-white flex items-center justify-center text-xs font-bold">
                Q
              </div>
              <h4 className="font-semibold text-[#001845] text-base leading-relaxed">{question.statement}</h4>
            </div>

            <div className="space-y-3 ml-11">
              <RadioGroup
                value={choice}
                onValueChange={(v) => !submitted && setChoice(v)}
                className="space-y-3"
              >
                {opts.map(({ key, value }) => {
                  const isSelected = choice === key;
                  const isCorrectLocal = key === question.answer;
                  let labelClasses =
                    "block w-full rounded-lg px-4 py-3 border-2 transition-all duration-200 text-sm cursor-pointer";
                  
                  if (submitted && serverCorrect !== null) {
                    if (serverCorrect) {
                      if (isSelected && isCorrectLocal) labelClasses += " bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm";
                      else labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                    } else {
                      if (isSelected) labelClasses += " bg-rose-50 border-rose-400 text-rose-900 shadow-sm";
                      else labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                    }
                  } else if (submitted && serverCorrect === null) {
                    if (isSelected) labelClasses += " bg-gray-50 border-gray-300";
                    else labelClasses += " bg-white border-gray-200";
                  } else {
                    if (isSelected) labelClasses += " bg-cyan-50 border-[#36B9D0] shadow-sm";
                    else labelClasses += " bg-white border-gray-200 hover:bg-cyan-50/50 hover:border-[#36B9D0]/50";
                  }

                  if (showSolution && isCorrectLocal) {
                    labelClasses = "block w-full rounded-lg px-4 py-3 border-2 bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm";
                  }

                  return (
                    <div key={key} className="flex items-start space-x-3">
                      <RadioGroupItem
                        id={`${question._id}-${key}`}
                        value={key}
                        className="mt-1.5 shrink-0 border-2 data-[state=checked]:bg-[#36B9D0] data-[state=checked]:border-[#36B9D0]"
                        disabled={submitted || submitting}
                      />
                      <Label htmlFor={`${question._id}-${key}`} className={labelClasses}>
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#36B9D0] text-white text-xs font-bold mr-3">
                          {key}
                        </span>
                        <span className="font-medium">{value}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-6 md:w-48 flex flex-col items-start md:items-end space-y-2">
            {question.expectedTime && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                <Target className="w-3.5 h-3.5" />
                {question.expectedTime}s
              </div>
            )}
            {question.category && (
              <Badge variant="outline" className="text-xs font-medium border-[#36B9D0] text-[#36B9D0]">
                {question.category}
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-6 ml-11 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            {!submitted ? (
              <Button
                onClick={onSubmit}
                disabled={!choice || submitting}
                className="bg-gradient-to-r from-[#36B9D0] to-cyan-500 hover:from-[#36B9D0]/90 hover:to-cyan-500/90 text-white rounded-lg px-6 py-2 font-semibold shadow-sm"
              >
                {submitting ? "Submitting…" : "Submit Answer"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onCheckSolution}
                  disabled={showSolution}
                  className="border-[#001845] text-[#001845] hover:bg-[#001845] hover:text-white rounded-lg px-5 py-2 font-semibold"
                >
                  {showSolution ? "✓ Solution Shown" : "View Solution"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={onTryAgain}
                  disabled={submitting}
                  className="text-gray-600 hover:bg-gray-100 rounded-lg px-5 py-2 font-semibold"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>

          <div className="ml-auto text-sm" role="status" aria-live="polite">
            {submitted && serverCorrect !== null && (
              serverCorrect ? (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold shadow-sm">
                  <Trophy className="w-4 h-4" />
                  Correct!
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-800 rounded-full text-sm font-bold shadow-sm">
                  ❌ Incorrect
                </span>
              )
            )}

            {submitted && serverCorrect === null && submitting && (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#36B9D0] rounded-full animate-spin"></div>
                Checking…
              </span>
            )}
          </div>
        </div>

        {showSolution && question.solution && (
          <div className="mt-6 ml-11 p-5 rounded-xl bg-gradient-to-br from-[#001845] to-[#36B9D0] text-white shadow-md">
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <Sparkles className="w-5 h-5" />
              Solution
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-3">
              <div className="font-semibold mb-1">Correct Answer: {question.answer}</div>
            </div>
            <div className="leading-relaxed">{question.solution}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-[#001845] to-[#36B9D0]">
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Company Prep
          </h1>
          <p className="text-cyan-100 text-sm mb-4">Target your dream company</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-white/20 rounded-lg text-sm bg-white/10 backdrop-blur-sm text-white placeholder:text-cyan-200 focus:bg-white focus:text-gray-900 focus:border-[#36B9D0] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-[#36B9D0] rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-gray-500">Loading companies...</p>
            </div>
          ) : (
            <div className="p-3">
              {companies.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">No companies found</p>
              ) : (
                companies.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedCompany(c);
                      setActiveTab("DSA");
                      setOpenSubcats({});
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl mb-2 flex items-center justify-between transition-all duration-200 ${
                      selectedCompany === c
                        ? "bg-gradient-to-r from-[#36B9D0] to-cyan-500 text-white shadow-md transform scale-[1.02]"
                        : "text-gray-700 hover:bg-cyan-50 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedCompany === c ? "bg-white/20" : "bg-gray-100"}`}>
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="font-semibold truncate">{c}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedCompany && (
          <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold text-[#001845] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#36B9D0]" />
                {selectedCompany}
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveTab("DSA")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === "DSA"
                    ? "bg-gradient-to-r from-[#36B9D0] to-cyan-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Code className="w-4 h-4" />
                DSA Problems
              </button>
              <button
                onClick={() => setActiveTab("Aptitude")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === "Aptitude"
                    ? "bg-gradient-to-r from-[#001845] to-[#36B9D0] text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Brain className="w-4 h-4" />
                Aptitude Tests
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedCompany ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md">
                <div className="w-20 h-20 bg-gradient-to-br from-[#36B9D0] to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-[#001845] mb-3">Select a Company</h3>
                <p className="text-gray-600">Choose a company from the sidebar to view their DSA problems and aptitude questions</p>
              </div>
            </div>
          ) : isCompanyDataLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#36B9D0] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading questions...</p>
            </div>
          ) : activeTab === "DSA" ? (
            <div className="shadow-md rounded-2xl bg-white overflow-hidden divide-y divide-gray-100">
              {(companyDSAQuestionsData?.data ?? []).length === 0 ? (
                <div className="p-12 text-center">
                  <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No DSA questions available for {selectedCompany}</p>
                </div>
              ) : (
                (companyDSAQuestionsData?.data ?? []).map((q, idx) => (
                  <ProblemListItem key={q._id} q={q} index={idx + 1} onClick={() => navigate(`/dsa/submit/${q._id}`)} />
                ))
              )}
            </div>
          ) : (
            <div>
              {aptitudeBySub.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                  <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No aptitude questions available for {selectedCompany}</p>
                </div>
              ) : (
                aptitudeBySub.map(({ sub, items }) => {
                  const open = !!openSubcats[sub];
                  return (
                    <div key={sub} className="mb-5">
                      <button
                        onClick={() => toggleSub(sub)}
                        className="w-full flex items-center justify-between bg-white p-5 rounded-xl border-2 border-gray-200 hover:border-[#36B9D0] hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#001845] to-[#36B9D0] text-white flex items-center justify-center font-bold">
                            {items.length}
                          </div>
                          <div className="text-left">
                            <span className="text-base font-bold text-[#001845] block">{sub}</span>
                            <span className="text-xs text-gray-500">{items.length} question{items.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs font-semibold border-[#36B9D0] text-[#36B9D0] px-3 py-1">
                            {selectedCompany}
                          </Badge>
                          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                            {open ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
                          </div>
                        </div>
                      </button>

                      {open && (
                        <div className="mt-4 space-y-4">
                          {items.map((q) => (
                            <AptitudeQuestionRow key={q._id} question={q} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function toPlainOptions(options) {
  if (!options) return [];
  if (options instanceof Map) {
    return Array.from(options.entries()).map(([k, v]) => ({ key: k, value: v }));
  }
  return Object.entries(options).map(([k, v]) => ({ key: k, value: v }));
}