import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDSAQuestions, useDSAByCompanyTag } from "../services/DSAServices";
import { useAptiQuestions } from "../services/aptitudeServices";
import { submitAptitudeAnswer } from "../services/aptitudeSubmitServices";
import { Search, Building2, Code, Brain, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-green-600 bg-green-50 border-green-200";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "hard":
      return "text-red-600 bg-red-50 border-red-200";
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
      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer border-l-4 border-transparent hover:border-l-indigo-400 transition"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xs text-gray-400 font-mono w-6">{index}</span>
        <h3 className="text-sm font-medium text-gray-900 truncate hover:text-indigo-600">
          {q.title}
        </h3>
      </div>
      <Badge
        variant="outline"
        className={`capitalize text-xs ml-3 ${getDifficultyColor(q.difficulty)}`}
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
      // revert to allow retry
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-2">{question.statement}</h4>

          <div className="space-y-2">
            <RadioGroup
              value={choice}
              onValueChange={(v) => !submitted && setChoice(v)}
              className="space-y-2"
            >
              {opts.map(({ key, value }) => {
                const isSelected = choice === key;
                const isCorrectLocal = key === question.answer;
                let labelClasses =
                  "block w-full rounded-md px-3 py-2 border transition-all duration-150 text-sm";
                if (submitted && serverCorrect !== null) {
                  if (serverCorrect) {
                    if (isSelected && isCorrectLocal) labelClasses += " bg-green-50 border-green-300 text-green-800";
                    else labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                  } else {
                    if (isSelected) labelClasses += " bg-red-50 border-red-300 text-red-800";
                    else labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                  }
                } else if (submitted && serverCorrect === null) {
                  if (isSelected) labelClasses += " bg-gray-50 border-gray-200";
                  else labelClasses += " bg-white border-gray-200";
                } else {
                  labelClasses += " bg-white border-gray-200 hover:bg-indigo-50";
                }

                if (showSolution && isCorrectLocal) {
                  labelClasses = "block w-full rounded-md px-3 py-2 border bg-green-50 border-green-300 text-green-800";
                }

                return (
                  <div key={key} className="flex items-start space-x-3">
                    <RadioGroupItem
                      id={`${question._id}-${key}`}
                      value={key}
                      className="mt-1 shrink-0"
                      disabled={submitted || submitting}
                    />
                    <Label htmlFor={`${question._id}-${key}`} className={labelClasses}>
                      <span className="font-semibold text-indigo-600 mr-3">{key}.</span>
                      <span>{value}</span>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>
        </div>

        {/* meta column moves under options on small screens; kept for spacing on larger screens */}
        <div className="mt-3 md:mt-0 md:ml-4 md:w-44 flex flex-col items-start md:items-end space-y-2">
          {question.expectedTime && (
            <div className="text-xs text-gray-500">⏱ {question.expectedTime}s</div>
          )}
          {question.category && (
            <div className="text-xs text-gray-500">{question.category}</div>
          )}
        </div>
      </div>

      {/* Buttons row placed BELOW the options */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!submitted ? (
            <Button
              onClick={onSubmit}
              disabled={!choice || submitting}
              className="rounded-md px-3 py-1"
            >
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onCheckSolution}
                disabled={showSolution}
                className="rounded-md px-3 py-1"
              >
                {showSolution ? "Solution Shown" : "Check"}
              </Button>
              <Button
                variant="ghost"
                onClick={onTryAgain}
                disabled={submitting}
                className="rounded-md px-3 py-1"
              >
                Try again
              </Button>
            </>
          )}
        </div>

        {/* status pill to the right */}
        <div className="ml-auto text-sm" role="status" aria-live="polite">
          {submitted && serverCorrect !== null && (
            serverCorrect ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                ✅ Correct
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                ❌ Incorrect
              </span>
            )
          )}

          {submitted && serverCorrect === null && submitting && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              ⏳ Checking…
            </span>
          )}
        </div>
      </div>

      {showSolution && question.solution && (
        <div className="mt-3 p-3 rounded-md bg-indigo-50 border border-indigo-200 text-sm text-gray-800">
          <div className="font-semibold text-indigo-800 mb-1">Solution — Answer: {question.answer}</div>
          <div>{question.solution}</div>
        </div>
      )}
    </div>
  );
}


  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-80 bg-white shadow-sm border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Company Prep</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-gray-500">Loading companies...</p>
          ) : (
            <div className="p-2">
              {companies.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCompany(c);
                    setActiveTab("DSA");
                    setOpenSubcats({}); // reset open subcats
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-gray-50 ${
                    selectedCompany === c ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span className="truncate">{c}</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedCompany && (
          <div className="bg-white border-b px-6 py-3 flex space-x-6">
            <button
              onClick={() => setActiveTab("DSA")}
              className={`flex items-center px-3 py-1 rounded ${activeTab === "DSA" ? "bg-blue-100 text-blue-700" : "text-gray-500"}`}
            >
              <Code className="w-4 h-4 mr-1" /> DSA
            </button>
            <button
              onClick={() => setActiveTab("Aptitude")}
              className={`flex items-center px-3 py-1 rounded ${activeTab === "Aptitude" ? "bg-green-100 text-green-700" : "text-gray-500"}`}
            >
              <Brain className="w-4 h-4 mr-1" /> Aptitude
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {!selectedCompany ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a company from the left
            </div>
          ) : isCompanyDataLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activeTab === "DSA" ? (
            // DSA list
            <div className="shadow-sm rounded-md bg-white divide-y divide-gray-100">
              {(companyDSAQuestionsData?.data ?? []).length === 0 ? (
                <div className="p-6 text-center text-gray-500">No DSA questions for {selectedCompany}</div>
              ) : (
                (companyDSAQuestionsData?.data ?? []).map((q, idx) => (
                  <ProblemListItem key={q._id} q={q} index={idx + 1} onClick={() => navigate(`/dsa/submit/${q._id}`)} />
                ))
              )}
            </div>
          ) : (
            // Aptitude: collapsible subcategories, each revealing questions with options
            <div>
              {aptitudeBySub.length === 0 ? (
                <div className="text-center text-gray-500 p-6">No aptitude questions for {selectedCompany}</div>
              ) : (
                aptitudeBySub.map(({ sub, items }) => {
                  const open = !!openSubcats[sub];
                  return (
                    <div key={sub} className="mb-4">
                      <button
                        onClick={() => toggleSub(sub)}
                        className="w-full flex items-center justify-between bg-white p-3 rounded-md border hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold">{sub}</span>
                          <span className="text-xs text-gray-500">{items.length} question{items.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">{selectedCompany}</Badge>
                          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {open && (
                        <div className="mt-3 space-y-3">
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
  // options is a Map-like object or plain object
  if (options instanceof Map) {
    return Array.from(options.entries()).map(([k, v]) => ({ key: k, value: v }));
  }
  return Object.entries(options).map(([k, v]) => ({ key: k, value: v }));
}
