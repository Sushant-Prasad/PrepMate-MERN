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
        navigate("/"); // redirect non-admins away
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
  const [selected, setSelected] = useState(null); // question being edited

  // form fields
  const [statement, setStatement] = useState("");
  const [options, setOptions] = useState(() =>
    DEFAULT_OPTION_KEYS.map((k) => ({ key: k, text: "" }))
  ); // array [{key: 'A', text: ''}, ...]
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
      toast.success("Question created");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.message || "Create failed");
    },
  });

  const updateMut = useUpdateAptiQuestion({
    onSuccess: () => {
      toast.success("Question updated");
      refetch();
      closeModal();
    },
    onError: (err) => {
      toast.error(err?.message || "Update failed");
    },
  });

  const deleteMut = useDeleteAptiQuestion({
    onSuccess: () => {
      toast.success("Question deleted");
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
        (Array.isArray(it.companyTags) ? it.companyTags.join(" ").toLowerCase() : String(it.companyTags || "").toLowerCase()).includes(q)
      );
    });
  }, [questions, query]);

  // helpers for options array
  const setOptionText = (key, text) =>
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, text } : o)));

  const addOption = () =>
    setOptions((prev) => {
      // pick next letter after last
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
    // convert Map/object to options array
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
    // basic validation
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
      options: optionsObj, // backend accepts plain object -> Map
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
      // errors handled in onError of mutations
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading aptitude questions…</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Failed to load: {String(error?.message ?? error)}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Input placeholder="Search statement / subcategory / company…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-72" />
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
                    <th className="py-2 px-3">Statement</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Subcategory</th>
                    <th className="py-2 px-3">Company Tags</th>
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
                          <div className="font-medium">{(q.statement || "").slice(0, 140)}{(q.statement || "").length > 140 ? "…" : ""}</div>
                        </td>
                        <td className="py-3 px-3 align-top">
                          <Badge className="capitalize">{q.category}</Badge>
                        </td>
                        <td className="py-3 px-3 align-top">{q.subCategory}</td>
                        <td className="py-3 px-3 align-top">
                          {(q.companyTags || []).slice(0, 6).map((t, i) => (
                            <Badge key={i} variant="secondary" className="text-xs mr-1">{t}</Badge>
                          ))}
                        </td>
                        <td className="py-3 px-3 align-top">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(q)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(q)}>Delete</Button>
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

        <div className={`relative w-full max-w-3xl mx-4 transition-transform ${modalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}>
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">{selected ? "Edit Aptitude Question" : "Create Aptitude Question"}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={closeModal}>Close</Button>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4 max-h-[70vh] overflow-auto">
                <div>
                  <Label>Statement *</Label>
                  <textarea className="w-full rounded-md border px-3 py-2 min-h-[100px] text-sm" value={statement} onChange={(e) => setStatement(e.target.value)} />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label>Options (min 2)</Label>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" onClick={addOption}>Add Option</Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {options.map((opt) => (
                      <div key={opt.key} className="flex gap-2 items-start">
                        <div className="w-12">
                          <div className="text-xs font-medium">{opt.key}</div>
                        </div>
                        <textarea
                          rows={2}
                          className="flex-1 rounded-md border px-2 py-1 text-sm"
                          value={opt.text}
                          onChange={(e) => setOptionText(opt.key, e.target.value)}
                        />
                        <div className="w-24">
                          <button
                            type="button"
                            className="text-sm text-red-600 hover:underline"
                            onClick={() => removeOption(opt.key)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Answer *</Label>
                    <select value={answer} onChange={(e) => setAnswer(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2">
                      {options.map((o) => (
                        <option key={o.key} value={o.key}>{o.key}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Category *</Label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-2">
                      {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label>Subcategory *</Label>
                    <Input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} />
                  </div>
                </div>

                <div>
                  <Label>Solution / Explanation *</Label>
                  <textarea className="w-full mt-1 min-h-[120px] rounded-md border px-3 py-2 text-sm" value={solution} onChange={(e) => setSolution(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Company Tags (comma separated)</Label>
                    <Input value={companyTagsText} onChange={(e) => setCompanyTagsText(e.target.value)} />
                  </div>
                  <div>
                    <Label>Expected Time (sec)</Label>
                    <Input type="number" value={expectedTime} onChange={(e) => setExpectedTime(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <div className="text-sm text-gray-500">Fields marked * are required</div>
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
