import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Flame } from "lucide-react";

import getTodayDailyDSA from "@/services/dsaStreakServices"; // minimal service returning today's dailyDoc

const DEFAULT_LANGS = ["javascript", "python", "cpp", "java"];

export default function DSAStreak() {
  const navigate = useNavigate();

  // dailyDoc contains wrapper: { _id, questionId: {...}, date }
  const [dailyDoc, setDailyDoc] = useState(null);
  const [loadingDaily, setLoadingDaily] = useState(true);
  const [dailyError, setDailyError] = useState(null);

  // question is the populated question doc (extracted from dailyDoc.questionId)
  const question = useMemo(() => {
    if (!dailyDoc) return null;
    return dailyDoc.questionId ?? dailyDoc.question ?? dailyDoc ?? null;
  }, [dailyDoc]);

  // languages derived from question (or defaults)
  const languages = useMemo(() => {
    const fromProblem = (question?.languagesSupported || []).map((l) => (l || "").toLowerCase());
    const arr = fromProblem.length ? fromProblem : DEFAULT_LANGS;
    return Array.from(new Set(arr));
  }, [question]);

  const [lang, setLang] = useState(() => "javascript");
  useEffect(() => {
    if (languages.length && !languages.includes(lang)) setLang(languages[0]);
    if (!lang && languages.length) setLang(languages[0]);
  }, [languages, lang]);

  // initial code from question.starterCode for selected lang
  const initialCode = useMemo(() => {
    if (!question) return getBoilerplate(lang);
    const found = (question.starterCode || []).find((s) => (s.language || "").toLowerCase() === (lang || "").toLowerCase());
    return found?.code ?? getBoilerplate(lang);
  }, [question, lang]);

  const [code, setCode] = useState(initialCode);
  useEffect(() => setCode(initialCode), [initialCode]);

  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitResp, setSubmitResp] = useState(null);

  // STREAK POPUP state
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakNumber, setStreakNumber] = useState(null);
  const [streakMessage, setStreakMessage] = useState("");

  // Fetch today's daily DSA on mount
  useEffect(() => {
    let cancelled = false;
    const fetchDaily = async () => {
      setLoadingDaily(true);
      setDailyError(null);
      try {
        const res = await getTodayDailyDSA();
        if (cancelled) return;
        setDailyDoc(res || null);
      } catch (err) {
        if (cancelled) return;
        setDailyError(err.message || String(err));
      } finally {
        if (!cancelled) setLoadingDaily(false);
      }
    };
    fetchDaily();
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Run code against stdin ---
  const onRun = useCallback(async () => {
    if (!code.trim()) {
      setResult({ success: false, error: "Please write some code before running" });
      return;
    }

    setRunning(true);
    setResult(null);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/dsa-submission/run`,
        { code, language: lang, stdin },
        { withCredentials: true }
      );
      setResult(data);
    } catch (e) {
      setResult({ success: false, error: e?.response?.data?.message || e.message });
    } finally {
      setRunning(false);
    }
  }, [lang, code, stdin]);

  // Helper: determine if response indicates a correct/accepted submission
  function isSubmissionCorrect(resp) {
    if (!resp) return false;
    // norm to try several shapes
    const r = resp.submission ?? resp;
    const status = (r?.status ?? "").toString().toLowerCase();
    const isCorrectFlag = r?.isCorrect ?? resp?.isCorrect ?? resp?.passedAll ?? false;
    if (status === "accepted" || status === "accepted " || status === "accepted\n") return true;
    if (Boolean(isCorrectFlag) === true) return true;
    // some backends return a verdict field
    if ((r?.verdict ?? "").toString().toLowerCase() === "accepted") return true;
    return false;
  }

  // Helper: extract current streak number from response
  function extractCurrentStreak(resp) {
    if (!resp) return null;
    // try multiple plausible locations
    const candidates = [
      resp.streak,
      resp?.submission?.streak,
      resp?.data?.streak,
      resp?.submission?.data?.streak,
      resp?.submission,
    ];
    for (const c of candidates) {
      if (!c) continue;
      if (typeof c === "number") return c;
      if (typeof c === "object") {
        if (Number.isFinite(c?.currentStreak)) return c.currentStreak;
        if (Number.isFinite(c?.current)) return c.current;
        if (Number.isFinite(c?.value)) return c.value;
      }
    }
    // fallback: maybe resp contains `currentStreak` directly
    if (Number.isFinite(resp.currentStreak)) return resp.currentStreak;
    return null;
  }

  // --- Submit solution to DB in 'streak' mode ---
  const onSubmitAll = useCallback(async () => {
    // ensure we have a question id from today's assignment
    const qId = question?._id ?? question?.id ?? null;
    if (!qId) {
      setSubmitResp({ error: "No daily DSA question available to submit for streak." });
      return;
    }
    if (!code.trim()) {
      setSubmitResp({ error: "Please write some code before submitting" });
      return;
    }

    setSubmitting(true);
    setSubmitResp(null);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/dsa-submission`,
        {
          questionId: qId,
          code,
          language: lang,
          mode: "streak", // FORCE streak mode here
        },
        { withCredentials: true }
      );

      setSubmitResp(data);

      // If submission is correct -> pop up streak card
      if (isSubmissionCorrect(data)) {
        const current = extractCurrentStreak(data);
        setStreakNumber(current);
        // optional friendly message
        const msg = current !== null ? `Nice! Your current streak is ${current} 🔥` : "Nice! Streak updated.";
        setStreakMessage(msg);
        setShowStreakPopup(true);
        // auto-hide after 4 seconds
        setTimeout(() => setShowStreakPopup(false), 4000);
      }
    } catch (e) {
      setSubmitResp({ error: e?.response?.data?.message || e.message });
    } finally {
      setSubmitting(false);
    }
  }, [question, code, lang]);

  const resetCode = useCallback(() => {
    const newCode = getBoilerplate(lang);
    setCode(newCode);
    setResult(null);
    setSubmitResp(null);
  }, [lang]);

  const handleLanguageChange = useCallback((newLang) => {
    setLang(newLang);
    setResult(null);
    setSubmitResp(null);
  }, []);

  // Render loading / errors similar to DSASubmit layout
  if (loadingDaily) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading today's DSA challenge...</p>
        </div>
      </div>
    );
  }

  if (dailyError || !question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              {dailyError ? dailyError : "No daily DSA assigned yet."}
            </div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  // question exists -> render full submit UI (streak mode)
  const q = question; // alias to match DSASubmit naming

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-6 flex items-center justify-between gap-3"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
                Daily DSA — Streak Submit
              </h1>
              <p className="text-gray-600 mt-1">
                This is today's assigned problem. Submissions here are sent in <strong>streak</strong> mode.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Back
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
            {/* LEFT: Problem Details */}
            <Card className="lg:sticky lg:top-6 overflow-hidden">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl leading-tight">{q.title}</CardTitle>
                  <Badge className="capitalize" variant={getDifficultyVariant(q.difficulty)}>{q.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(q.tags || []).map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                  {(q.companyTags || []).map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              </CardHeader>

              <ScrollArea className="h-[70vh]">
                <CardContent className="space-y-4 pr-3">
                  <Section title="Description">
                    <div className="text-sm leading-relaxed whitespace-pre-wrap prose-sm">{q.description}</div>
                  </Section>

                  <Section title="Constraints">
                    <div className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-gray-50 p-3 rounded-md">{q.constraints}</div>
                  </Section>

                  <div className="grid grid-cols-1 gap-3">
                    <Section title="Input Format">
                      <div className="text-sm whitespace-pre-wrap bg-blue-50 p-3 rounded-md">{q.inputFormat}</div>
                    </Section>
                    <Section title="Output Format">
                      <div className="text-sm whitespace-pre-wrap bg-green-50 p-3 rounded-md">{q.outputFormat}</div>
                    </Section>
                  </div>

                  <Section title={`Sample Test Cases (${q.testCases?.length || 0})`}>
                    <div className="space-y-3">
                      {(q.testCases || []).map((tc, i) => (
                        <div key={i} className="border rounded-md overflow-hidden">
                          <div className="bg-gray-50 px-3 py-2 text-sm font-medium">Test Case {i + 1}</div>
                          <div className="p-3 space-y-3">
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-1">Input:</div>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">{tc.input}</pre>
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-600 mb-1">Expected Output:</div>
                              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto whitespace-pre-wrap">{tc.output}</pre>
                            </div>
                            {tc.explanation && (
                              <div>
                                <div className="text-xs font-medium text-gray-600 mb-1">Explanation:</div>
                                <div className="text-xs text-gray-700 italic">{tc.explanation}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </CardContent>
              </ScrollArea>
            </Card>

            {/* RIGHT: Editor + Run/Submit */}
            <Card className="h-[80vh] flex flex-col">
              <CardHeader className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={lang} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {languages.map((l) => <SelectItem key={l} value={l}>{prettyLang(l)}</SelectItem>)}
                      </SelectContent>
                    </Select>

                    <Button variant="outline" size="sm" onClick={resetCode}>Reset</Button>
                    <Button size="sm" onClick={onRun} disabled={running || !code.trim()} variant="secondary">{running ? "Running..." : "Run"}</Button>

                    {/* Submit always in streak mode here */}
                    <Button size="sm" onClick={onSubmitAll} disabled={submitting || !code.trim()}>
                      {submitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center justify-between">
                  <span className="text-xs text-black">Mode: <strong>streak</strong></span>
                </div>
              </CardHeader>

              <Separator />

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-4 space-y-4">
                  <div className="h-[350px] border rounded-md overflow-hidden">
                    <Editor
                      height="100%"
                      defaultLanguage={mapToMonaco(lang)}
                      language={mapToMonaco(lang)}
                      value={code}
                      onChange={(v) => setCode(v || "")}
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                      }}
                      theme="vs-dark"
                    />
                  </div>

                  <Tabs defaultValue="input" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="input">Input</TabsTrigger>
                      <TabsTrigger value="output">Output</TabsTrigger>
                      <TabsTrigger value="result">Result</TabsTrigger>
                    </TabsList>

                    <TabsContent value="input" className="space-y-2">
                      <Label className="text-sm">Standard Input</Label>
                      <textarea
                        className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-mono"
                        rows={4}
                        placeholder="Enter input for your program..."
                        value={stdin}
                        onChange={(e) => setStdin(e.target.value)}
                      />
                    </TabsContent>

                    <TabsContent value="output" className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Run Output</Label>
                        {result?.time && <div className="text-xs text-gray-500">Time: {result.time}s • Memory: {result.memory}</div>}
                      </div>
                      <div className="border rounded-md p-3 bg-gray-50 min-h-[100px]">
                        <pre className="text-xs whitespace-pre-wrap font-mono">{formatResult(result)}</pre>
                      </div>
                    </TabsContent>

                    <TabsContent value="result" className="space-y-2">
                      {submitResp && (
                        <div className="border rounded-md p-3 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <Label className="text-sm font-semibold">Submission Verdict</Label>
                            {submitResp.submission?.status && <Badge variant={getStatusVariant(submitResp.submission.status)}>{submitResp.submission.status.replace("-", " ")}</Badge>}
                          </div>

                          {submitResp.error ? (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{submitResp.error}</div>
                          ) : (
                            <div className="space-y-3">
                              {submitResp.message && <div className="text-sm p-3 bg-blue-50 rounded-md">{submitResp.message}</div>}

                             

                              {(submitResp.testCaseResults || submitResp.submission?.testCaseResults || []).length > 0 && (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs border rounded-md">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="p-2 border text-center">#</th>
                                        <th className="p-2 border text-left">Input</th>
                                        <th className="p-2 border text-left">Expected</th>
                                        <th className="p-2 border text-left">Actual</th>
                                        <th className="p-2 border text-center">Status</th>
                                        <th className="p-2 border text-center">Time (ms)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {(submitResp.testCaseResults || submitResp.submission?.testCaseResults || []).map((tc, i) => (
                                        <tr key={i} className={tc.passed ? "bg-green-50" : "bg-red-50"}>
                                          <td className="p-2 border text-center font-mono">{i + 1}</td>
                                          <td className="p-2 border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                            {tc.input.length > 50 ? `${tc.input.substring(0, 50)}...` : tc.input}
                                          </td>
                                          <td className="p-2 border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                            {tc.expectedOutput?.length > 50 ? `${tc.expectedOutput.substring(0, 50)}...` : tc.expectedOutput}
                                          </td>
                                          <td className="p-2 border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                            {tc.actualOutput?.length > 50 ? `${tc.actualOutput.substring(0, 50)}...` : tc.actualOutput}
                                          </td>
                                          <td className="p-2 border text-center">{tc.passed ? "✅ Pass" : "❌ Fail"}</td>
                                          <td className="p-2 border text-center font-mono">{tc.executionTime?.toFixed(2) ?? "-"}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {!submitResp && <div className="text-center text-gray-500 py-8">Submit your streak solution to see results here</div>}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Animated Streak Pop-up (centered) */}
      <AnimatePresence>
        {showStreakPopup && (
          <motion.div
            key="streak-popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-live="polite"
          >
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/40" />

            {/* card */}
            <motion.div
              role="dialog"
              aria-label="Streak notification"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 10, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="relative z-60 max-w-md w-full mx-4"
            >
              <div className="bg-black text-white rounded-2xl p-6 shadow-2xl border border-white/10 flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                    <Flame className="w-7 h-7 text-orange-400" />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm uppercase text-gray-300">Streak Updated</div>
                  <div className="mt-1 text-4xl font-extrabold leading-none">
                    {streakNumber !== null ? `${streakNumber} 🔥` : "🔥"}
                  </div>
                  {streakMessage && <div className="mt-2 text-sm text-gray-200">{streakMessage}</div>}
                </div>

                <button
                  aria-label="Close streak notification"
                  onClick={() => setShowStreakPopup(false)}
                  className="ml-4 p-2 rounded-full hover:bg-white/5"
                >
                  <X className="w-4 h-4 text-gray-200" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------------- small helpers ---------------- */

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function getBoilerplate(lang) {
  switch ((lang || "").toLowerCase()) {
    case "javascript":
      return `// Read from stdin if needed
// const fs = require('fs');
// const input = fs.readFileSync(0, 'utf8').trim();

function solve() {
    // Write your solution here
    console.log("Hello World");
}

solve();`;
    case "python":
      return `# Read from stdin if needed
# import sys
# data = sys.stdin.read().strip()

def solve():
    # Write your solution here
    print("Hello World")

if __name__ == "__main__":
    solve()`;
    case "cpp":
      return `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    
    // Write your solution here
    cout << "Hello World" << endl;
    
    return 0;
}`;
    case "java":
      return `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        
        // Write your solution here
        System.out.println("Hello World");
        
        sc.close();
    }
}`;
    default:
      return "// Start coding here";
  }
}

function mapToMonaco(lang) {
  const l = (lang || "").toLowerCase();
  switch (l) {
    case "cpp":
      return "cpp";
    case "javascript":
      return "javascript";
    case "python":
      return "python";
    case "java":
      return "java";
    default:
      return "javascript";
  }
}

function prettyLang(l) {
  const map = {
    javascript: "JavaScript",
    python: "Python",
    cpp: "C++",
    java: "Java",
  };
  return map[(l || "").toLowerCase()] || l;
}

function formatResult(r) {
  if (!r) return "Click 'Run' to execute your code with the given input.";
  if (r.error) return `Error: ${r.error}`;
  if (r.success === false && r.message) return `Error: ${r.message}`;

  const output = r.stdout?.trim() || "";
  const error = r.stderr?.trim() || "";
  const compileError = r.compile_output?.trim() || "";

  let result = "";
  if (output) result += `Output:\n${output}`;
  if (error) result += `\n\nStderr:\n${error}`;
  if (compileError) result += `\n\nCompile Output:\n${compileError}`;

  if (!result) result = `Status: ${r.status}`;

  return result.trim();
}

function getDifficultyVariant(difficulty) {
  switch ((difficulty || "").toLowerCase()) {
    case "easy":
      return "secondary";
    case "medium":
      return "default";
    case "hard":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusVariant(status) {
  switch ((status || "").toLowerCase()) {
    case "accepted":
      return "secondary";
    case "wrong-answer":
      return "destructive";
    case "time-limit-exceeded":
      return "default";
    case "compilation-error":
      return "destructive";
    case "runtime-error":
      return "destructive";
    default:
      return "outline";
  }
}
