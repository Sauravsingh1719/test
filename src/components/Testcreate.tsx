"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash2, ArrowLeft, CheckCircle, AlertCircle, Lock, User, Shield } from "lucide-react";
import { toast } from "sonner";

type Question = {
  questionText: string;
  options: string[]; 
  correctAnswer: number; 
  explanation?: string;
};

type Category = { _id: string; name: string };

interface TestCreateProps {
  userRole: string;
  userCategory?: string | { _id: string; name: string };
}

export default function TestCreate({ userRole, userCategory }: TestCreateProps) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState<number>(20);
  const [marksCorrect, setMarksCorrect] = useState<number>(1);
  const [marksWrong, setMarksWrong] = useState<number>(0);
  const [marksUnanswered, setMarksUnanswered] = useState<number>(0);

  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    }
  ]);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await axios.get("/api/categories");
        if (res.data?.success) {
          setCategories(res.data.data || []);
          
         
          if (userRole === "teacher" && userCategory) {
            
            const categoryId = typeof userCategory === "string" ? userCategory : userCategory._id;
            setCategory(categoryId);
          } else if (res.data.data?.length) {
           
            setCategory(res.data.data[0]._id);
          }
        } else {
          setError("Failed to load categories");
          toast.error("Failed to load categories");
        }
      } catch (err) {
        console.error(err);
        setError("Network error while loading categories");
        toast.error("Network error while loading categories");
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [userRole, userCategory]);

  function updateQuestion(index: number, newQ: Partial<Question>) {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...newQ };
      return copy;
    });
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = value;
      copy[qIndex] = { ...copy[qIndex], options: opts };
      return copy;
    });
  }

  function addQuestion() {
    setQuestions(prev => [
      ...prev,
      { questionText: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" }
    ]);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) {
      toast.error("A test must have at least one question");
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  }

  function validateForm() {
    setError(null);

    if (!title.trim()) return "Title is required";
    if (!category) return "Category is required";
    if (!Number.isFinite(duration) || duration <= 0) return "Duration must be a positive number";
    if (!Array.isArray(questions) || questions.length < 1) return "Add at least 1 question";

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || q.questionText.trim().length < 3) return `Question ${i + 1}: text too short`;
      if (!Array.isArray(q.options) || q.options.length !== 4) return `Question ${i + 1}: requires 4 options`;
      for (let j = 0; j < 4; j++) {
        if (!q.options[j] || q.options[j].trim() === "") return `Question ${i + 1}: option ${j + 1} is empty`;
      }
      if (typeof q.correctAnswer !== "number" || q.correctAnswer < 0 || q.correctAnswer > 3) return `Question ${i + 1}: choose the correct option`;
    }

    
    if (!Number.isFinite(marksCorrect)) return "Marks for correct must be a number";
    if (!Number.isFinite(marksWrong)) return "Marks for wrong must be a number";
    if (!Number.isFinite(marksUnanswered)) return "Marks for unanswered must be a number";

    return null;
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const vErr = validateForm();
    if (vErr) {
      setError(vErr);
      toast.error(vErr);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        description: description.trim(),
        duration: Number(duration),
        marks: {
          correct: Number(marksCorrect),
          wrong: Number(marksWrong),
          unanswered: Number(marksUnanswered)
        },
        questions: questions.map(q => ({
          questionText: q.questionText.trim(),
          options: q.options.map(o => o.trim()),
          correctAnswer: Number(q.correctAnswer),
          explanation: q.explanation?.trim() || ""
        }))
      };

      const res = await axios.post("/api/test", payload);
      if (res.data?.success) {
        setSuccessMsg("Test created successfully");
        toast.success("Test created successfully");
        
        setTimeout(() => {
          if (userRole === "teacher") {
            router.push("/teacher-dashboard");
          } else {
            router.push("/admin/tests");
          }
        }, 900);
      } else {
        setError(res.data?.error || res.data?.message || "Creation failed");
        toast.error(res.data?.error || res.data?.message || "Creation failed");
      }
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Network/server error";
      setError(String(msg));
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

 
  const getCategoryName = () => {
    if (userRole === "teacher" && userCategory) {
      if (typeof userCategory === "string") {
        return categories.find(c => c._id === userCategory)?.name || "Your assigned category";
      } else {
        return userCategory.name;
      }
    }
    return null;
  };

  return (
    <div className="container  py-[4%] space-y-6 lg:px-[15%] md:px-[10%] sm:px-[5%]">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Create New Test</h2>
        <div className="ml-auto flex items-center gap-2">
          {userRole === "admin" && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Admin Mode
            </span>
          )}
          {userRole === "teacher" && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
              <User className="h-3 w-3" />
              Teacher Mode
            </span>
          )}
          {userRole === "student" && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
              <User className="h-3 w-3" />
              Student Mode
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
            <CardDescription>Provide basic information about your test</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter test title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                {loadingCategories ? (
                  <div className="flex items-center justify-center h-10 border rounded-md">
                    <span className="text-sm text-muted-foreground">Loading categories...</span>
                  </div>
                ) : userRole === "teacher" ? (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {getCategoryName()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Teachers can only create tests in their assigned category
                    </p>
                  </div>
                ) : (
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe what this test is about"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  min={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marksCorrect">Marks for Correct Answer</Label>
                <Input
                  id="marksCorrect"
                  type="number"
                  value={marksCorrect}
                  onChange={e => setMarksCorrect(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marksWrong">Marks for Wrong Answer</Label>
                <Input
                  id="marksWrong"
                  type="number"
                  value={marksWrong}
                  onChange={e => setMarksWrong(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to your test ({questions.length})</CardDescription>
              </div>
              <Button type="button" onClick={addQuestion} className="gap-1">
                <Plus className="h-4 w-4" /> Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((q, qi) => (
              <Card key={qi} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Question {qi + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeQuestion(qi)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${qi}`}>Question Text</Label>
                    <Textarea
                      id={`question-${qi}`}
                      value={q.questionText}
                      onChange={e => updateQuestion(qi, { questionText: e.target.value })}
                      placeholder="Enter your question here"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Options (select the correct answer)</Label>
                    <RadioGroup
                      value={q.correctAnswer.toString()}
                      onValueChange={(value) => updateQuestion(qi, { correctAnswer: parseInt(value) })}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center space-x-3 rounded-md border p-3">
                          <RadioGroupItem value={oi.toString()} id={`option-${qi}-${oi}`} />
                          <Input
                            value={opt}
                            onChange={e => updateOption(qi, oi, e.target.value)}
                            placeholder={`Option ${oi + 1}`}
                            className="border-0 shadow-none focus-visible:ring-0"
                          />
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`explanation-${qi}`}>Explanation (optional)</Label>
                    <Textarea
                      id={`explanation-${qi}`}
                      value={q.explanation}
                      onChange={e => updateQuestion(qi, { explanation: e.target.value })}
                      placeholder="Explain why this answer is correct"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(userRole === "teacher" ? "/teacher-dashboard" : "/admin/tests")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="min-w-32"
          >
            {submitting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Test
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}