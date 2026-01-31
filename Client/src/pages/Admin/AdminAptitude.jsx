// src/pages/AdminAptitude.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useAptiQuestions,
  useCreateAptiQuestion,
  useUpdateAptiQuestion,
  useDeleteAptiQuestion,
} from "@/services/aptitudeServices";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import {
  Brain,
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
} from "lucide-react";

const DEFAULT_OPTION_KEYS = ["A", "B", "C", "D"];
const CATEGORY_OPTIONS = ["Numerical Ability", "Reasoning", "Verbal Ability"];

export default function AdminAptitude() {
  const navigate = useNavigate();
  
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) {
        navigate("/login");
        return;
      }
      const user = JSON.parse(raw);
      const role = (user?.role || "").toLowerCase();
      if (role !== "admin") {
        navigate("/");
      }
    } catch (e) {
      navigate("/login");
    }
  }, [navigate]);

  const { data: listResp, isLoading, isError, error, refetch } = useAptiQuestions();
  const questions = listResp?.data ?? listResp ?? [];

  // UI state
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // form fields
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState(() =>
    DEFAULT_OPTION_KEYS.map((k) => ({ key: k, text: "" }))
  );
  const [answer, setAnswer] = useState("A");
  const [solution, setSolution] = useState("");
  const [companyTagsText, setCompanyTagsText] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [subCategory, setSubCategory] = useState("");
  const [expectedTime, setExpectedTime] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  // mutations
  const createMut = useCreateAptiQuestion({
    onSuccess: () => {
      toast.success("Question created successfully!");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.message || "Create failed");
    },
  });

  const updateMut = useUpdateAptiQuestion({
    onSuccess: () => {
      toast.success("Question updated successfully!");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.message || "Update failed");
    },
  });

  const deleteMut = useDeleteAptiQuestion({
    onSuccess: () => {
      toast.success("Question deleted successfully!");
      refetch();
    },
    onError: (err) => {
      toast.error(err?.message || "Delete failed");
    },
  });

  // filtered list
  const filtered = useMemo(() => {
    if (!query.trim()) return questions;
    const q = query.trim().toLowerCase();
    return (questions || []).filter((it) => {
      return (
        (it.statement || "").toLowerCase().includes(q) ||
        (it.subCategory || "").toLowerCase().includes(q) ||
        (Array.isArray(it.companyTags) 
          ? it.companyTags.join(" ").toLowerCase() 
          : String(it.companyTags || "").toLowerCase()
        ).includes(q)
      );
    });
  }, [questions, query]);

  // helpers for options array
  const setOptionText = (key, text) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));

  const addOption = () =>
    setOptions((prev) => {
      const last = prev[prev.length - 1];
      const nextKey = last ? String.fromCharCode(last.key.charCodeAt(0) + 1) : "A";
      return [...prev, { key: nextKey, text: "" }];
    });

  const removeOption = (key) => setOptions((prev) => prev.filter((o) => o.key !== key));

  const resetForm = () => {
    setStatement("");
    setOptions(DEFAULT_OPTION_KEYS.map((k) => ({ key: k, text: "" })));
    setAnswer("A");
    setSolution("");
    setCompanyTagsText("");
    setCategory(CATEGORY_OPTIONS[0]);
    setSubCategory("");
    setExpectedTime(60);
    setSelected(null);
    setSubmitting(false);
  };

  const openCreateModal = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelected(item);
    setStatement(item.statement || "");
    const opts = item.options
      ? Object.entries(item.options).map(([k, v]) => ({ key: k, text: v }))
      : DEFAULT_OPTION_KEYS.map((k) => ({ key: k, text: "" }));
    setOptions(opts);
    setAnswer(item.answer || (opts[0]?.key ?? "A"));
    setSolution(item.solution || "");
    setCompanyTagsText(Array.isArray(item.companyTags) ? item.companyTags.join(", ") : item.companyTags || "");
    setCategory(item.category || CATEGORY_OPTIONS[0]);
    setSubCategory(item.subCategory || "");
    setExpectedTime(item.expectedTime ?? 60);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    
    if (!statement.trim()) {
      toast.error("Statement is required");
      return;
    }
    if (options.length < 2) {
      toast.error("At least two options are required");
      return;
    }
    
    const optionsObj = {};
    for (const o of options) {
      if (!o.key) continue;
      optionsObj[o.key] = o.text || "";
    }
    
    if (!optionsObj[answer]) {
      toast.error("Answer must point to an existing option");
      return;
    }
    if (!solution.trim()) {
      toast.error("Solution/explanation is required");
      return;
    }

    const payload = {
      statement: statement.trim(),
      options: optionsObj,
      answer,
      solution: solution.trim(),
      companyTags: companyTagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      category,
      subCategory: subCategory.trim(),
      expectedTime: Number(expectedTime) || 60,
    };

    setSubmitting(true);
    try {
      if (selected && (selected._id || selected.id)) {
        await updateMut.mutateAsync({ id: selected._id ?? selected.id, payload });
      } else {
        await createMut.mutateAsync(payload);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (item) => {
    const id = item._id ?? item.id;
    if (!id) return toast.error("Missing id");
    if (!window.confirm(`Delete question: "${item.statement?.slice(0, 80) ?? ""}" ?`)) return;
    deleteMut.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-[#3DBFD9] animate-pulse mx-auto mb-4" />
          <div className="text-gray-600 font-medium">Loading aptitude questions...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 font-medium">Failed to load: {String(error?.message ?? error)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#03045E] via-purple-600 to-[#3DBFD9] bg-clip-text text-transparent">
                    Aptitude Questions
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Manage and organize aptitude test questions
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="h-1 bg-gradient-to-r from-[#03045E] via-purple-500 to-[#3DBFD9] rounded-full" />
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by statement, subcategory, or company..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="border-[#3DBFD9] text-[#03045E] hover:bg-[#3DBFD9]/10 transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-[#3DBFD9] to-purple-500 hover:from-[#34aac3] hover:to-purple-600 text-white shadow-lg shadow-[#3DBFD9]/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </div>
        </div>

        {/* Questions Card */}
        <Card className="border-none shadow-xl bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-transparent pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold text-[#03045E]">All Questions</h3>
                  <p className="text-sm text-gray-500 font-normal mt-0.5">
                    Total: {(questions || []).length} questions
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700 border-none px-4 py-2">
                {filtered.length} shown
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs font-semibold text-gray-600 bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="py-4 px-6">Statement</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Subcategory</th>
                    <th className="py-4 px-6">Company Tags</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16">
                        <div className="text-center">
                          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-full mb-4">
                            <Brain className="w-10 h-10 text-purple-400" />
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
                        className="group hover:bg-purple-50/30 transition-colors duration-200"
                      >
                        <td className="py-4 px-6 align-top max-w-md">
                          <div className="font-medium text-[#03045E] group-hover:text-purple-600 transition-colors">
                            {(q.statement || "").slice(0, 140)}
                            {(q.statement || "").length > 140 ? "..." : ""}
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <Badge className="capitalize bg-purple-100 text-purple-700 border-purple-200">
                            {q.category}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <span className="text-gray-700">{q.subCategory || "—"}</span>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <div className="flex flex-wrap gap-1">
                            {(q.companyTags || []).slice(0, 3).map((t, i) => (
                              <Badge
                                key={i}
                                variant="secondary"
                                className="text-xs bg-[#3DBFD9]/10 text-[#3DBFD9] border-[#3DBFD9]/30"
                              >
                                {t}
                              </Badge>
                            ))}
                            {(q.companyTags || []).length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
                                +{(q.companyTags || []).length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(q)}
                              className="border-[#3DBFD9] text-[#3DBFD9] hover:bg-[#3DBFD9] hover:text-white transition-all duration-300"
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

          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#03045E]">
                    {selected ? "Edit Question" : "Create New Question"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selected ? "Update question details" : "Add a new aptitude question"}
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
            <form onSubmit={handleSubmit}>
              <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                
                {/* Statement */}
                <div>
                  <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                    Question Statement
                    <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    className="w-full mt-2 rounded-lg border border-gray-300 px-4 py-3 min-h-[120px] text-sm focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all"
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Enter the question statement..."
                  />
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Answer Options
                      <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 font-normal">(min 2 required)</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="border-[#3DBFD9] text-[#3DBFD9] hover:bg-[#3DBFD9]/10"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Option
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {options.map((opt, idx) => (
                      <div
                        key={opt.key}
                        className="flex gap-3 items-start p-4 rounded-lg border border-gray-200 hover:border-[#3DBFD9]/30 hover:bg-[#3DBFD9]/5 transition-all group"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#3DBFD9] to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {opt.key}
                        </div>
                        <textarea
                          rows={2}
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all"
                          value={opt.text}
                          onChange={(e) => setOptionText(opt.key, e.target.value)}
                          placeholder={`Option ${opt.key} text...`}
                        />
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(opt.key)}
                            className="text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category, Answer, Subcategory */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Correct Answer
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all"
                    >
                      {options.map((o) => (
                        <option key={o.key} value={o.key}>
                          Option {o.key}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Category
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      Subcategory
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="mt-2 h-10 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
                      placeholder="e.g., Percentages"
                    />
                  </div>
                </div>

                {/* Solution */}
                <div>
                  <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                    Solution / Explanation
                    <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    className="w-full mt-2 min-h-[140px] rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#3DBFD9] focus:ring-2 focus:ring-[#3DBFD9]/20 transition-all"
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Provide detailed explanation of the solution..."
                  />
                </div>

                {/* Company Tags & Expected Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Company Tags
                      <span className="text-xs text-gray-500 font-normal">(comma separated)</span>
                    </Label>
                    <Input
                      value={companyTagsText}
                      onChange={(e) => setCompanyTagsText(e.target.value)}
                      className="mt-2 h-10 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
                      placeholder="e.g., TCS, Infosys, Wipro"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-[#03045E] flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expected Time (seconds)
                    </Label>
                    <Input
                      type="number"
                      value={expectedTime}
                      onChange={(e) => setExpectedTime(e.target.value)}
                      className="mt-2 h-10 focus:border-[#3DBFD9] focus:ring-[#3DBFD9]"
                      placeholder="60"
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
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
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
                  className="bg-gradient-to-r from-[#3DBFD9] to-purple-500 hover:from-[#34aac3] hover:to-purple-600 text-white shadow-lg shadow-[#3DBFD9]/30 transition-all duration-300 min-w-[140px]"
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