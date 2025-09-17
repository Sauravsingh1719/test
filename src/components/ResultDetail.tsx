"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, XCircle, HelpCircle, ArrowLeft, BookOpen, Award, Clock, BarChart3, Plus, Minus } from "lucide-react";

type QReview = {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer: number; // -1 => unanswered
};

export default function ResultDetail({ resultId }: { resultId: string }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await axios.get(`/api/test/result/${resultId}`);
        if (res.data?.success) {
          if (!mounted) return;
          setData(res.data.data);
        } else {
          setError(res.data?.error || "Failed to load result");
        }
      } catch (err: any) {
        console.error(err);
        if (err.response?.status === 401) {
          if (confirm("Please login to view this result. Go to login?")) router.push("/auth/signin");
          return;
        }
        setError(err?.response?.data?.error || err?.message || "Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [resultId, router]);

  if (loading) {
    return (
      <div className="container max-w-4xl py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-40 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/test")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container max-w-2xl py-12">
        <Alert>
          <HelpCircle className="h-4 w-4" />
          <AlertTitle>No Data</AlertTitle>
          <AlertDescription>No result data available.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/test")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  const { result, test, questions } = data;
  const percentage = result.percentage;
  const scoreColor = percentage >= 80 ? "text-green-600" : percentage >= 60 ? "text-amber-600" : "text-red-600";

  // Calculate marks breakdown
  const marksCorrect = test.marks?.correct || 1;
  const marksWrong = test.marks?.wrong || 0;
  const marksUnanswered = test.marks?.unanswered || 0;

  const positiveMarks = result.correct * marksCorrect;
  const negativeMarks = result.wrong * marksWrong;
  const unansweredMarks = result.unanswered * marksUnanswered;
  const totalMarks = positiveMarks - negativeMarks + unansweredMarks;

  return (
    <div>
      <div className="container py-4 space-y-6 px-[15%]">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Test Results</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{test.title}</CardTitle>
            <CardDescription>{test.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Marks Breakdown Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Marks Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Correct Answers ({result.correct})</span>
                    <div className="flex items-center text-green-600">
                      <Plus className="h-3 w-3 mr-1" />
                      <span>{positiveMarks.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Wrong Answers ({result.wrong})</span>
                    <div className="flex items-center text-red-600">
                      <Minus className="h-3 w-3 mr-1" />
                      <span>{negativeMarks.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Unanswered ({result.unanswered})</span>
                    <div className="flex items-center text-gray-600">
                      <span>{unansweredMarks.toFixed(2)}</span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Score</span>
                    <span className={scoreColor}>{totalMarks.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div>Correct: {marksCorrect} mark(s) per question</div>
                  <div>Wrong: -{marksWrong} mark(s) per question</div>
                  <div>Unanswered: {marksUnanswered} mark(s) per question</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className={`text-2xl font-bold ${scoreColor}`}>{result.score}/{result.maxScore}</div>
                <div className="text-sm">Score</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className={`text-2xl font-bold ${scoreColor}`}>{result.percentage}%</div>
                <div className="text-sm">Percentage</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{result.correct}</div>
                <div className="text-sm">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{result.wrong}</div>
                <div className="text-sm">Wrong</div>
              </div>
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-700">{result.unanswered}</div>
                <div className="text-sm">Unanswered</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance</span>
                <span>{result.percentage}%</span>
              </div>
              <Progress value={result.percentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Needs Improvement</span>
                <span>Excellent</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => router.push("/test")} variant="outline" className="flex-1">
              <BookOpen className="mr-2 h-4 w-4" /> Back to Tests
            </Button>
            <Button onClick={() => router.push(`/test/${test._id}`)} className="flex-1">
              <Award className="mr-2 h-4 w-4" /> Retake Test
            </Button>
          </CardFooter>
        </Card>

        {/* Questions Review */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight">Question Review</h2>
          
          {questions.map((q: QReview, i: number) => {
            const userAns = q.userAnswer;
            const correctAns = q.correctAnswer;
            const isUnanswered = userAns === -1;
            const isCorrect = userAns === correctAns;
            
            return (
              <Card key={q._id} className={`${isCorrect ? "border-green-200" : "border-red-200"}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">Question {i + 1}</CardTitle>
                    <Badge 
                      variant={isCorrect ? "default" : "destructive"} 
                      className={isUnanswered ? "bg-amber-500" : ""}
                    >
                      {isUnanswered ? (
                        <>Unanswered</>
                      ) : isCorrect ? (
                        <>Correct</>
                      ) : (
                        <>Incorrect</>
                      )}
                    </Badge>
                  </div>
                  <CardDescription>{q.questionText}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {q.options.map((opt, oi) => {
                    const isUserAnswer = userAns === oi;
                    const isCorrectAnswer = correctAns === oi;
                    
                    return (
                      <div
                        key={oi}
                        className={`p-3 rounded-lg border flex items-start gap-3 ${
                          isCorrectAnswer
                            ? "border-green-500 bg-green-50"
                            : isUserAnswer
                            ? "border-red-500 bg-red-50"
                            : "border-muted"
                        }`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                          isCorrectAnswer 
                            ? "border-green-500 bg-green-500 text-white" 
                            : isUserAnswer
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-muted-foreground"
                        }`}>
                          {isCorrectAnswer || isUserAnswer ? (
                            isCorrectAnswer ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )
                          ) : (
                            <span className="text-xs font-medium">{String.fromCharCode(65 + oi)}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <span className="font-medium">{String.fromCharCode(65 + oi)}. </span>
                          {opt}
                          {isCorrectAnswer && (
                            <div className="text-green-600 text-sm font-medium mt-1">
                              Correct Answer
                            </div>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <div className="text-red-600 text-sm font-medium mt-1">
                              Your Answer
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {q.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <BarChart3 className="h-4 w-4" /> Explanation
                      </h4>
                      <p className="text-sm">{q.explanation}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}