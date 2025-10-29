// src/pages/Aptitude.jsx
import { useEffect, useMemo, useState } from "react";
import { useAptiQuestions } from "@/services/aptitudeServices";
import { submitAptitudeAnswer } from "@/services/aptitudeSubmitServices";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["Numerical Ability", "Reasoning", "Verbal Ability"];

// Abbreviated versions for very small screens
const getCategoryDisplay = (cat, isSmall = false) => {
  if (!isSmall) return cat;
  const abbreviations = {
    "Numerical Ability": "Numerical",
    Reasoning: "Reasoning",
    "Verbal Ability": "Verbal",
  };
  return abbreviations[cat] || cat;
};

export default function Aptitude() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedSub, setSelectedSub] = useState(null);

  // Fetch all questions of the selected category (we'll derive subcategories from this)
  const { data, isLoading, isError } = useAptiQuestions(
    { category: selectedCategory },
    { keepPreviousData: true }
  );

  const questions = data?.data || [];

  // Unique subCategories
  const subCategories = useMemo(() => {
    const set = new Set(questions.map((q) => q.subCategory).filter(Boolean));
    return Array.from(set).sort();
  }, [questions]);

  // Auto-select first subcategory when category changes or data loads
  useEffect(() => {
    if (!selectedSub && subCategories.length > 0) setSelectedSub(subCategories[0]);
  }, [selectedSub, subCategories]);

  // Questions of the selected subCategory
  const filteredQuestions = useMemo(() => {
    if (!selectedSub) return [];
    return questions.filter((q) => q.subCategory === selectedSub);
  }, [questions, selectedSub]);

  // Reset subCategory when category changes
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSub(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f7feff] to-[#f1f7ff]">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Responsive Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[280px_1fr_320px] lg:gap-8 lg:items-start">
          {/* Mobile/Tablet: Categories as horizontal scroll */}
          <div className="lg:hidden">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                  <CardTitle className="text-lg font-semibold">Categories</CardTitle>
                </CardHeader>
                <ScrollArea className="w-full">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex gap-3 min-w-max pb-2">
                      {CATEGORIES.map((cat) => (
                        <Button
                          key={cat}
                          variant={selectedCategory === cat ? "default" : "outline"}
                          onClick={() => handleSelectCategory(cat)}
                          className={`shrink-0 whitespace-nowrap text-xs sm:text-sm px-3 sm:px-4 py-2.5 h-auto min-w-0 rounded-full font-medium transition-all duration-200 ${
                            selectedCategory === cat
                              ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                              : "border border-gray-100"
                          }`}
                        >
                          <span className="block sm:hidden">{getCategoryDisplay(cat, true)}</span>
                          <span className="hidden sm:block">{getCategoryDisplay(cat, false)}</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>
          </div>

          {/* Mobile/Tablet: Enhanced Subcategories */}
          <div className="lg:hidden">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Subcategories
                    {selectedSub && (
                      <Badge className="font-medium text-brand-primary bg-white/10 border border-brand-primary/20">
                        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <ScrollArea className="max-h-[45vh]">
                  <CardContent className="pt-4">
                    {isLoading ? (
                      <div className="text-sm text-gray-500 text-center py-4">Loading subcategories...</div>
                    ) : subCategories.length === 0 ? (
                      <div className="text-sm text-gray-500 text-center py-4">No subcategories available.</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {subCategories.map((sub) => (
                          <Button
                            key={sub}
                            variant={selectedSub === sub ? "default" : "outline"}
                            className={`justify-start text-left h-auto py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                              selectedSub === sub
                                ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                                : "border border-brand-primary/20"
                            }`}
                            onClick={() => setSelectedSub(sub)}
                          >
                            <span className="truncate text-sm">{sub}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>
            </motion.div>
          </div>

          {/* Desktop: Enhanced LEFT Categories */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="hidden lg:block">
            <Card className="lg:sticky lg:top-6 overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                <CardTitle className="text-xl font-semibold">Categories</CardTitle>
              </CardHeader>
              <ScrollArea className="h-[75vh]">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3 pr-2">
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat}
                        onClick={() => handleSelectCategory(cat)}
                        className={`justify-start py-4 px-4 text-left rounded-lg font-medium transition-all duration-200 ${
                          selectedCategory === cat
                            ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-xl"
                            : "border border-brand-primary/20"
                        }`}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </motion.div>

          {/* CENTER: Enhanced Questions list */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="min-h-0">
            <Card className="shadow-xl overflow-hidden border-0 bg-white/95 backdrop-blur-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gradient-to-r from-white to-white border-b">
                <CardTitle className="text-lg sm:text-xl font-semibold">
                  {selectedSub ? (
                    <>
                      <span className="hidden sm:inline text-gray-500">
                        {selectedCategory} <span className="text-gray-400 mx-2">/</span>
                      </span>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
                        {selectedSub}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="hidden lg:inline text-gray-500">Select a subcategory to start practicing</span>
                      <span className="lg:hidden text-gray-500">Select a subcategory above to start</span>
                    </>
                  )}
                </CardTitle>
                {selectedSub && (
                  <Badge className="hidden sm:inline-flex font-medium text-brand-primary bg-white/10 border border-brand-primary/20">
                    {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""} available
                  </Badge>
                )}
              </CardHeader>

              <ScrollArea className="h-[65vh] sm:h-[70vh] lg:h-[calc(100vh-180px)]">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4" />
                      <p className="text-gray-500">Loading questions...</p>
                    </div>
                  ) : isError ? (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">⚠️</span>
                      </div>
                      <p className="text-red-600 font-medium">Failed to load questions. Please try again.</p>
                    </div>
                  ) : !selectedSub ? (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-indigo-500 text-2xl">📚</span>
                      </div>
                      <p className="text-gray-500">
                        <span className="hidden lg:inline">Select a subcategory to view its questions.</span>
                        <span className="lg:hidden">Select a subcategory above to view its questions.</span>
                      </p>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="p-6 sm:p-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">📝</span>
                      </div>
                      <p className="text-gray-500">No questions found for this subcategory.</p>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                      {filteredQuestions.map((q, idx) => (
                        <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                          <QuestionCard question={q} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </motion.div>

          {/* Desktop: Enhanced RIGHT Subcategories (Non-collapsible) */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="hidden lg:block">
            <Card className="lg:sticky lg:top-6 overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                <CardTitle className="text-xl font-semibold">Subcategories</CardTitle>
              </CardHeader>
              <ScrollArea className="h-[75vh]">
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  ) : subCategories.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No subcategories available.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 pr-2">
                      {groupByFirstLetter(subCategories).map(({ letter, items }) => (
                        <div key={letter} className="space-y-2">
                          <h3 className="text-sm font-semibold text-gray-700 px-2 py-1 bg-gray-50 rounded-md">{letter}</h3>
                          <div className="space-y-2 ml-2">
                            {items.map((sub) => (
                              <Button
                                key={sub}
                                className={`w-full justify-start text-left py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                                  selectedSub === sub
                                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg"
                                    : "border border-brand-primary/20"
                                }`}
                                onClick={() => setSelectedSub(sub)}
                              >
                                <span className="truncate text-sm">{sub}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Helpers & Subcomponents ---------------------- */

function groupByFirstLetter(list) {
  const map = new Map();
  for (const item of list) {
    const letter = item?.[0]?.toUpperCase() || "#";
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(item);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, items]) => ({
      letter,
      items: items.sort((a, b) => a.localeCompare(b)),
    }));
}

function QuestionCard({ question, mode = "practice" }) {
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // server state + loading & timing
  const [submitting, setSubmitting] = useState(false);
  const [serverCorrect, setServerCorrect] = useState(null); // null = not answered / waiting, true/false = server result
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // reset whenever question changes
    setChoice(null);
    setSubmitted(false);
    setShowSolution(false);
    setSubmitting(false);
    setServerCorrect(null);
    setStartTime(Date.now());
  }, [question._id]);

  const opts = toPlainOptions(question.options);

  const handleSubmit = async () => {
    if (!choice || submitting) return;

    const timeTaken = Math.max(0, Math.round((Date.now() - startTime) / 1000));

    // immediate UI changes (disable inputs)
    setSubmitting(true);
    setSubmitted(true);
    setServerCorrect(null); // show waiting state until response

    try {
      const payload = {
        questionId: question._id,
        selectedOption: choice,
        mode, // "practice" or "streak"
        timeTaken,
      };

      const data = await submitAptitudeAnswer(payload);
      // backend might return { isCorrect } or { submission: { isCorrect } }
      const isCorrect = !!(data?.isCorrect || data?.submission?.isCorrect);
      setServerCorrect(isCorrect);

      if (data?.streak) {
        console.info("New streak:", data.streak);
      }
    } catch (err) {
      console.error("Submission error", err);
      setSubmitted(false);
      setServerCorrect(null);
      alert(err?.message || "Submission failed. See console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckSolution = () => setShowSolution(true);

  const handleResubmit = () => {
    setChoice(null);
    setSubmitted(false);
    setShowSolution(false);
    setServerCorrect(null);
    setSubmitting(false);
    setStartTime(Date.now());
  };

  return (
    <Card className="border-0 rounded-2xl shadow-lg bg-white/95 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base sm:text-lg leading-relaxed text-gray-800">
          {question.statement}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="font-medium text-[var(--brand-primary)] bg-white/10 border border-[var(--brand-primary)]/20">
              {question.category}
            </Badge>
            <Badge className="font-medium text-[var(--brand-secondary)] bg-white/10 border border-[var(--brand-secondary)]/20">
              {question.subCategory}
            </Badge>
            {question.expectedTime && (
              <Badge className="font-medium bg-[#fff6ea] text-[#b45309] border border-[#fde3b9]">
                ⏱️ {question.expectedTime}s
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <RadioGroup value={choice} onValueChange={(v) => !submitted && setChoice(v)} className="space-y-3">
          {opts.map(({ key, value }) => {
            const isSelected = choice === key;
            const isCorrectLocal = key === question.answer;

            let labelClasses =
              "cursor-pointer text-sm sm:text-base leading-relaxed block w-full rounded-xl px-4 py-3 transition-all duration-200 border-2";
            let containerExtra = "flex items-start space-x-3";

            if (submitted && serverCorrect !== null) {
              if (serverCorrect) {
                if (isSelected && isCorrectLocal) {
                  labelClasses += " bg-green-50 border-green-300 text-green-800 shadow-md";
                } else {
                  labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                }
              } else {
                if (isSelected) {
                  labelClasses += " bg-red-50 border-red-300 text-red-800 shadow-md";
                } else {
                  labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                }
              }
            } else if (submitted && serverCorrect === null) {
              if (isSelected) {
                labelClasses += " bg-gray-50 border-gray-200 text-gray-700";
              } else {
                labelClasses += " bg-white border-gray-200 text-gray-600";
              }
            } else {
              labelClasses += " bg-white border-gray-200 hover:shadow-md";
            }

            if (showSolution && isCorrectLocal) {
              labelClasses =
                "cursor-pointer text-sm sm:text-base leading-relaxed block w-full rounded-xl px-4 py-3 transition-all duration-200 border-2 bg-green-50 border-green-300 text-green-800 shadow-md";
            }

            return (
              <div key={key} className={containerExtra}>
                <RadioGroupItem id={`${question._id}-${key}`} value={key} className="mt-1 shrink-0" disabled={submitted || submitting} />
                <Label htmlFor={`${question._id}-${key}`} className={labelClasses}>
                  <span className="font-semibold text-brand-primary mr-3">{key}.</span>
                  <span>{value}</span>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          {!submitted ? (
            <Button
              className="rounded-xl px-6 py-2.5 transition-all duration-200 shadow-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
              onClick={handleSubmit}
              disabled={!choice || submitting}
            >
              {submitting ? "Submitting…" : "Submit Answer"}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="rounded-xl px-6 py-2.5 border-2 hover:bg-gray-50 transition-all duration-200"
                onClick={handleCheckSolution}
                disabled={showSolution}
              >
                {showSolution ? "Solution Shown" : "Check Solution"}
              </Button>
              <Button
                variant="ghost"
                className="rounded-xl px-6 py-2.5 text-gray-600 hover:bg-gray-100 transition-all duration-200"
                onClick={handleResubmit}
                disabled={submitting}
              >
                Try Again
              </Button>
            </>
          )}

          <div className="ml-2" role="status" aria-live="polite">
            {submitted && serverCorrect !== null && (serverCorrect ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">✅ Correct!</span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-sm font-medium">❌ Incorrect</span>
            ))}

            {submitted && serverCorrect === null && submitting && (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">⏳ Checking...</span>
            )}
          </div>
        </div>

        {showSolution && question.solution && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 rounded-xl border bg-[#f0fbff] border-brand-primary/20"
          >
            <div className="text-sm sm:text-base text-gray-700">
              <div className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                💡 Solution:
                <Badge className="font-medium text-brand-primary bg-white/10 border border-brand-primary/20">
                  Answer: {question.answer}
                </Badge>
              </div>
              <p className="text-gray-700 leading-relaxed">{question.solution}</p>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function toPlainOptions(options) {
  if (!options) return [];
  return Object.entries(options).map(([key, value]) => ({ key, value }));
}
