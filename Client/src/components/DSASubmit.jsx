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
        "http://localhost:3001/api/dsa-submission/run",
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
        "http://localhost:3001/api/dsa-submission",
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
      <div className="min-h-screen bg-[linear-gradient(135deg,rgba(61,191,217,0.14),rgba(255,255,255,1),rgba(3,4,94,0.1))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-secondary)] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (isError || !q) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,rgba(61,191,217,0.14),rgba(255,255,255,1),rgba(3,4,94,0.1))] flex items-center justify-center">
        <Card className="p-6 max-w-md mx-auto border-border/70 shadow-lg">
          <div className="text-center">
            <div className="text-destructive mb-4">
              {error?.message || "Failed to load problem"}
            </div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,rgba(61,191,217,0.14),rgba(255,255,255,1),rgba(3,4,94,0.1))]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex items-center justify-between gap-3"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--brand-secondary)] tracking-tight">
              Submit Solution
            </h1>
            <p className="text-muted-foreground mt-1">
              Solve the problem and run your code against sample tests or submit
              for verdict.
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
          <Card className="lg:sticky lg:top-6 overflow-hidden border-border/70 shadow-xl bg-card/95 backdrop-blur">
            <CardHeader className="flex flex-col gap-2 border-b bg-secondary/30">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-xl leading-tight">
                  {q.title}
                </CardTitle>
                <Badge
                  className="capitalize"
                  variant={getDifficultyVariant(q.difficulty)}
                >
                  {q.difficulty}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {(q.tags || []).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {t}
                  </Badge>
                ))}
                {(q.companyTags || []).map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardHeader>
            <ScrollArea className="h-[70vh]">
              <CardContent className="space-y-4 pr-3">
                <Section title="Description">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap prose-sm">
                    {q.description}
                  </div>
                </Section>

                <Section title="Constraints">
                  <div className="text-sm whitespace-pre-wrap font-mono text-foreground/90 bg-secondary/40 border border-border/60 p-3 rounded-md">
                    {q.constraints}
                  </div>
                </Section>

                <div className="grid grid-cols-1 gap-3">
                  <Section title="Input Format">
                    <div className="text-sm whitespace-pre-wrap bg-[rgba(61,191,217,0.12)] border border-[rgba(61,191,217,0.3)] p-3 rounded-md">
                      {q.inputFormat}
                    </div>
                  </Section>
                  <Section title="Output Format">
                    <div className="text-sm whitespace-pre-wrap bg-[rgba(3,4,94,0.08)] border border-[rgba(3,4,94,0.22)] p-3 rounded-md">
                      {q.outputFormat}
                    </div>
                  </Section>
                </div>

                <Section
                  title={`Sample Test Cases (${q.testCases?.length || 0})`}
                >
                  <div className="space-y-3">
                    {(q.testCases || []).map((tc, i) => (
                      <div
                        key={i}
                        className="border border-border/70 rounded-md overflow-hidden"
                      >
                        <div className="bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground/90">
                          Test Case {i + 1}
                        </div>
                        <div className="p-3 space-y-3">
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Input:
                            </div>
                            <pre className="text-xs bg-secondary/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1">
                              Expected Output:
                            </div>
                            <pre className="text-xs bg-secondary/50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                              {tc.output}
                            </pre>
                          </div>
                          {tc.explanation && (
                            <div>
                              <div className="text-xs font-medium text-muted-foreground mb-1">
                                Explanation:
                              </div>
                              <div className="text-xs text-foreground/80 italic">
                                {tc.explanation}
                              </div>
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
          <Card className="h-[80vh] flex flex-col border-border/70 shadow-xl bg-card/95 backdrop-blur">
            <CardHeader className="flex flex-col gap-3 border-b bg-secondary/30">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-lg text-[var(--brand-secondary)]">Code Editor</CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={lang} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((l) => (
                        <SelectItem key={l} value={l}>
                          {prettyLang(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={onRun}
                    disabled={running || !code.trim()}
                    variant="secondary"
                  >
                    {running ? "Running..." : "Run"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSubmitAll}
                    disabled={submitting || !code.trim()}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>{q.title}</span>
              </div>
            </CardHeader>
            <Separator />

            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-4 space-y-4">
                <div className="h-[350px] border border-border/70 rounded-md overflow-hidden shadow-sm">
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
                      className="w-full rounded-md border border-border/70 bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] font-mono"
                      rows={4}
                      placeholder="Enter input for your program..."
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                    />
                  </TabsContent>

                  <TabsContent value="output" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Run Output</Label>
                      {result?.time && (
                        <div className="text-xs text-muted-foreground">
                          Time: {result.time}s • Memory: {result.memory}
                        </div>
                      )}
                    </div>
                    <div className="border border-border/70 rounded-md p-3 bg-secondary/35 min-h-[100px]">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {formatResult(result)}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="result" className="space-y-2">
                    {submitResp && (
                      <div className="border rounded-md p-3 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-semibold">
                            Submission Verdict
                          </Label>
                          {submitResp.submission?.status && (
                            <Badge
                              variant={getStatusVariant(
                                submitResp.submission.status
                              )}
                            >
                              {submitResp.submission.status.replace("-", " ")}
                            </Badge>
                          )}
                        </div>

                        {submitResp.error ? (
                          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                            {submitResp.error}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {submitResp.message && (
                              <div className="text-sm p-3 bg-[rgba(61,191,217,0.12)] border border-[rgba(61,191,217,0.3)] rounded-md">
                                {submitResp.message}
                              </div>
                            )}

                            {submitResp.streak && (
                              <div className="text-sm text-foreground bg-secondary/45 border border-border/60 p-3 rounded-md">
                                🔥 Streak updated: Current{" "}
                                {submitResp.streak.currentStreak}, Best{" "}
                                {submitResp.streak.bestStreak}
                              </div>
                            )}

                            {(
                              submitResp.testCaseResults ||
                              submitResp.submission?.testCaseResults ||
                              []
                            ).length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs border border-border/70 rounded-md">
                                  <thead className="bg-secondary/50">
                                    <tr>
                                      <th className="p-2 border text-center">
                                        #
                                      </th>
                                      <th className="p-2 border text-left">
                                        Input
                                      </th>
                                      <th className="p-2 border text-left">
                                        Expected
                                      </th>
                                      <th className="p-2 border text-left">
                                        Actual
                                      </th>
                                      <th className="p-2 border text-center">
                                        Status
                                      </th>
                                      <th className="p-2 border text-center">
                                        Time (ms)
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(
                                      submitResp.testCaseResults ||
                                      submitResp.submission?.testCaseResults ||
                                      []
                                    ).map((tc, i) => (
                                      <tr
                                        key={i}
                                        className={
                                          tc.passed
                                            ? "bg-secondary/35"
                                            : "bg-destructive/10"
                                        }
                                      >
                                        <td className="p-2 border text-center font-mono">
                                          {i + 1}
                                        </td>
                                        <td className="p-2 border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                          {tc.input.length > 50
                                            ? `${tc.input.substring(0, 50)}...`
                                            : tc.input}
                                        </td>
                                        <td className="p-2 border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                          {tc.expectedOutput?.length > 50
                                            ? `${tc.expectedOutput.substring(
                                                0,
                                                50
                                              )}...`
                                            : tc.expectedOutput}
                                        </td>
                                        <td className="p-2 border whitespace-pre-wrap align-top font-mono text-xs max-w-24 overflow-hidden">
                                          {tc.actualOutput?.length > 50
                                            ? `${tc.actualOutput.substring(
                                                0,
                                                50
                                              )}...`
                                            : tc.actualOutput}
                                        </td>
                                        <td className="p-2 border text-center">
                                          {tc.passed ? "✅ Pass" : "❌ Fail"}
                                        </td>
                                        <td className="p-2 border text-center font-mono">
                                          {tc.executionTime?.toFixed(2) ?? "-"}
                                        </td>
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
                    {!submitResp && (
                      <div className="text-center text-muted-foreground py-8">
                        Submit your solution to see results here
                      </div>
                    )}
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
