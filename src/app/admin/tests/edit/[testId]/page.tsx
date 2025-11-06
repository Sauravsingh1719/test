'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Question {
  _id?: string;
  tempId?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Test {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  questions: Question[];
  marks?: {
    correct: number;
    wrong: number;
    unanswered: number;
  };
}

export default function EditTestPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.testId as string;
  
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (testId) {
      loadTest();
    }
  }, [testId]);

  const loadTest = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/test/${testId}`);
      if (res.data?.success) {
        setTest(res.data.data);
        
        // Initialize expanded state for questions
        const expandedState: Record<string, boolean> = {};
        res.data.data.questions.forEach((q: Question) => {
          expandedState[q._id || q.tempId || ''] = false;
        });
        setExpandedQuestions(expandedState);
      } else {
        setError(res.data?.error || "Failed to load test");
        toast.error(res.data?.error || "Failed to load test");
      }
    } catch (err: any) {
      console.error("Error loading test:", err);
      setError(err?.response?.data?.error || err?.message || "Network error");
      toast.error(err?.response?.data?.error || err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!test) return;
    
    // Validate questions before saving
    for (let i = 0; i < test.questions.length; i++) {
      const q = test.questions[i];
      if (!q.questionText || q.questionText.length < 10) {
        toast.error(`Question ${i+1} must be at least 10 characters`);
        return;
      }
      
      if (q.options.some((opt: string) => !opt.trim())) {
        toast.error(`All options must be filled in Question ${i+1}`);
        return;
      }
      
      if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer > 3) {
        toast.error(`Question ${i+1} must have a valid correct answer (0-3)`);
        return;
      }
    }
    
    try {
      setSaving(true);
      const res = await axios.put(`/api/test/${testId}`, test);
      if (res.data?.success) {
        toast.success("Test updated successfully");
        router.push("/admin/tests");
      } else {
        toast.error(res.data?.error || "Failed to update test");
      }
    } catch (err: any) {
      console.error("Error updating test:", err);
      toast.error(err?.response?.data?.error || err?.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    if (!test) return;
    
    const newQuestion: Question = {
      tempId: Date.now().toString(),
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      explanation: ""
    };
    
    setTest({
      ...test,
      questions: [...test.questions, newQuestion]
    });
    
    // Expand the new question
    setExpandedQuestions({
      ...expandedQuestions,
      [newQuestion.tempId]: true
    });
  };

  const removeQuestion = (index: number) => {
    if (!test) return;
    
    if (test.questions.length <= 5) {
      toast.error("A test must have at least 5 questions");
      return;
    }
    
    const newQuestions = [...test.questions];
    const removedQuestion = newQuestions.splice(index, 1)[0];
    
    setTest({
      ...test,
      questions: newQuestions
    });
    
    // Remove from expanded state
    const newExpanded = {...expandedQuestions};
    delete newExpanded[removedQuestion._id || removedQuestion.tempId || ''];
    setExpandedQuestions(newExpanded);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    if (!test) return;
    
    const newQuestions = [...test.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    
    // Ensure correctAnswer is always a number between 0-3
    if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = Math.max(0, Math.min(3, Number(value)));
    }
    
    setTest({
      ...test,
      questions: newQuestions
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    if (!test) return;
    
    const newQuestions = [...test.questions];
    const newOptions = [...newQuestions[qIndex].options];
    newOptions[oIndex] = value;
    
    newQuestions[qIndex] = {
      ...newQuestions[qIndex],
      options: newOptions
    };
    
    setTest({
      ...test,
      questions: newQuestions
    });
  };

  const toggleQuestionExpansion = (qId: string) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [qId]: !expandedQuestions[qId]
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Test not found"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin/tests")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/admin/tests")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Test</h1>
          <p className="text-muted-foreground">Update test details and questions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Information</CardTitle>
          <CardDescription>Update the basic information about your test</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={test.title}
              onChange={(e) => setTest({ ...test, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={test.description}
              onChange={(e) => setTest({ ...test, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={test.duration}
                onChange={(e) => setTest({ ...test, duration: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marksCorrect">Marks for Correct Answer</Label>
              <Input
                id="marksCorrect"
                type="number"
                value={test.marks?.correct || 1}
                onChange={(e) => setTest({
                  ...test,
                  marks: { 
                    ...test.marks, 
                    correct: Number(e.target.value),
                    wrong: test.marks?.wrong || 0,
                    unanswered: test.marks?.unanswered || 0
                  }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marksWrong">Marks for Wrong Answer</Label>
              <Input
                id="marksWrong"
                type="number"
                value={test.marks?.wrong || 0}
                onChange={(e) => setTest({
                  ...test,
                  marks: { 
                    ...test.marks, 
                    correct: test.marks?.correct || 1,
                    wrong: Number(e.target.value),
                    unanswered: test.marks?.unanswered || 0
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Questions</CardTitle>
            <CardDescription>
              Manage your test questions ({test.questions.length} questions)
            </CardDescription>
          </div>
          <Button onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {test.questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No questions yet. Add your first question.</p>
            </div>
          ) : (
            test.questions.map((question, qIndex) => {
              const qId = question._id || question.tempId || '';
              const isExpanded = expandedQuestions[qId];
              
              return (
                <div key={qId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Question {qIndex + 1}</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleQuestionExpansion(qId)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(qIndex)}
                        disabled={test.questions.length <= 5}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${qId}`}>Question Text</Label>
                        <Textarea
                          id={`question-${qId}`}
                          value={question.questionText}
                          onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                          placeholder="Enter your question here..."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {question.options.map((option: string, oIndex: number) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <div className="w-6 flex-shrink-0">
                              {oIndex === question.correctAnswer ? (
                                <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                                  ✓
                                </div>
                              ) : (
                                <div className="h-6 w-6 rounded-full border flex items-center justify-center text-xs">
                                  {oIndex + 1}
                                </div>
                              )}
                            </div>
                            <Input
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                            />
                            <Button
                              variant={oIndex === question.correctAnswer ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestion(qIndex, 'correctAnswer', oIndex)}
                            >
                              {oIndex === question.correctAnswer ? "Correct" : "Set Correct"}
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`explanation-${qId}`}>Explanation (Optional)</Label>
                        <Textarea
                          id={`explanation-${qId}`}
                          value={question.explanation || ""}
                          onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                          placeholder="Explain why this answer is correct..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin/tests")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}