// src/pages/DSASubmit.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { useDSAQuestion } from "@/services/DSAServices";

const DEFAULT_LANGS = ["javascript", "python", "cpp", "java"];

export default function DSASubmit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDSAQuestion(id, {
    keepPreviousData: true,
  });
  const q = data?.data;

  // --- userId resolution (adjust to your auth flow) ---
  const userId = getUserIdFromLocalStorage();

  const languages = useMemo(() => {
    const fromProblem = (q?.languagesSupported || []).map((l) =>
      (l || "").toLowerCase()
    );
    const arr = fromProblem.length ? fromProblem : DEFAULT_LANGS;
    return Array.from(new Set(arr));
  }, [q]);

  const [lang, setLang] = useState(() => languages[0] || "javascript");
  useEffect(() => {
    setLang(languages[0] || "javascript");
  }, [languages]);

  const initialCode = useMemo(() => {
    if (!q) return getBoilerplate(lang);
    const found = (q.starterCode || []).find(
      (s) => s.language?.toLowerCase() === lang
    );
    return found?.code || getBoilerplate(lang);
  }, [q, lang]);

  const [code, setCode] = useState(initialCode);
  useEffect(() => setCode(initialCode), [initialCode]);

  const [stdin, setStdin] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const mode = "practice"; // fixed mode
  const [submitResp, setSubmitResp] = useState(null); // server response for submit

  const onRun = useCallback(async () => {
    setRunning(true);
    setResult(null);
    try {
      const { data } = await axios.post(
        "/api/judge/execute",
        { language: lang, source: code, stdin, problemId: q?._id },
        { withCredentials: true }
      );
      setResult(data);
    } catch (e) {
      setResult({
        success: false,
        error: e?.response?.data?.message || e.message,
      });
    } finally {
      setRunning(false);
    }
  }, [lang, code, stdin, q?._id]);

  const onSubmitAll = useCallback(async () => {
    if (!q?._id) return;
    setSubmitting(true);
    setSubmitResp(null);
    try {
      const { data } = await axios.post(
        "/api/dsa/submit",
        {
          userId, // backend expects this in body; switch to req.user later if you update backend
          questionId: q._id,
          code,
          language: lang,
          mode,
        },
        { withCredentials: true }
      );
      setSubmitResp(data);
    } catch (e) {
      setSubmitResp({ error: e?.response?.data?.message || e.message });
    } finally {
      setSubmitting(false);
    }
  }, [userId, q?._id, code, lang, mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 flex items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
              Submit Solution
            </h1>
            <p className="text-gray-600 mt-1">
              Solve the problem and run your code against sample tests or submit
              for verdict.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="text-sm text-gray-500">Loading problem…</div>
        ) : isError ? (
          <div className="text-sm text-red-600">
            {error?.message || "Failed to load problem"}
          </div>
        ) : !q ? (
          <div className="text-sm text-gray-500">Problem not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-6 items-start">
            {/* LEFT: Problem Details */}
            <Card className="lg:sticky lg:top-6 overflow-hidden">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl leading-tight">
                    {q.title}
                  </CardTitle>
                  <Badge className="capitalize" variant="outline">
                    {q.difficulty}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(q.tags || []).map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                  {(q.companyTags || []).map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <ScrollArea className="h-[70vh]">
                <CardContent className="space-y-4 pr-3">
                  <Section title="Description">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {q.description}
                    </p>
                  </Section>
                  <Section title="Constraints">
                    <p className="text-sm whitespace-pre-wrap">
                      {q.constraints}
                    </p>
                  </Section>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Section title="Input Format">
                      <p className="text-sm whitespace-pre-wrap">
                        {q.inputFormat}
                      </p>
                    </Section>
                    <Section title="Output Format">
                      <p className="text-sm whitespace-pre-wrap">
                        {q.outputFormat}
                      </p>
                    </Section>
                  </div>
                  <Section
                    title={`Sample Test Cases (${q.testCases?.length || 0})`}
                  >
                    <ul className="space-y-2 text-sm">
                      {(q.testCases || []).map((tc, i) => (
                        <li key={i} className="p-2 rounded-md border">
                          <div className="font-medium">Input:</div>
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                            {tc.input}
                          </pre>
                          <div className="font-medium mt-2">
                            Expected Output:
                          </div>
                          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                            {tc.output}
                          </pre>
                          {tc.explanation && (
                            <div className="mt-2 text-xs text-gray-600">
                              {tc.explanation}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </Section>
                </CardContent>
              </ScrollArea>
            </Card>

            {/* RIGHT: Editor + Run/Submit */}
            <Card className="h-[80vh] flex flex-col overflow-auto">
              <CardHeader className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">Code Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    {/* Native selects to avoid extra deps */}
                    <select
                      className="border rounded-md px-2 py-1 text-sm"
                      value={lang}
                      onChange={(e) => setLang(e.target.value)}
                    >
                      {languages.map((l) => (
                        <option key={l} value={l}>
                          {prettyLang(l)}
                        </option>
                      ))}
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCode(getBoilerplate(lang))}
                    >
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={onRun}
                      disabled={running || !code}
                    >
                      {running ? "Running…" : "Run"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={onSubmitAll}
                      disabled={submitting || !code || !userId}
                    >
                      {submitting ? "Submitting…" : "Submit"}
                    </Button>
                  </div>
                </div>
                {!userId && (
                  <div className="text-[11px] text-red-600">
                    You are not logged in or userId is missing. Submissions will
                    be disabled.
                  </div>
                )}
                <div className="text-xs text-gray-500">{q.title}</div>
              </CardHeader>
              <Separator />

              <Separator />

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4 pr-2">
                  <Editor
                    height="300px"
                    
                    defaultLanguage={mapToMonaco(lang)}
                    language={mapToMonaco(lang)}
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                    }}
                    theme="vs-dark"
                  />

                  {/* stdin for quick ad-hoc runs */}
                  <div>
                    <Label className="text-sm">Standard Input</Label>
                    <textarea
                      className="mt-1 w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      rows={3}
                      placeholder="Type input to pass to your program…"
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                    />
                  </div>

                  {/* Run Output */}
                  <div className="border rounded-md p-3 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">Run Output</div>
                      {result?.time && (
                        <div className="text-[11px] text-gray-500">
                          Time: {result.time} • Memory: {result.memory}
                        </div>
                      )}
                    </div>
                    <pre className="text-xs whitespace-pre-wrap">
                      {formatResult(result)}
                    </pre>
                  </div>

                  {/* Submit Verdict */}
                  {submitResp && (
                    <div className="border rounded-md p-3 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold">Verdict</div>
                        {submitResp.submission?.status && (
                          <Badge variant="outline" className="capitalize">
                            {submitResp.submission.status}
                          </Badge>
                        )}
                      </div>

                      {submitResp.error ? (
                        <div className="text-sm text-red-600">
                          {submitResp.error}
                        </div>
                      ) : (
                        <>
                          {submitResp.message && (
                            <div className="text-sm mb-2">
                              {submitResp.message}
                            </div>
                          )}
                          {submitResp.streak && (
                            <div className="text-xs text-green-700 mb-2">
                              Streak updated: current{" "}
                              {submitResp.streak.currentStreak}, best{" "}
                              {submitResp.streak.bestStreak}
                            </div>
                          )}
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="p-2 border">#</th>
                                  <th className="p-2 border text-left">
                                    Input
                                  </th>
                                  <th className="p-2 border text-left">
                                    Expected
                                  </th>
                                  <th className="p-2 border text-left">
                                    Actual
                                  </th>
                                  <th className="p-2 border">Passed</th>
                                  <th className="p-2 border">Time (ms)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(
                                  submitResp.testCaseResults ||
                                  submitResp.submission?.testCaseResults ||
                                  []
                                ).map((tc, i) => (
                                  <tr key={i}>
                                    <td className="p-2 border text-center">
                                      {i + 1}
                                    </td>
                                    <td className="p-2 border whitespace-pre-wrap align-top">
                                      {tc.input}
                                    </td>
                                    <td className="p-2 border whitespace-pre-wrap align-top">
                                      {tc.expectedOutput}
                                    </td>
                                    <td className="p-2 border whitespace-pre-wrap align-top">
                                      {tc.actualOutput}
                                    </td>
                                    <td className="p-2 border text-center">
                                      {tc.passed ? "✅" : "❌"}
                                    </td>
                                    <td className="p-2 border text-center">
                                      {tc.executionTime ?? "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
      {children}
    </div>
  );
}

/* ---------------- helpers ---------------- */
function getBoilerplate(lang) {
  switch ((lang || "").toLowerCase()) {
    case "javascript":
      return `// Read from stdin if needed\n// const fs = require('fs');\n// const input = fs.readFileSync(0, 'utf8').trim();\nfunction solve() {\n  // write your code here\n}\n\nsolve();`;
    case "python":
      return `# import sys\n# data = sys.stdin.read().strip()\n\ndef solve():\n    # write your code here\n    pass\n\nif __name__ == "__main__":\n    solve()`;
    case "cpp":
      return `#include <bits/stdc++.h>\nusing namespace std;\nint main(){\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    // write your code here\n    return 0;\n}`;
    case "java":
      return `import java.io.*;\nimport java.util.*;\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    // write your code here\n  }\n}`;
    default:
      return "// Start coding here";
  }
}

function mapToMonaco(lang) {
  const l = (lang || "").toLowerCase();
  if (l === "cpp") return "cpp";
  if (l === "javascript") return "javascript";
  if (l === "python") return "python";
  if (l === "java") return "java";
  return "javascript";
}

function prettyLang(l) {
  const m = {
    javascript: "JavaScript",
    python: "Python",
    cpp: "C++",
    java: "Java",
  };
  return m[(l || "").toLowerCase()] || l;
}

function formatResult(r) {
  if (!r) return "";
  if (r.error) return `Error: ${r.error}`;
  if (r.success === false && r.message) return `Error: ${r.message}`;
  const status = r.status ? `[${r.status}]\n` : "";
  const out = r.stdout || r.output || "";
  const err = r.stderr || "";
  return `${status}${out}${err ? "\n[stderr]\n" + err : ""}`.trim();
}

function getUserIdFromLocalStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?._id || parsed?.id || null;
  } catch (_) {
    return null;
  }
}
