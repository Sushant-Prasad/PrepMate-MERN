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
import {
  Code2,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  X,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Terminal,
  Eye,
  Zap,
  Database,
  FileCode,
} from "lucide-react";

export default function AdminDSA() {
  const navigate = useNavigate();

  // list query
  const { data: listResp, isLoading, isError, error, refetch } = useDSAQuestions();
  const questions = listResp?.data ?? listResp ?? [];

  // local ui state
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
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
      toast.success("Question created successfully!");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Create failed");
    },
  });

  const updateMutation = useUpdateDSA({
    onSuccess: () => {
      toast.success("Question updated successfully!");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Update failed");
    },
  });

  const deleteMutation = useDeleteDSA({
    onSuccess: () => {
      toast.success("Question deleted successfully!");
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

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <Code2 className="w-12 h-12 text-emerald-600 animate-pulse mx-auto mb-4" />
          <div className="text-gray-600 font-medium">Loading DSA questions...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 font-medium">Failed to load: {String(error?.message ?? error)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-blue-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl">
                  <Code2 className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#03045E] via-emerald-600 to-[#3DBFD9] bg-clip-text text-transparent">
                    DSA Questions
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage data structures and algorithms challenges
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-[#03045E] via-emerald-500 to-[#3DBFD9] rounded-full" />
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by title or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-emerald-500 text-[#03045E] hover:bg-emerald-50 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-emerald-600 to-[#3DBFD9] hover:from-emerald-700 hover:to-[#34aac3] text-white shadow-lg shadow-emerald-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </div>
        </div>

        {/* Questions Card */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="text-xl font-bold text-[#03045E]">All Questions</h3>
                  <p className="text-sm text-gray-500 font-normal mt-0.5">
                    Total: {(questions || []).length} questions
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none px-4 py-2">
                {filtered.length} shown
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="py-4 px-6">Question</th>
                    <th className="py-4 px-6">Difficulty</th>
                    <th className="py-4 px-6">Tags</th>
                    <th className="py-4 px-6">Limits</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full mb-4">
                            <Code2 className="w-10 h-10 text-emerald-400" />
                          </div>
                          <p className="text-gray-500 mb-2">No questions found</p>
                          <p className="text-sm text-gray-400">
                            {query ? "Try adjusting your search" : "Create your first question to get started"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((q) => (
                      <tr
                        key={q._id ?? q.id}
                        className="group hover:bg-emerald-50/30 transition-colors duration-200"
                      >
                        <td className="py-4 px-6 align-top max-w-md">
                          <div className="font-semibold text-[#03045E] group-hover:text-emerald-600 transition-colors mb-1">
                            {q.title}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">
                            {(q.description || "").slice(0, 120)}
                            {(q.description || "").length > 120 ? "..." : ""}
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <Badge className={`capitalize ${getDifficultyColor(q.difficulty)}`}>
                            {q.difficulty ?? "unknown"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(q.tags || []).slice(0, 3).map((t, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs bg-[#3DBFD9]/10 text-[#3DBFD9] border-[#3DBFD9]/30"
                              >
                                {t}
                              </Badge>
                            ))}
                            {(q.tags || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                +{(q.tags || []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Clock className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-medium">{q.timeLimit ?? "-"}s</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-700">
                              <Database className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-medium">{q.memoryLimit ?? "-"}MB</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/dsa/submit/${q._id ?? q.id}`)}
                              className="border-[#3DBFD9] text-[#3DBFD9] hover:bg-[#3DBFD9] hover:text-white transition-all duration-300"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(q)}
                              className="border-emerald-500 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-300"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(q)}
                              className="bg-red-500 hover:bg-red-600 transition-all duration-300"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
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
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-blue-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-xl">
                  <Code2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#03045E]">
                    {selected ? "Edit Question" : "Create New Question"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selected ? "Update question details" : "Add a new DSA challenge"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeModal}
                className="rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="px-6 py-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Title & Description */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Title
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2 h-11 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Enter question title..."
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Description
                      <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      className="w-full mt-2 rounded-lg border border-gray-300 px-4 py-3 min-h-[120px] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the problem..."
                    />
                  </div>
                </div>

                {/* Difficulty & Limits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E]">Difficulty</Label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="mt-2 w-full h-11 rounded-lg border border-gray-300 px-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Time Limit (s)
                    </Label>
                    <Input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(e.target.value)}
                      className="mt-2 h-11 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      Memory Limit (MB)
                    </Label>
                    <Input
                      type="number"
                      value={memoryLimit}
                      onChange={(e) => setMemoryLimit(e.target.value)}
                      className="mt-2 h-11 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Constraints */}
                <div>
                  <Label className="text-sm font-semibold text-[#03045E]">Constraints</Label>
                  <textarea
                    className="w-full mt-2 rounded-lg border border-gray-300 px-4 py-3 min-h-[80px] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    placeholder="e.g., 1 <= n <= 10^5"
                  />
                </div>

                {/* Input & Output Format */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Input Format
                      <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      className="w-full mt-2 rounded-lg border border-gray-300 px-4 py-3 min-h-[100px] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={inputFormat}
                      onChange={(e) => setInputFormat(e.target.value)}
                      placeholder="Describe the input format..."
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Output Format
                      <span className="text-red-500">*</span>
                    </Label>
                    <textarea
                      className="w-full mt-2 rounded-lg border border-gray-300 px-4 py-3 min-h-[100px] text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      placeholder="Describe the expected output..."
                    />
                  </div>
                </div>

                {/* Test Cases */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Test Cases
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addTestCase}
                      className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Test Case
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {testCases.map((tc, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-[#3DBFD9] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {i + 1}
                            </div>
                            <span className="text-sm font-medium text-gray-700">Test Case #{i + 1}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTestCase(i)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Input</Label>
                            <textarea
                              className="w-full mt-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              rows={3}
                              value={tc.input}
                              onChange={(e) => updateTestCase(i, { input: e.target.value })}
                              placeholder="Input data..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Expected Output</Label>
                            <textarea
                              className="w-full mt-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              rows={3}
                              value={tc.output}
                              onChange={(e) => updateTestCase(i, { output: e.target.value })}
                              placeholder="Expected output..."
                            />
                          </div>
                          <div>
                            <Label className="text-xs font-medium text-gray-700">Explanation (optional)</Label>
                            <textarea
                              className="w-full mt-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              rows={3}
                              value={tc.explanation}
                              onChange={(e) => updateTestCase(i, { explanation: e.target.value })}
                              placeholder="Explanation..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Starter Code */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      <FileCode className="w-4 h-4" />
                      Starter Code
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addStarter}
                      className="border-[#3DBFD9] text-[#3DBFD9] hover:bg-[#3DBFD9]/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Language
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {starterCode.map((st, i) => (
                      <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-4 hover:border-[#3DBFD9]/30 hover:bg-[#3DBFD9]/5 transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Label className="text-sm font-medium text-gray-700">Language</Label>
                            <select
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-[#3DBFD9] focus:ring-1 focus:ring-[#3DBFD9]"
                              value={st.language}
                              onChange={(e) => updateStarter(i, { language: e.target.value })}
                            >
                              <option value="javascript">JavaScript</option>
                              <option value="python">Python</option>
                              <option value="cpp">C++</option>
                              <option value="java">Java</option>
                            </select>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStarter(i)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-gray-700">Code</Label>
                          <textarea
                            className="w-full mt-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all bg-gray-50"
                            rows={6}
                            value={st.code}
                            onChange={(e) => updateStarter(i, { code: e.target.value })}
                            placeholder={`function solution() {\n  // Your code here\n}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                    Solution
                    <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    className="w-full mt-2 min-h-[160px] rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-gray-50"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Provide the solution code..."
                  />
                </div>

                {/* Tags */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      Tags
                      <span className="text-xs text-gray-500 font-normal">(comma separated)</span>
                    </Label>
                    <Input
                      value={tagsText}
                      onChange={(e) => setTagsText(e.target.value)}
                      className="mt-2 h-10 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="array, sorting, greedy"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      Company Tags
                      <span className="text-xs text-gray-500 font-normal">(comma separated)</span>
                    </Label>
                    <Input
                      value={companyTagsText}
                      onChange={(e) => setCompanyTagsText(e.target.value)}
                      className="mt-2 h-10 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="Google, Amazon, Microsoft"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-1.5">
                      <FileCode className="w-4 h-4" />
                      Languages Supported
                      <span className="text-xs text-gray-500 font-normal">(comma separated)</span>
                    </Label>
                    <Input
                      value={languagesText}
                      onChange={(e) => setLanguagesText(e.target.value)}
                      className="mt-2 h-10 focus:border-emerald-500 focus:ring-emerald-500"
                      placeholder="javascript, python, cpp"
                    />
                  </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Required Fields</p>
                    <p className="text-blue-700">
                      Fields marked with <span className="text-red-500">*</span> are mandatory. 
                      Ensure all required information is filled before submitting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={closeModal}
                  type="button"
                  className="border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-emerald-600 to-[#3DBFD9] hover:from-emerald-700 hover:to-[#34aac3] text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 min-w-[140px]"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      {selected ? "Save Changes" : "Create Question"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}