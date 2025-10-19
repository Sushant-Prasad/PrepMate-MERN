// src/pages/DSA.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDSAQuestions,
  useCreateDSA,
  useUpdateDSA,
  useDeleteDSA,
} from "@/services/DSAServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

export default function AdminDSA() {
  const navigate = useNavigate();

  // list query
  const { data: listResp, isLoading, isError, error, refetch } = useDSAQuestions();
  const questions = listResp?.data ?? listResp ?? [];

  // local ui state
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null); // selected question for edit
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const [constraints, setConstraints] = useState("");
  const [inputFormat, setInputFormat] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [testCases, setTestCases] = useState([{ input: "", output: "", explanation: "" }]);
  const [starterCode, setStarterCode] = useState([{ language: "javascript", code: "" }]);
  const [solution, setSolution] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [companyTagsText, setCompanyTagsText] = useState("");
  const [languagesText, setLanguagesText] = useState("javascript,python,cpp");
  const [timeLimit, setTimeLimit] = useState(1);
  const [memoryLimit, setMemoryLimit] = useState(256);

  // mutations
  const createMutation = useCreateDSA({
    onSuccess: () => {
      toast.success("Question created");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Create failed");
    },
  });

  const updateMutation = useUpdateDSA({
    onSuccess: () => {
      toast.success("Question updated");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Update failed");
    },
  });

  const deleteMutation = useDeleteDSA({
    onSuccess: () => {
      toast.success("Question deleted");
      refetch();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Delete failed");
    },
  });

  // filtered list
  const filtered = useMemo(() => {
    if (!query.trim()) return questions;
    const q = query.trim().toLowerCase();
    return (questions || []).filter((item) => {
      const titleMatch = String(item.title || "").toLowerCase().includes(q);
      const tagsArr = Array.isArray(item.tags) ? item.tags : String(item.tags || "").split(",").map(s => s.trim());
      const tagsMatch = tagsArr.some((t) => String(t || "").toLowerCase().includes(q));
      return titleMatch || tagsMatch;
    });
  }, [questions, query]);

  // helpers for arrays
  const addTestCase = () => setTestCases((s) => [...s, { input: "", output: "", explanation: "" }]);
  const removeTestCase = (idx) => setTestCases((s) => s.filter((_, i) => i !== idx));
  const updateTestCase = (idx, patch) => setTestCases((s) => s.map((tc, i) => (i === idx ? { ...tc, ...patch } : tc)));

  const addStarter = () => setStarterCode((s) => [...s, { language: "javascript", code: "" }]);
  const removeStarter = (idx) => setStarterCode((s) => s.filter((_, i) => i !== idx));
  const updateStarter = (idx, patch) => setStarterCode((s) => s.map((st, i) => (i === idx ? { ...st, ...patch } : st)));

  const parseCommaList = (txt) =>
    txt
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  // open modal for create
  function openCreateModal() {
    setSelected(null);
    setTitle("");
    setDescription("");
    setDifficulty("easy");
    setConstraints("");
    setInputFormat("");
    setOutputFormat("");
    setTestCases([{ input: "", output: "", explanation: "" }]);
    setStarterCode([{ language: "javascript", code: "" }]);
    setSolution("");
    setTagsText("");
    setCompanyTagsText("");
    setLanguagesText("javascript,python,cpp");
    setTimeLimit(1);
    setMemoryLimit(256);
    setModalOpen(true);
  }

  // open modal for edit 
  function openEditModal(item) {
    setSelected(item);
    setTitle(item.title ?? "");
    setDescription(item.description ?? "");
    setDifficulty(item.difficulty ?? "easy");
    setConstraints(item.constraints ?? "");
    setInputFormat(item.inputFormat ?? "");
    setOutputFormat(item.outputFormat ?? "");
    setTestCases(
      Array.isArray(item.testCases) && item.testCases.length
        ? item.testCases.map((tc) => ({
            input: tc.input ?? "",
            output: tc.output ?? "",
            explanation: tc.explanation ?? "",
          }))
        : [{ input: "", output: "", explanation: "" }]
    );
    setStarterCode(
      Array.isArray(item.starterCode) && item.starterCode.length
        ? item.starterCode.map((s) => ({ language: s.language ?? "javascript", code: s.code ?? "" }))
        : [{ language: "javascript", code: "" }]
    );
    setSolution(item.solution ?? "");
    setTagsText(Array.isArray(item.tags) ? item.tags.join(", ") : (item.tags || ""));
    setCompanyTagsText(Array.isArray(item.companyTags) ? item.companyTags.join(", ") : (item.companyTags || ""));
    setLanguagesText(Array.isArray(item.languagesSupported) ? item.languagesSupported.join(", ") : (item.languagesSupported || "javascript,python,cpp"));
    setTimeLimit(item.timeLimit ?? 1);
    setMemoryLimit(item.memoryLimit ?? 256);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setSelected(null);
    setSubmitting(false);
  }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!inputFormat.trim()) {
      toast.error("Input format is required");
      return;
    }
    if (!outputFormat.trim()) {
      toast.error("Output format is required");
      return;
    }
    if (!solution.trim()) {
      toast.error("Solution is required");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      difficulty: difficulty || "easy",
      constraints: constraints || "",
      inputFormat: inputFormat || "",
      outputFormat: outputFormat || "",
      testCases: (testCases || [])
        .map((tc) => ({
          input: (tc.input || "").toString(),
          output: (tc.output || "").toString(),
          explanation: tc.explanation || "",
        }))
        .filter((tc) => tc.input || tc.output),
      starterCode: (starterCode || [])
        .map((st) => ({ language: (st.language || "javascript").trim(), code: st.code || "" }))
        .filter((s) => s.code && s.code.trim()),
      solution: solution || "",
      tags: parseCommaList(tagsText),
      companyTags: parseCommaList(companyTagsText),
      timeLimit: Number(timeLimit) || 1,
      memoryLimit: Number(memoryLimit) || 256,
      languagesSupported: parseCommaList(languagesText),
    };

    try {
      if (selected && (selected._id || selected.id)) {
        const id = selected._id ?? selected.id;
        await updateMutation.mutateAsync({ id, updates: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (err) {
      // onError handles notifications
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(item) {
    const id = item._id ?? item.id;
    if (!id) {
      toast.error("Missing id");
      return;
    }
    if (!window.confirm(`Delete question "${item.title}"? This action cannot be undone.`)) return;
    deleteMutation.mutate(id);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading DSA questions…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load questions: {String(error?.message ?? error)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Input placeholder="Search by title or tag…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-64" />
            <Button onClick={() => refetch()} variant="outline">Refresh</Button>
            <Button onClick={openCreateModal}>Create Question</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Questions ({(questions || []).length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead className="text-left text-xs text-gray-600 border-b">
                  <tr>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Difficulty</th>
                    <th className="py-2 px-3">Tags</th>
                    <th className="py-2 px-3">Limits</th>
                    <th className="py-2 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">No questions found.</td>
                    </tr>
                  ) : (
                    filtered.map((q) => (
                      <tr key={q._id ?? q.id} className="border-b last:border-b-0">
                        <td className="py-3 px-3 align-top max-w-md">
                          <div className="font-medium">{q.title}</div>
                          <div className="text-xs text-gray-500 mt-1 whitespace-pre-wrap">{(q.description || "").slice(0, 120)}{(q.description||"").length>120?"…":""}</div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <Badge className="capitalize">{q.difficulty ?? "unknown"}</Badge>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(q.tags || []).slice(0, 8).map((t, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3 align-top font-mono text-xs">
                          TL: {q.timeLimit ?? "-"}s<br />
                          ML: {q.memoryLimit ?? "-"}MB
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(q)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(q)}>Delete</Button>
                            <Button size="sm" onClick={() => navigate(`/dsa/submit/${q._id ?? q.id}`)}>Open</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <div
        aria-hidden={!modalOpen}
        className={`fixed inset-0 z-50 flex items-center justify-center ${modalOpen ? "" : "pointer-events-none"}`}
      >
        <div
          onClick={closeModal}
          className={`absolute inset-0 bg-black/40 transition-opacity ${modalOpen ? "opacity-100" : "opacity-0"}`}
        />

        <div className={`relative w-full max-w-4xl mx-4 transition-transform ${modalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{selected ? "Edit Question" : "Create Question"}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeModal}>Close</Button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-auto">
                <div>
                  <Label>Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div>
                  <Label>Description *</Label>
                  <textarea className="w-full rounded-md border px-3 py-2 min-h-[120px] text-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Difficulty</Label>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2">
                      <option value="easy">easy</option>
                      <option value="medium">medium</option>
                      <option value="hard">hard</option>
                    </select>
                  </div>

                  <div>
                    <Label>Time Limit (s)</Label>
                    <Input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} />
                  </div>

                  <div>
                    <Label>Memory Limit (MB)</Label>
                    <Input type="number" value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Constraints</Label>
                  <textarea className="w-full mt-1 rounded-md border px-3 py-2 text-sm" value={constraints} onChange={(e) => setConstraints(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Input Format *</Label>
                    <textarea className="w-full mt-1 rounded-md border px-3 py-2 text-sm" value={inputFormat} onChange={(e) => setInputFormat(e.target.value)} />
                  </div>
                  <div>
                    <Label>Output Format *</Label>
                    <textarea className="w-full mt-1 rounded-md border px-3 py-2 text-sm" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} />
                  </div>
                </div>

                {/* Test cases */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Test Cases</Label>
                    <Button type="button" variant="outline" onClick={addTestCase}>Add Test Case</Button>
                  </div>

                  <div className="space-y-3 mt-3">
                    {testCases.map((tc, i) => (
                      <div key={i} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">Test Case #{i + 1}</div>
                          <Button type="button" variant="ghost" onClick={() => removeTestCase(i)}>Remove</Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                          <div>
                            <Label>Input</Label>
                            <textarea className="w-full mt-1 rounded-md border px-2 py-1 text-sm font-mono" rows={3} value={tc.input} onChange={(e) => updateTestCase(i, { input: e.target.value })} />
                          </div>
                          <div>
                            <Label>Expected Output</Label>
                            <textarea className="w-full mt-1 rounded-md border px-2 py-1 text-sm font-mono" rows={3} value={tc.output} onChange={(e) => updateTestCase(i, { output: e.target.value })} />
                          </div>
                          <div>
                            <Label>Explanation (optional)</Label>
                            <textarea className="w-full mt-1 rounded-md border px-2 py-1 text-sm" rows={3} value={tc.explanation} onChange={(e) => updateTestCase(i, { explanation: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Starter code */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label>Starter Code</Label>
                    <Button type="button" variant="outline" onClick={addStarter}>Add Starter</Button>
                  </div>

                  <div className="space-y-3 mt-3">
                    {starterCode.map((st, i) => (
                      <div key={i} className="border rounded-md p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Label className="mb-0">Language</Label>
                            <select className="rounded-md border px-2 py-1" value={st.language} onChange={(e) => updateStarter(i, { language: e.target.value })}>
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="cpp">C++</option>
                              <option value="java">Java</option>
                            </select>
                          </div>

                          <Button type="button" variant="ghost" onClick={() => removeStarter(i)}>Remove</Button>
                        </div>

                        <div className="mt-2">
                          <Label>Code</Label>
                          <textarea className="w-full mt-1 rounded-md border px-2 py-1 text-sm font-mono" rows={6} value={st.code} onChange={(e) => updateStarter(i, { code: e.target.value })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Solution *</Label>
                  <textarea className="w-full mt-1 min-h-[140px] rounded-md border px-3 py-2 text-sm font-mono" value={solution} onChange={(e) => setSolution(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Tags (comma separated)</Label>
                    <Input value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
                  </div>

                  <div>
                    <Label>Company Tags (comma separated)</Label>
                    <Input value={companyTagsText} onChange={(e) => setCompanyTagsText(e.target.value)} />
                  </div>

                  <div>
                    <Label>Languages Supported (comma separated)</Label>
                    <Input value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                <Button variant="outline" onClick={closeModal} type="button">Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : selected ? "Save Changes" : "Create Question"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
