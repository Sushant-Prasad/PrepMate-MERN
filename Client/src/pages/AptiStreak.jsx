import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAptitudeAnswer } from "@/services/aptitudeSubmitServices";
import { X } from "lucide-react";

/* Fetch today's daily aptitude document */
const fetchTodayDailyApti = async () => {
  const base = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const { data } = await axios.get(`${base}/daily-aptitude`, { withCredentials: true });
  return data;
};

export default function AptiStreak() {
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverCorrect, setServerCorrect] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [startTs, setStartTs] = useState(Date.now());
  const [serverMessage, setServerMessage] = useState(null);
  const [streakInfo, setStreakInfo] = useState(null);

  const [showStreakCard, setShowStreakCard] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["daily-aptitude", "today"],
    queryFn: fetchTodayDailyApti,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // `data` might be the doc or wrapped like { data: doc }
  const dailyDoc = data?.data ?? data ?? null;
  const question = dailyDoc?.questionId ?? dailyDoc?.question ?? null;

  // Reset local state when question changes
  useEffect(() => {
    setStartTs(Date.now());
    setChoice(null);
    setSubmitted(false);
    setServerCorrect(null);
    setShowSolution(false);
    setServerMessage(null);
    setStreakInfo(null);
    setShowStreakCard(false);
  }, [question && String(question?._id ?? question?.id ?? question)]);

  // safe transform of options into [{key, value}]
  const opts = question ? toPlainOptions(question.options) : [];

  // Defensive submit: handle unexpected shapes & network errors gracefully
  const handleSubmit = async () => {
    if (!choice || submitting || !question) return;
    const elapsed = Math.max(0, Math.round((Date.now() - startTs) / 1000));
    setTimeTaken(elapsed);

    setSubmitting(true);
    setSubmitted(true);
    setServerCorrect(null);
    setServerMessage(null);

    try {
      const payload = {
        questionId: question._id ?? question.id ?? question, // support different shapes
        selectedOption: choice,
        mode: "streak",
        timeTaken: elapsed,
      };

      // call service (may throw)
      const res = await submitAptitudeAnswer(payload);

      // normalize response safely
      const normalized = (res && (res.data ?? res)) ?? {};
      const isCorrect =
        Boolean(normalized.isCorrect) ||
        Boolean(normalized.submission?.isCorrect) ||
        Boolean(normalized.data?.isCorrect);

      setServerCorrect(isCorrect);

      const message = normalized.message ?? normalized.data?.message ?? normalized.error ?? null;
      if (message) setServerMessage(String(message));

      const streak = normalized.streak ?? normalized.submission?.streak ?? normalized.data?.streak ?? null;
      if (streak) setStreakInfo(streak);

      // show streak card when correct
      if (isCorrect) {
        setShowStreakCard(true);
        // auto-hide after 4 seconds
        setTimeout(() => setShowStreakCard(false), 4000);
      }

      // If server returned something that suggests refresh is needed (e.g. new daily assigned),
      // attempt to refetch.
      if (normalized?.refresh === true) {
        try { refetch(); } catch (e) { /* ignore */ }
      }
    } catch (err) {
      // log full error to console for easier debugging
      console.error("Streak submission error (AptiStreak):", err);
      const msg = extractErrorMessage(err) || "Submission failed";
      setServerMessage(msg);
      // keep submitted true so UI shows attempt, but clear serverCorrect because unknown
      setServerCorrect(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleShowSolution = () => setShowSolution(true);
  const handleTryAgain = () => {
    setChoice(null);
    setSubmitted(false);
    setServerCorrect(null);
    setShowSolution(false);
    setServerMessage(null);
    setStreakInfo(null);
    setStartTs(Date.now());
    setShowStreakCard(false);
  };

  // derive current streak number to show
  const currentStreakNumber = (() => {
    if (!streakInfo) return null;
    
    if (typeof streakInfo === "number") return streakInfo;
    if (typeof streakInfo === "object" && (streakInfo.currentStreak ?? streakInfo.current ?? streakInfo.value)) {
      return streakInfo.currentStreak ?? streakInfo.current ?? streakInfo.value;
    }
    return null;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Daily Aptitude — Streak</h1>
          <p className="text-sm text-gray-600 mt-2">Solve the daily challenge and keep your streak alive.</p>
        </motion.div>

        <Card className="shadow-lg relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">Today's Question</span>
                <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Loading today's question…</div>
            ) : isError ? (
              <div className="p-6 text-center text-red-600">Failed to load daily question. Please try again or check authentication.</div>
            ) : !question ? (
              <div className="p-6 text-center text-gray-600">No daily aptitude question has been assigned yet.</div>
            ) : (
              <div>
                <div className="mb-4">
                  <h2 className="text-base font-semibold text-gray-900">{question.statement}</h2>
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-3">
                    {question.category && <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">{question.category}</span>}
                    {question.subCategory && <span className="px-2 py-1 rounded bg-gray-50 text-gray-600 text-xs">{question.subCategory}</span>}
                    {question.expectedTime && <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs">⏱ {question.expectedTime}s</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  <RadioGroup value={choice} onValueChange={(v) => !submitted && setChoice(v)} className="space-y-3">
                    {opts.length === 0 ? (
                      <div className="text-sm text-gray-500">No options available for this question.</div>
                    ) : (
                      opts.map(({ key, value }, idx) => {
                        // coerce key to string for safety
                        const keyStr = String(key ?? idx);
                        const isSelected = choice === keyStr;
                        const isCorrectLocal = String(keyStr) === String(question.answer);
                        let labelClasses = "block w-full rounded-md px-3 py-2 border transition-colors text-sm";

                        if (submitted && serverCorrect !== null) {
                          if (serverCorrect) {
                            if (isSelected && isCorrectLocal) labelClasses += " bg-green-50 border-green-300 text-green-800";
                            else labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                          } else {
                            if (isSelected) labelClasses += " bg-red-50 border-red-300 text-red-800";
                            else labelClasses += " bg-gray-50 border-gray-200 text-gray-600";
                          }
                        } else if (submitted && serverCorrect === null) {
                          labelClasses += isSelected ? " bg-gray-50 border-gray-200" : " bg-white border-gray-200";
                        } else {
                          labelClasses += " bg-white border-gray-200 hover:bg-indigo-50";
                        }

                        if (showSolution && isCorrectLocal) {
                          labelClasses = "block w-full rounded-md px-3 py-2 border bg-green-50 border-green-300 text-green-800";
                        }

                        // ensure each RadioGroupItem has a stable value and id
                        const itemId = `daily-${String(question._id ?? question?.id ?? "unknown")}-${keyStr}`;

                        return (
                          <div key={itemId} className="flex items-start space-x-3">
                            <RadioGroupItem
                              id={itemId}
                              value={keyStr}
                              className="mt-1 shrink-0"
                              disabled={submitted || submitting}
                            />
                            <Label htmlFor={itemId} className={labelClasses}>
                              <span className="font-semibold text-indigo-600 mr-3">{keyStr}.</span>
                              <span>{String(value)}</span>
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </RadioGroup>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {!submitted ? (
                      <Button onClick={handleSubmit} disabled={!choice || submitting}>
                        {submitting ? "Submitting…" : "Submit"}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleShowSolution} disabled={showSolution}>{showSolution ? "Solution Shown" : "Show Solution"}</Button>
                        <Button variant="ghost" onClick={handleTryAgain} disabled={submitting}>Try Again</Button>
                      </>
                    )}
                  </div>

                  <div className="text-sm" role="status" aria-live="polite">
                    {submitted && serverCorrect !== null && (serverCorrect ? <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full">✅ Correct</span> : <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-full">❌ Incorrect</span>)}
                    {submitted && serverCorrect === null && submitting && <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">⏳ Checking…</span>}
                    {serverMessage && <div className="mt-2 text-xs text-gray-600">{serverMessage}</div>}
                  </div>
                </div>

                {showSolution && question.solution && (
                  <div className="mt-4 p-3 rounded bg-indigo-50 border border-indigo-200">
                    <div className="font-semibold text-indigo-800 mb-1">Solution — Answer: {String(question.answer)}</div>
                    <div className="text-sm text-gray-800">{question.solution}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* STREAK POP-UP (centered, large, black) */}
          {showStreakCard && (
            <motion.div
              key="streak-card-centered"
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.28 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
              aria-live="polite"
              role="dialog"
              aria-label="Streak notification"
            >
              {/* center card is pointer-events-auto so the inner controls work */}
              <div className="pointer-events-auto">
                <div className="w-96 max-w-[92vw] p-6 rounded-2xl shadow-2xl bg-slate-500 text-white border border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm opacity-80">Current Streak</div>
                      <div className="mt-2 text-center text-6xl font-extrabold leading-tight tracking-tight">
                        {currentStreakNumber !== null ? String(currentStreakNumber) : "🔥"}
                      </div>
                      <div className="mt-2 text-center text-sm opacity-80">Keep it going — great job!</div>
                    </div>

                    <button
                      onClick={() => setShowStreakCard(false)}
                      aria-label="Close streak notification"
                      className="ml-4 mt-1 rounded-full p-2 bg-white/6 hover:bg-white/10 text-white focus:outline-none"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* -------------------- helpers -------------------- */
function toPlainOptions(options) {
  if (!options) return [];
  // If options is an array of { key, value } already, return as-is
  if (Array.isArray(options) && options.length > 0 && options[0].hasOwnProperty("key")) {
    return options.map(({ key, value }) => ({ key, value }));
  }
  if (options instanceof Map) {
    return Array.from(options.entries()).map(([k, v]) => ({ key: k, value: v }));
  }
  if (Array.isArray(options)) {
    // array of values; convert to A, B, C...
    return options.map((v, i) => ({ key: String.fromCharCode(65 + i), value: v }));
  }
  // object like { A: "opt1", B: "opt2" }
  return Object.entries(options).map(([k, v]) => ({ key: k, value: v }));
}

function extractErrorMessage(err) {
  try {
    if (!err) return null;
    if (typeof err === "string") return err;
    if (err.response?.data?.message) return String(err.response.data.message);
    if (err.response?.data) return JSON.stringify(err.response.data);
    if (err.message) return String(err.message);
    return String(err);
  } catch (e) {
    return null;
  }
}
