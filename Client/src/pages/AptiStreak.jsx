import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { submitAptitudeAnswer } from "@/services/aptitudeSubmitServices";
import { X, Flame, Clock, CheckCircle, XCircle, Zap } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#03c6f7c9] via-[#F5FCFF] to-[#7859dd] overflow-hidden">
      <div className="mx-auto max-w-4xl px-3 sm:px-4 py-4 sm:py-8 md:py-12">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6 sm:mb-8">
          <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap mb-2 sm:mb-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, var(--brand-secondary) 0%, color-mix(in srgb, var(--brand-primary) 70%, var(--brand-secondary)) 100%)" }}>
              Daily Aptitude Question
            </h1>
          </div>
          <p className="text-muted-foreground mt-3 sm:mt-4 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Test your reasoning. Build your daily streak. Master aptitude excellence.
          </p>
        </motion.div>

        <Card className="shadow-lg border border-border rounded-2xl bg-card text-card-foreground overflow-hidden">
          <CardHeader className="flex flex-col gap-3 text-white p-4 sm:p-6" style={{ backgroundImage: "linear-gradient(135deg, var(--brand-secondary) 0%, color-mix(in srgb, var(--brand-secondary) 80%, black) 100%)" }}>
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: "var(--brand-primary)" }} />
                  <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Today's Question</h2>
                </div>
                <p className="text-xs sm:text-sm text-white/80">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">Loading today's question…</div>
            ) : isError ? (
              <div className="p-6 text-center text-red-600 font-semibold">Failed to load daily question. Please try again or check authentication.</div>
            ) : !question ? (
              <div className="p-6 text-center text-muted-foreground font-medium">No daily aptitude question has been assigned yet.</div>
            ) : (
              <div>
                <div className="mb-6">
                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-3">{question.statement}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    {question.category && <span className="px-3 py-1.5 rounded-lg bg-muted text-foreground text-xs font-semibold">{question.category}</span>}
                    {question.subCategory && <span className="px-3 py-1.5 rounded-lg bg-muted/70 text-foreground/80 text-xs font-semibold">{question.subCategory}</span>}
                    {question.expectedTime && <span className="flex items-center gap-1 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 16%, white)", color: "var(--brand-secondary)" }}><Clock className="w-3.5 h-3.5" /> {question.expectedTime}s</span>}
                  </div>
                </div>

                <div className="space-y-3">
                  <RadioGroup value={choice} onValueChange={(v) => !submitted && setChoice(v)} className="space-y-3">
                    {opts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No options available for this question.</div>
                    ) : (
                      opts.map(({ key, value }, idx) => {
                        // coerce key to string for safety
                        const keyStr = String(key ?? idx);
                        const isSelected = choice === keyStr;
                        const isCorrectLocal = String(keyStr) === String(question.answer);
                        let labelClasses = "block w-full rounded-lg px-4 py-3 border-2 transition-all text-sm font-medium";

                        if (submitted && serverCorrect !== null) {
                          if (serverCorrect) {
                            if (isSelected && isCorrectLocal) labelClasses += " bg-emerald-50 border-emerald-400 text-emerald-900";
                            else labelClasses += " bg-muted/50 border-border text-foreground/70";
                          } else {
                            if (isSelected) labelClasses += " bg-red-50 border-red-400 text-red-900";
                            else labelClasses += " bg-muted/50 border-border text-foreground/70";
                          }
                        } else if (submitted && serverCorrect === null) {
                          labelClasses += isSelected ? " bg-muted/50 border-border" : " bg-white border-border";
                        } else {
                          labelClasses += isSelected ? " border-[color:var(--brand-primary)] bg-[color:color-mix(in srgb,var(--brand-primary)_16%,white)] text-foreground" : " bg-white border-border hover:border-[color:var(--brand-primary)] hover:bg-[color:color-mix(in srgb,var(--brand-primary)_8%,white)]";
                        }

                        if (showSolution && isCorrectLocal) {
                          labelClasses = "block w-full rounded-lg px-4 py-3 border-2 bg-emerald-50 border-emerald-400 text-emerald-900";
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
                              <span className="font-bold" style={{ color: "var(--brand-primary)" }}>{keyStr}.</span>
                              <span className="ml-2">{String(value)}</span>
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </RadioGroup>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {!submitted ? (
                      <Button onClick={handleSubmit} disabled={!choice || submitting} style={{ backgroundColor: "var(--brand-primary)", color: "var(--brand-secondary)" }} className="font-bold rounded-lg px-5 py-2.5 hover:opacity-90 transition-opacity">
                        {submitting ? "Submitting…" : "Submit Answer"}
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleShowSolution} disabled={showSolution} className="rounded-lg font-semibold">{showSolution ? "Solution Shown" : "Show Solution"}</Button>
                        <Button variant="ghost" onClick={handleTryAgain} disabled={submitting} className="rounded-lg font-semibold">Try Again</Button>
                      </>
                    )}
                  </div>

                  <div className="text-sm" role="status" aria-live="polite">
                    {submitted && serverCorrect !== null && (serverCorrect ? <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full font-semibold"><CheckCircle className="w-4 h-4" /> Correct</span> : <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full font-semibold"><XCircle className="w-4 h-4" /> Incorrect</span>)}
                    {submitted && serverCorrect === null && submitting && <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-full font-semibold"><Clock className="w-4 h-4 animate-spin" /> Checking…</span>}
                    {serverMessage && <div className="mt-3 text-xs text-muted-foreground font-semibold">{serverMessage}</div>}
                  </div>
                </div>

                {showSolution && question.solution && (
                  <div className="mt-6 p-4 rounded-lg border-2" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 12%, white)", borderColor: "color-mix(in srgb, var(--brand-primary) 36%, white)" }}>
                    <div className="font-bold mb-2" style={{ color: "var(--brand-secondary)" }}>Solution — Answer: {String(question.answer)}</div>
                    <div className="text-sm text-foreground/90 leading-relaxed">{question.solution}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {/* STREAK POP-UP (centered, animated) */}
          {showStreakCard && (
            <motion.div
              key="streak-card-centered"
              initial={{ opacity: 0, scale: 0.9, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -8 }}
              transition={{ duration: 0.28 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4"
              aria-live="polite"
              role="dialog"
              aria-label="Streak notification"
            >
              {/* backdrop */}
              <div className="absolute inset-0 bg-black/50" />
              
              {/* center card is pointer-events-auto so the inner controls work */}
              <div className="pointer-events-auto relative z-60">
                <div className="w-96 max-w-[92vw] p-6 sm:p-8 rounded-3xl shadow-2xl text-white border-2" style={{ background: "linear-gradient(135deg, var(--brand-secondary) 0%, color-mix(in srgb, var(--brand-secondary) 70%, black) 100%)", borderColor: "var(--brand-primary)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Flame className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: "var(--brand-primary)" }} />
                        <span className="text-xs sm:text-sm uppercase font-bold tracking-wider">Streak Updated</span>
                      </div>
                      <div className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
                        {currentStreakNumber !== null ? String(currentStreakNumber) : "1"}
                      </div>
                      <div className="mt-3 text-sm sm:text-base font-medium text-white/90">Great work! Keep your streak alive.</div>
                    </div>

                    <button
                      onClick={() => setShowStreakCard(false)}
                      aria-label="Close streak notification"
                      className="ml-4 mt-1 rounded-full p-2 hover:bg-white/15 text-white transition-colors"
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
