
import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

import { useDSAQuestion } from "@/services/DSAServices";

const DEFAULT_LANGS = ["javascript", "python", "cpp", "java"];

export default function DSASubmit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDSAQuestion(id, {
    keepPreviousData: true,
  });
  const q = data?.data;

  const languages = useMemo(() => {
    const fromProblem = (q?.languagesSupported || []).map((l) =>
      (l || "").toLowerCase()
    );
    const arr = fromProblem.length ? fromProblem : DEFAULT_LANGS;
    return Array.from(new Set(arr));
  }, [q]);

  const [lang, setLang] = useState(() => languages[0] || "javascript");
  useEffect(() => {
    if (languages.length > 0 && !languages.includes(lang)) {
      setLang(languages[0]);
    }
  }, [languages, lang]);

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
  const [submitResp, setSubmitResp] = useState(null);

  // --- Run code against stdin ---
  const onRun = useCallback(async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        error: "Please write some code before running",
      });
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
      setResult({
        success: false,
        error: e?.response?.data?.message || e.message,
      });
    } finally {
      setRunning(false);
    }
  }, [lang, code, stdin]);

  // --- Submit solution to DB ---
  const onSubmitAll = useCallback(async () => {
    if (!q?._id) return;
    if (!code.trim()) {
      setSubmitResp({
        error: "Please write some code before submitting",
      });
      return;
    }

    setSubmitting(true);
    setSubmitResp(null);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/dsa-submission`,
        {
          questionId: q._id,
          code,
          language: lang,
          mode: "practice", // always practice
        },
        { withCredentials: true }
      );
      setSubmitResp(data);
    } catch (e) {
      setSubmitResp({ error: e?.response?.data?.message || e.message });
    } finally {
      setSubmitting(false);
    }
  }, [q?._id, code, lang]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 45%, color-mix(in srgb, var(--brand-secondary) 9%, transparent) 100%)" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: "var(--brand-primary)" }}></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (isError || !q) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--brand-primary) 12%, transparent) 0%, transparent 45%, color-mix(in srgb, var(--brand-secondary) 9%, transparent) 100%)" }}>
        <Card className="p-6 max-w-md mx-auto shadow-lg border-border bg-card text-card-foreground">
          <div className="text-center">
            <div className="text-red-600 mb-4 font-semibold">
              {error?.message || "Failed to load problem"}
            </div>
            <Button onClick={() => navigate(-1)} style={{ backgroundColor: "var(--brand-primary)" }} className="text-slate-950 hover:opacity-90">Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03c6f7c9] via-[#F5FCFF] to-[#7859dd] overflow-hidden">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-4 sm:py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg, var(--brand-secondary), color-mix(in srgb, var(--brand-primary) 65%, var(--brand-secondary)))" }}>
              {q.title}
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl">
              Solve the problem below and submit your solution.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
            <Button
              onClick={() => navigate(-1)}
              className="rounded-xl px-4 sm:px-5 h-10 sm:h-11 text-sm font-semibold text-white border-0 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              style={{
                backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--brand-secondary) 90%, black), var(--brand-secondary))",
                boxShadow: "0 8px 20px color-mix(in srgb, var(--brand-secondary) 35%, transparent)",
              }}
            >
              <span className="mr-2 text-base leading-none">←</span>
              <span>Back</span>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[390px_1fr] 2xl:grid-cols-[430px_1fr] gap-4 sm:gap-5 lg:gap-6 items-start">
          {/* LEFT: Problem Details */}
          <Card className="lg:sticky lg:top-6 overflow-hidden shadow-lg border border-border rounded-2xl bg-card text-card-foreground">
            <CardHeader className="flex flex-col gap-3 text-white p-4 sm:p-6" style={{ backgroundImage: "linear-gradient(90deg, var(--brand-secondary), color-mix(in srgb, var(--brand-secondary) 70%, black))" }}>
              <div className="flex items-start justify-between gap-2 sm:gap-3">
                <CardTitle className="text-lg sm:text-xl leading-tight font-bold">{q.title}</CardTitle>
                <Badge className="capitalize whitespace-nowrap text-xs sm:text-sm" variant={getDifficultyVariant(q.difficulty)}>
                  {q.difficulty}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {(q.tags || []).map((t) => (
                  <Badge key={t} className="text-xs border-0" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 24%, white)", color: "var(--brand-secondary)" }}>{t}</Badge>
                ))}
                {(q.companyTags || []).map((t) => (
                  <Badge key={t} className="text-xs bg-white/20 text-white border-0">{t}</Badge>
                ))}
              </div>
            </CardHeader>

            <ScrollArea className="max-h-[55vh] lg:h-[calc(100vh-200px)] lg:max-h-none">
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pr-3 sm:pr-4">
                <Section title="Description">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{q.description}</div>
                </Section>

                <Section title="Constraints">
                  <div className="text-xs sm:text-sm whitespace-pre-wrap font-mono text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border">{q.constraints}</div>
                </Section>

                <div className="grid grid-cols-1 gap-3">
                  <Section title="Input Format">
                    <div className="text-xs sm:text-sm whitespace-pre-wrap p-3 rounded-lg border font-mono text-foreground" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 14%, white)", borderColor: "color-mix(in srgb, var(--brand-primary) 36%, white)" }}>{q.inputFormat}</div>
                  </Section>
                  <Section title="Output Format">
                    <div className="text-xs sm:text-sm whitespace-pre-wrap p-3 rounded-lg border font-mono text-foreground" style={{ backgroundColor: "color-mix(in srgb, var(--brand-secondary) 8%, white)", borderColor: "color-mix(in srgb, var(--brand-secondary) 24%, white)" }}>{q.outputFormat}</div>
                  </Section>
                </div>

                <Section title={`Sample Test Cases (${q.testCases?.length || 0})`}>
                  <div className="space-y-3">
                    {(q.testCases || []).map((tc, i) => (
                      <div key={i} className="border border-border rounded-lg overflow-hidden bg-muted/40 hover:bg-muted/70 transition-colors">
                        <div className="bg-muted px-3 py-2 text-xs sm:text-sm font-semibold text-foreground">Test Case {i + 1}</div>
                        <div className="p-3 space-y-3">
                          <div>
                            <div className="text-xs font-bold text-foreground mb-1">Input:</div>
                            <pre className="text-xs bg-card p-2 rounded border border-border overflow-x-auto whitespace-pre-wrap font-mono text-foreground">{tc.input}</pre>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground mb-1">Expected Output:</div>
                            <pre className="text-xs bg-card p-2 rounded border border-border overflow-x-auto whitespace-pre-wrap font-mono text-foreground">{tc.output}</pre>
                          </div>
                          {tc.explanation && (
                            <div>
                              <div className="text-xs font-bold text-foreground mb-1">Explanation:</div>
                              <div className="text-xs text-muted-foreground italic bg-card p-2 rounded border border-border">{tc.explanation}</div>
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
          <Card className="min-h-[560px] lg:min-h-0 flex flex-col shadow-lg border border-border rounded-2xl bg-card text-card-foreground">
            <CardHeader className="flex flex-col gap-3 text-white p-4 sm:p-6" style={{ backgroundImage: "linear-gradient(90deg, var(--brand-secondary), color-mix(in srgb, var(--brand-secondary) 70%, black))" }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 sm:justify-between">
                <CardTitle className="text-lg sm:text-xl font-bold">Write Your Solution</CardTitle>
                <div className="flex items-center gap-2 flex-wrap rounded-xl px-2 py-2 bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                  <Select value={lang} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-24 sm:w-36 bg-secondary text-black border-secondary-foreground/20 text-xs sm:text-sm rounded-lg shadow-sm transition-all duration-200 hover:bg-secondary/90 hover:border-secondary-foreground/35 focus:ring-2 focus:ring-[color:var(--brand-primary)] focus:ring-offset-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-secondary text-black border-secondary-foreground/20 shadow-2xl rounded-xl p-1">
                      {languages.map((l) => (
                        <SelectItem
                          key={l}
                          value={l}
                          className="rounded-md text-black transition-colors duration-150 data-[highlighted]:text-black data-[highlighted]:bg-[color:var(--brand-primary)]/45"
                        >
                          {prettyLang(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetCode}
                    className="text-xs sm:text-sm rounded-lg bg-white/10 border-white/30 text-white transition-all duration-200 hover:bg-white/25 hover:border-white/45 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                  >
                    Reset
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={onRun} 
                    disabled={running || !code.trim()} 
                    style={{ backgroundColor: "var(--brand-secondary)", color: "white" }}
                    className="text-xs sm:text-sm rounded-lg border border-white/20 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {running ? "Running..." : "Run"}
                  </Button>

                  <Button 
                    size="sm" 
                    onClick={onSubmitAll} 
                    disabled={submitting || !code.trim()}
                    style={{ backgroundColor: "var(--brand-primary)" }}
                    className="text-xs sm:text-sm text-slate-900 font-semibold rounded-lg border border-white/20 transition-all duration-200 hover:brightness-105 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <Separator className="bg-border" />

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="h-[260px] sm:h-[320px] md:h-[400px] border border-border rounded-xl overflow-hidden shadow-sm">
                  <Editor
                    height="100%"
                    defaultLanguage={mapToMonaco(lang)}
                    language={mapToMonaco(lang)}
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    options={{
                      fontSize: 13,
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
                  <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-lg">
                    <TabsTrigger value="input" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Input</TabsTrigger>
                    <TabsTrigger value="output" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Output</TabsTrigger>
                    <TabsTrigger value="result" className="text-xs sm:text-sm rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">Result</TabsTrigger>
                  </TabsList>

                  <TabsContent value="input" className="space-y-2 mt-3">
                    <Label className="text-xs sm:text-sm font-semibold text-foreground">Standard Input</Label>
                    <textarea
                      className="w-full rounded-lg border border-border px-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 font-mono bg-background"
                      style={{ outlineColor: "var(--brand-primary)", boxShadow: "none" }}
                      rows={4}
                      placeholder="Enter input for your program..."
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="output" className="space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs sm:text-sm font-semibold text-foreground">📤 Run Output</Label>
                      {result?.time && <div className="text-xs text-muted-foreground">Time: {result.time}s • Memory: {result.memory}</div>}
                    </div>
                    <div className="border border-border rounded-lg p-3 bg-muted/30 min-h-[100px]">
                      <pre className="text-xs whitespace-pre-wrap font-mono text-foreground">{formatResult(result)}</pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="result" className="space-y-2 mt-3">
                    {submitResp && (
                      <div className="border border-border rounded-lg p-3 bg-card">
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <Label className="text-xs sm:text-sm font-semibold text-foreground">✅ Submission Verdict</Label>
                          {submitResp.submission?.status && <Badge variant={getStatusVariant(submitResp.submission.status)} className="text-xs">{submitResp.submission.status.replace("-", " ")}</Badge>}
                        </div>

                        {submitResp.error ? (
                          <div className="text-xs sm:text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">{submitResp.error}</div>
                        ) : (
                          <div className="space-y-3">
                            {submitResp.message && <div className="text-xs sm:text-sm p-3 rounded-lg border" style={{ backgroundColor: "color-mix(in srgb, var(--brand-primary) 12%, white)", borderColor: "color-mix(in srgb, var(--brand-primary) 32%, white)", color: "var(--brand-secondary)" }}>{submitResp.message}</div>}

                            {(submitResp.testCaseResults || submitResp.submission?.testCaseResults || []).length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border border-border rounded-lg">
                                  <thead className="bg-muted">
                                    <tr>
                                      <th className="p-2 border-b border-border text-center font-semibold text-foreground">#</th>
                                      <th className="p-2 border-b border-border text-left font-semibold text-foreground">Input</th>
                                      <th className="p-2 border-b border-border text-left font-semibold text-foreground">Expected</th>
                                      <th className="p-2 border-b border-border text-left font-semibold text-foreground">Actual</th>
                                      <th className="p-2 border-b border-border text-center font-semibold text-foreground">Status</th>
                                      <th className="p-2 border-b border-border text-center font-semibold text-foreground">Time (ms)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(submitResp.testCaseResults || submitResp.submission?.testCaseResults || []).map((tc, i) => (
                                      <tr key={i} className={tc.passed ? "bg-emerald-50" : "bg-red-50"}>
                                        <td className="p-2 border-b border-border text-center font-mono text-xs">{i + 1}</td>
                                        <td className="p-2 border-b border-border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                          {tc.input.length > 50 ? `${tc.input.substring(0, 50)}...` : tc.input}
                                        </td>
                                        <td className="p-2 border-b border-border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                          {tc.expectedOutput?.length > 50 ? `${tc.expectedOutput.substring(0, 50)}...` : tc.expectedOutput}
                                        </td>
                                        <td className="p-2 border-b border-border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                          {tc.actualOutput?.length > 50 ? `${tc.actualOutput.substring(0, 50)}...` : tc.actualOutput}
                                        </td>
                                        <td className="p-2 border-b border-border text-center text-xs font-semibold">{tc.passed ? "✅ Pass" : "❌ Fail"}</td>
                                        <td className="p-2 border-b border-border text-center font-mono text-xs">{tc.executionTime?.toFixed(2) ?? "-"}</td>
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
                    {!submitResp && <div className="text-center text-muted-foreground py-8 text-xs sm:text-sm">🚀 Submit your solution to see results</div>}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[var(--brand-secondary)] mb-2">{title}</h3>
      {children}
    </div>
  );
}

/* ---------------- helpers ---------------- */
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

  // if nothing else, fallback to status
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
