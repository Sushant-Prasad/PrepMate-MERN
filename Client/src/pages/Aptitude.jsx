// src/pages/Aptitude.jsx
import { useEffect, useMemo, useState } from "react";
import { useAptiQuestions } from "@/services/aptitudeServices";
import { motion } from "framer-motion";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = ["Numerical Ability", "Reasoning", "Verbal Ability"];

// Abbreviated versions for very small screens
const getCategoryDisplay = (cat, isSmall = false) => {
  if (!isSmall) return cat;
  const abbreviations = {
    "Numerical Ability": "Numerical",
    "Reasoning": "Reasoning", 
    "Verbal Ability": "Verbal"
  };
  return abbreviations[cat] || cat;
};

export default function Aptitude() {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedSub, setSelectedSub] = useState(null);

  // Fetch all questions of the selected category (we'll derive subcategories from this)
  const { data, isLoading, isError } = useAptiQuestions(
    { category: selectedCategory },
    { keepPreviousData: true }
  );

  const questions = data?.data || [];

  // Unique subCategories
  const subCategories = useMemo(() => {
    const set = new Set(questions.map((q) => q.subCategory).filter(Boolean));
    return Array.from(set).sort();
  }, [questions]);

  // Auto-select first subcategory when category changes or data loads
  useEffect(() => {
    if (!selectedSub && subCategories.length > 0) setSelectedSub(subCategories[0]);
  }, [selectedSub, subCategories]);

  // Questions of the selected subCategory
  const filteredQuestions = useMemo(() => {
    if (!selectedSub) return [];
    return questions.filter((q) => q.subCategory === selectedSub);
  }, [questions, selectedSub]);

  // Reset subCategory when category changes
  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedSub(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
            Aptitude Practice
          </h1>
          <p className="text-gray-600 mt-1">
            Pick a category → expand subcategories → view and solve questions.
          </p>
        </motion.div>

        {/* Responsive Layout */}
        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-[260px_1fr_300px] lg:gap-6 lg:items-start">
          {/* Mobile/Tablet: Categories as horizontal scroll */}
          <div className="lg:hidden">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Categories</CardTitle>
              </CardHeader>
              <ScrollArea className="w-full">
                <CardContent className="pt-0 pb-3">
                  <div className="flex gap-2 min-w-max pb-1">
                    {CATEGORIES.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        className="shrink-0 whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 py-2 h-auto min-w-0"
                        onClick={() => handleSelectCategory(cat)}
                      >
                        <span className="block sm:hidden">
                          {getCategoryDisplay(cat, true)}
                        </span>
                        <span className="hidden sm:block">
                          {getCategoryDisplay(cat, false)}
                        </span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Mobile/Tablet: Subcategories as collapsible section */}
          <div className="lg:hidden">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">
                  Subcategories
                  {selectedSub && (
                    <Badge variant="secondary" className="ml-2">
                      {filteredQuestions.length} question{filteredQuestions.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <ScrollArea className="max-h-[40vh]">
                <CardContent>
                  {isLoading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                  ) : subCategories.length === 0 ? (
                    <div className="text-sm text-gray-500">No subcategories.</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subCategories.map((sub) => (
                        <Button
                          key={sub}
                          variant={selectedSub === sub ? "default" : "outline"}
                          className="justify-start text-left h-auto py-2 px-3"
                          onClick={() => setSelectedSub(sub)}
                        >
                          <span className="truncate">{sub}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Desktop: LEFT Categories (sticky + scrollable) */}
          <Card className="hidden lg:block lg:sticky lg:top-6 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[70vh]">
              <CardContent className="pt-0">
                <div className="flex flex-col gap-2 pr-2">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => handleSelectCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>

          {/* CENTER: Questions list - Responsive scrolling */}
          <div className="min-h-0">
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <CardTitle className="text-base sm:text-lg">
                  {selectedSub ? (
                    <>
                      <span className="hidden sm:inline">
                        {selectedCategory} <span className="text-gray-400">/</span>{" "}
                      </span>
                      <span className="text-indigo-600">{selectedSub}</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden lg:inline">Pick a subcategory on the right</span>
                      <span className="lg:hidden">Pick a subcategory above</span>
                    </>
                  )}
                </CardTitle>
                {selectedSub && (
                  <Badge variant="secondary" className="hidden sm:inline-flex">
                    {filteredQuestions.length} question
                    {filteredQuestions.length !== 1 ? "s" : ""}
                  </Badge>
                )}
              </CardHeader>
              <Separator />
              
              {/* Responsive height: more space on mobile, calculated on desktop */}
              <ScrollArea className="h-[60vh] sm:h-[65vh] lg:h-[calc(100vh-200px)]">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-4 sm:p-6 text-sm text-gray-500">Loading questions…</div>
                  ) : isError ? (
                    <div className="p-4 sm:p-6 text-sm text-red-600">
                      Failed to load questions. Please try again.
                    </div>
                  ) : !selectedSub ? (
                    <div className="p-4 sm:p-6 text-sm text-gray-500">
                      <span className="hidden lg:inline">Select a subcategory to view its questions.</span>
                      <span className="lg:hidden">Select a subcategory above to view its questions.</span>
                    </div>
                  ) : filteredQuestions.length === 0 ? (
                    <div className="p-4 sm:p-6 text-sm text-gray-500">No questions found.</div>
                  ) : (
                    <div className="p-3 sm:p-4 space-y-4 sm:space-y-6 pr-2">
                      {filteredQuestions.map((q) => (
                        <QuestionCard key={q._id} question={q} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </div>

          {/* Desktop: RIGHT Subcategories (sticky + scrollable) */}
          <Card className="hidden lg:block lg:sticky lg:top-6 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg">Subcategories</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[70vh]">
              <CardContent>
                {isLoading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : subCategories.length === 0 ? (
                  <div className="text-sm text-gray-500">No subcategories.</div>
                ) : (
                  <Accordion
                    type="multiple"
                    defaultValue={groupByFirstLetter(subCategories).map((g) => `item-${g.letter}`)}
                    className="w-full pr-2"
                  >
                    {groupByFirstLetter(subCategories).map(({ letter, items }) => (
                      <AccordionItem key={letter} value={`item-${letter}`}>
                        <AccordionTrigger className="text-sm">{letter}</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-2">
                            {items.map((sub) => (
                              <Button
                                key={sub}
                                variant={selectedSub === sub ? "default" : "outline"}
                                className="w-full justify-start"
                                onClick={() => setSelectedSub(sub)}
                              >
                                {sub}
                              </Button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Helpers & Subcomponents ---------------------- */

function groupByFirstLetter(list) {
  const map = new Map();
  for (const item of list) {
    const letter = item?.[0]?.toUpperCase() || "#";
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(item);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, items]) => ({ letter, items: items.sort((a, b) => a.localeCompare(b)) }));
}

function QuestionCard({ question }) {
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const opts = toPlainOptions(question.options);

  const handleSubmit = () => setSubmitted(true);

  return (
    <Card className="border rounded-xl">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-sm sm:text-base leading-relaxed">
          {question.statement}
          <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
            <Badge variant="outline" className="text-xs">{question.category}</Badge>
            <Badge variant="outline" className="text-xs">{question.subCategory}</Badge>
            {question.expectedTime ? (
              <Badge variant="secondary" className="text-xs">{question.expectedTime}s</Badge>
            ) : null}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <RadioGroup value={choice} onValueChange={setChoice} className="space-y-2 sm:space-y-3">
          {opts.map(({ key, value }) => (
            <div key={key} className="flex items-start space-x-2 sm:space-x-3">
              <RadioGroupItem 
                id={`${question._id}-${key}`} 
                value={key} 
                className="mt-0.5 shrink-0"
              />
              <Label 
                htmlFor={`${question._id}-${key}`} 
                className="cursor-pointer text-sm sm:text-base leading-relaxed"
              >
                <span className="font-medium">{key}.</span> {value}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            className="rounded-lg w-full sm:w-auto" 
            onClick={handleSubmit} 
            disabled={!choice || submitted}
          >
            Submit
          </Button>
          {submitted && (
            <div className="flex items-center text-sm">
              {choice === question.answer ? (
                <span className="text-green-600 font-medium">✅ Correct</span>
              ) : (
                <span className="text-red-600 font-medium">
                  ❌ Incorrect. Correct: {question.answer}
                </span>
              )}
            </div>
          )}
        </div>

        {submitted && question.solution && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs sm:text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Solution:</span> {question.solution}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function toPlainOptions(options) {
  if (!options) return [];
  return Object.entries(options).map(([key, value]) => ({ key, value }));
}