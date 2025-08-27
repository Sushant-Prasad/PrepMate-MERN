// src/pages/DSA.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { useDSAQuestions } from "@/services/DSAServices";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

// Helper function to get difficulty color
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case "easy":
      return "text-green-600 bg-green-50 border-green-200";
    case "medium":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "hard":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export default function DSA() {
  const navigate = useNavigate();
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error } = useDSAQuestions({}, { keepPreviousData: true });
  const questions = data?.data || [];

  // Unique tag list computed from all questions
  const tags = useMemo(() => {
    const t = new Set();
    for (const q of questions) {
      (q.tags || []).forEach((tag) => tag && t.add(tag.trim()));
    }
    return ["all", ...Array.from(t).sort((a, b) => a.localeCompare(b))];
  }, [questions]);

  // Filters
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      const byTag =
        selectedTag === "all" ||
        (q.tags || [])
          .map((t) => (t || "").toLowerCase())
          .includes(selectedTag.toLowerCase());
      const byDiff =
        selectedDifficulty === "all" ||
        (q.difficulty || "").toLowerCase() === selectedDifficulty;
      const inText =
        !term ||
        (q.title || "").toLowerCase().includes(term) ||
        (q.description || "").toLowerCase().includes(term) ||
        (q.companyTags || []).some((t) => (t || "").toLowerCase().includes(term)) ||
        (q.tags || []).some((t) => (t || "").toLowerCase().includes(term));
      return byTag && byDiff && inText;
    });
  }, [questions, selectedTag, selectedDifficulty, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">DSA Practice</h1>
          <p className="text-gray-600 mt-1">Browse topics on the left, filter problems, and click a problem to solve it.</p>
        </motion.div>

        {/* Responsive Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[260px_1fr] lg:gap-6 lg:items-start">
          {/* Mobile: Topics as horizontal scroll */}
          <div className="lg:hidden">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Topics</CardTitle>
              </CardHeader>
              <ScrollArea className="w-full">
                <CardContent className="pt-0 pb-3">
                  <div className="flex gap-2 min-w-max pb-1">
                    {tags.slice(0, 10).map((tag) => (
                      <Button
                        key={tag}
                        variant={selectedTag === tag ? "default" : "outline"}
                        className="shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Desktop: LEFT Topics/Tags */}
          <Card className="hidden lg:block lg:sticky lg:top-6 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Topics</CardTitle>
              <p className="text-xs text-gray-500">Choose a tag to filter problems</p>
            </CardHeader>
            <ScrollArea className="h-[70vh]">
              <CardContent className="pt-0 pr-2">
                <div className="flex flex-col gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* CENTER: Problem List */}
          <div className="min-h-0">
            <Card className="shadow-sm overflow-hidden h-[60vh] sm:h-[65vh] lg:h-[70vh] flex flex-col">
              <CardHeader className="flex flex-col gap-3 shrink-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Problems</CardTitle>
                  <Badge variant="secondary">{filtered.length} shown</Badge>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Search problems..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <RadioGroup
                    value={selectedDifficulty}
                    onValueChange={setSelectedDifficulty}
                    className="flex items-center gap-2 sm:gap-3"
                  >
                    {DIFFICULTIES.map((d) => (
                      <div key={d} className="flex items-center space-x-1">
                        <RadioGroupItem id={`diff-${d}`} value={d} />
                        <Label htmlFor={`diff-${d}`} className="capitalize text-xs sm:text-sm cursor-pointer">
                          {d}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </CardHeader>
              <Separator />

              <ScrollArea className="flex-1">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 sm:p-6 text-sm text-gray-500">Loading questions…</div>
                  ) : isError ? (
                    <div className="p-4 sm:p-6 text-sm text-red-600">{error?.message || "Failed to load questions"}</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-4 sm:p-6 text-sm text-gray-500">No questions found.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filtered.map((q, index) => (
                        <ProblemListItem 
                          key={q._id} 
                          q={q} 
                          index={index + 1}
                          onClick={() => navigate(`/dsa/submit/${q._id}`)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemListItem({ q, index, onClick }) {
  return (
    <div
      className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-transparent hover:border-l-indigo-400"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xs sm:text-sm text-gray-400 font-mono w-6 sm:w-8 shrink-0">
          {index}
        </span>
        <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate hover:text-indigo-600 transition-colors">
          {q.title}
        </h3>
      </div>
      <Badge 
        variant="outline" 
        className={`capitalize text-xs shrink-0 ml-3 ${getDifficultyColor(q.difficulty)}`}
      >
        {q.difficulty}
      </Badge>
    </div>
  );
}
