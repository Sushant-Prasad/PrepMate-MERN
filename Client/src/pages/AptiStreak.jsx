// src/pages/AptiStreak.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitAptitudeAnswer } from "@/services/aptitudeSubmitServices";

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


  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["daily-aptitude", "today"],
    queryFn: fetchTodayDailyApti,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const dailyDoc = data ?? null;
  const question = dailyDoc?.questionId ?? null;

  useEffect(() => {
    setStartTs(Date.now());
    setChoice(null);
    setSubmitted(false);
    setServerCorrect(null);
    setShowSolution(false);
    setServerMessage(null);
    setStreakInfo(null);
  }, [question?._id]);

  const opts = question ? toPlainOptions(question.options) : [];

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
        questionId: question._id,
        selectedOption: choice,
        mode: "streak",
        timeTaken: elapsed,
      };

      const res = await submitAptitudeAnswer(payload);
      const isCorrect = !!(res?.isCorrect || res?.submission?.isCorrect);
      setServerCorrect(isCorrect);

      if (res?.message) setServerMessage(res.message);
      if (res?.streak) setStreakInfo(res.streak);
      if (res?.submission?.streak) setStreakInfo(res.submission.streak);
    } catch (err) {
      console.error("Streak submission error:", err);
      const msg = err?.message || "Submission failed";
      setServerMessage(msg);
      setSubmitted(false);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Daily Aptitude — Streak</h1>
          <p className="text-sm text-gray-600 mt-2">Solve the daily challenge and keep your streak alive.</p>
        </motion.div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold">Today's Question</span>
                <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
              </div>
              <div>{streakInfo ? <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">🔥 Streak: {streakInfo?.count ?? streakInfo}</Badge> : null}</div>
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
                    {opts.map(({ key, value }) => {
                      const isSelected = choice === key;
                      const isCorrectLocal = key === question.answer;
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

                      return (
                        <div key={key} className="flex items-start space-x-3">
                          <RadioGroupItem id={`daily-${question._id}-${key}`} value={key} className="mt-1 shrink-0" disabled={submitted || submitting} />
                          <Label htmlFor={`daily-${question._id}-${key}`} className={labelClasses}>
                            <span className="font-semibold text-indigo-600 mr-3">{key}.</span>
                            <span>{value}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {!submitted ? (
                      <Button onClick={handleSubmit} disabled={!choice || submitting}>
                        {submitting ? "Submitting…" : "Submit (streak)"}
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
                    <div className="font-semibold text-indigo-800 mb-1">Solution — Answer: {question.answer}</div>
                    <div className="text-sm text-gray-800">{question.solution}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------- helpers -------------------- */
function toPlainOptions(options) {
  if (!options) return [];
  if (options instanceof Map) {
    return Array.from(options.entries()).map(([k, v]) => ({ key: k, value: v }));
  }
  return Object.entries(options).map(([k, v]) => ({ key: k, value: v }));
}
