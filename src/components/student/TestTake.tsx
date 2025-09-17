'use client';
import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, AlertCircle, CheckCircle, ArrowLeft, ArrowRight, BookOpen, CheckCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import FullScreenWrapper from '@/components/FullScreenWrapper';

type Question = { _id: string; questionText: string; options: string[] };
type TestPayload = {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  marks?: { correct: number; wrong: number; unanswered: number };
  questions: Question[];
};

export default function StudentTestTake({ testId }: { testId: string }) {
  const [test, setTest] = useState<TestPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [showNavigationConfirm, setShowNavigationConfirm] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const navigationAttemptRef = useRef<'back' | 'close' | null>(null);
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/test/${testId}`);
        if (res.data?.success) {
          if (!mounted) return;
          setTest(res.data.data);
          setAnswers(new Array(res.data.data.questions.length).fill(null));
          setTimeLeft(res.data.data.duration * 60);
          startTimeRef.current = new Date();
        } else {
          setError(res.data?.error || "Failed to load test");
        }
      } catch (err: any) {
        console.error("Error loading test:", err);
        const status = err?.response?.status;
        if (status === 401) {
          router.push(`/sign-in`);
          return;
        }
        setError(err?.response?.data?.error || err?.message || "Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { 
      mounted = false; 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [testId, router]);

  useEffect(() => {
    if (timeLeft === null) return;
    
    timerRef.current = window.setInterval(() => {
      setTimeTaken(prev => prev + 1);
      setTimeLeft(prev => {
        if (!prev) return 0;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
    };
  }, [timeLeft !== null]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (test && !result && !submitting) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test progress may be lost.';
        return 'Are you sure you want to leave? Your test progress may be lost.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [test, result, submitting]);

  useEffect(() => {
    const handleNavigation = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && test && !result && !submitting) {
        e.preventDefault();
        navigationAttemptRef.current = 'back';
        setShowNavigationConfirm(true);
        setPendingNavigation(() => () => {
          window.location.href = link.href;
        });
      }
    };

    const handlePopState = () => {
      if (test && !result && !submitting) {
        navigationAttemptRef.current = 'back';
        setShowNavigationConfirm(true);
        setPendingNavigation(() => () => {
          window.history.back();
        });
        window.history.pushState(null, '', window.location.href);
      }
    };

    document.addEventListener('click', handleNavigation);
    window.addEventListener('popstate', handlePopState);
    
    window.history.pushState(null, '', window.location.href);
    
    return () => {
      document.removeEventListener('click', handleNavigation);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [test, result, submitting, router, pathname]);

  const handleNavigationConfirm = useCallback(async (confirm: boolean) => {
    if (confirm && pendingNavigation) {
      await handleSubmit();
      pendingNavigation();
    } else {
      setShowNavigationConfirm(false);
      setPendingNavigation(null);
      navigationAttemptRef.current = null;
    }
  }, [pendingNavigation]);

  const handleBackButton = () => {
    if (test && !result && !submitting) {
      navigationAttemptRef.current = 'back';
      setShowNavigationConfirm(true);
      setPendingNavigation(() => () => router.push("/tests"));
      return;
    }
    router.push("/tests");
  };

  useEffect(() => {
    if (showNavigationConfirm && navigationAttemptRef.current) {
      const action = navigationAttemptRef.current === 'back' ? 'go back' : 'close this page';
      
      toast.warning('Are you sure you want to leave?', {
        description: 'Your test progress will be submitted if you leave.',
        duration: 10000,
        action: {
          label: 'Submit & Leave',
          onClick: () => handleNavigationConfirm(true)
        },
        cancel: {
          label: 'Continue Test',
          onClick: () => handleNavigationConfirm(false)
        }
      });
    }
  }, [showNavigationConfirm, handleNavigationConfirm]);

  function formatTime(sec: number) {
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function chooseOption(qIndex: number, optIndex: number) {
    setAnswers(prev => {
      const copy = [...prev];
      copy[qIndex] = optIndex;
      return copy;
    });
  }

  function navigateQuestion(direction: 'next' | 'prev') {
    if (direction === 'next' && currentQuestionIndex < (test?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }

  function jumpToQuestion(index: number) {
    if (index >= 0 && index < (test?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  }

  const handleSubmit = async () => {
    if (!test || submitting || result) return;
    
    const finalTimeTaken = timeTaken;
    
    setSubmitting(true);
    setError(null);
    try {
      const payload = { 
        testId: test._id, 
        answers,
        timeTaken: finalTimeTaken
      };
      
      const res = await axios.post("/api/test/submit", payload);
      if (res.data?.success) {
        setResult(res.data.data);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        toast.success("Test submitted successfully!");
      } else {
        if (res.data?.error && res.data.error.toLowerCase().includes("unauthorized")) {
          if (confirm("You must be logged in to submit. Go to login page?")) {
            const callback = encodeURIComponent(`/test/${testId}`);
            router.push(`/auth/signin?callbackUrl=${callback}`);
          }
        } else {
          setError(res.data?.error || "Submission failed");
          toast.error(res.data?.error || "Submission failed");
        }
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      if (err.response?.status === 401) {
        const callback = encodeURIComponent(`/test/${testId}`);
        router.push(`/auth/signin?callbackUrl=${callback}`);
        return;
      }
      setError(err?.response?.data?.error || err?.message || "Network error");
      toast.error(err?.response?.data?.error || err?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <FullScreenWrapper>
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto" />
            <p className="mt-4 text-gray-600">Loading test...</p>
          </div>
        </div>
      </FullScreenWrapper>
    );
  }

  if (error) {
    return (
      <FullScreenWrapper>
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full mx-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push("/test")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
              </Button>
            </div>
          </div>
        </div>
      </FullScreenWrapper>
    );
  }

  if (!test) {
    return (
      <FullScreenWrapper>
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full mx-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Test Not Found</AlertTitle>
              <AlertDescription>The requested test could not be found.</AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button onClick={() => router.push("/test")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
              </Button>
            </div>
          </div>
        </div>
      </FullScreenWrapper>
    );
  }

  if (result) {
    const resultId = result.resultId || result.result_id || result._id || result.result || result.id;
    return (
      <FullScreenWrapper>
        <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="max-w-2xl w-full">
            <Card>
              <CardHeader className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <CardTitle>Test Submitted Successfully!</CardTitle>
                <CardDescription>{test.title}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.score}/{result.maxScore}</div>
                    <div className="text-sm">Score</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{result.percentage}%</div>
                    <div className="text-sm">Percentage</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-700">{result.correct}</div>
                    <div className="text-sm">Correct</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-700">{result.wrong}</div>
                    <div className="text-sm">Wrong</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-gray-700">{result.unanswered}</div>
                    <div className="text-sm">Unanswered</div>
                  </div>
                </div>
                
                {result.timeTaken && (
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-700">
                      {formatTime(result.timeTaken)}
                    </div>
                    <div className="text-sm">Time Taken</div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                {resultId && (
                  <Button 
                    onClick={() => router.push(`/test/result/${resultId}`)}
                    className="w-full"
                  >
                    <CheckCheck className="mr-2 h-4 w-4" /> View Detailed Results
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/test")}
                  className="w-full"
                >
                  <BookOpen className="mr-2 h-4 w-4" /> Back to Tests
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </FullScreenWrapper>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const answeredQuestions = answers.filter(a => a !== null).length;

  return (
    <FullScreenWrapper>
      <div className="h-screen bg-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <Button variant="outline" size="sm" onClick={handleBackButton} className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tests
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{test.title}</h1>
                {test.description && <p className="text-muted-foreground">{test.description}</p>}
              </div>
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft && timeLeft < 300 ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <Clock className="h-5 w-5" />
                <span className="text-lg font-mono font-bold">
                  {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Question {currentQuestionIndex + 1} of {test.questions.length}</span>
                      <span>{answeredQuestions} of {test.questions.length} answered</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {currentQuestionIndex + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-6 text-lg">{currentQuestion.questionText}</p>
                    
                    <div className="space-y-3">
                      {currentQuestion.options.map((opt, oi) => {
                        const selected = answers[currentQuestionIndex] === oi;
                        return (
                          <div
                            key={oi}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              selected
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                            }`}
                            onClick={() => chooseOption(currentQuestionIndex, oi)}
                          >
                            <div className="flex items-center">
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                              }`}>
                                {selected && <div className="w-3 h-3 rounded-full bg-current" />}
                              </div>
                              <span>{opt}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => navigateQuestion('prev')}
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      onClick={() => navigateQuestion('next')}
                      disabled={currentQuestionIndex === test.questions.length - 1}
                    >
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <h3 className="font-medium">Ready to submit?</h3>
                        <p className="text-sm text-muted-foreground">
                          Make sure you've answered all questions before submitting.
                        </p>
                      </div>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={submitting}
                        className="min-w-32"
                      >
                        {submitting ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Submitting...
                          </>
                        ) : (
                          "Submit Test"
                        )}
                      </Button>
                    </div>
                    </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" /> Time Remaining
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold text-center font-mono ${
                      timeLeft && timeLeft < 300 ? 'text-amber-600' : 'text-blue-600'
                    }`}>
                      {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                    </div>
                    {timeLeft && timeLeft < 300 && (
                      <p className="text-center text-amber-600 text-sm mt-2">
                        Less than 5 minutes remaining!
                      </p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-center text-blue-800 text-sm">
                        Time taken: {formatTime(timeTaken)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Questions</CardTitle>
                    <CardDescription>
                      Click to jump to any question
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-2">
                      {test.questions.map((_, index) => (
                        <Button
                          key={index}
                          variant={currentQuestionIndex === index ? "default" : answers[index] !== null ? "outline" : "ghost"}
                          size="sm"
                          className={`h-10 w-10 p-0 ${
                            currentQuestionIndex === index 
                              ? "" 
                              : answers[index] !== null 
                                ? "border-green-500 text-green-500" 
                                : ""
                          }`}
                          onClick={() => jumpToQuestion(index)}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Test Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Questions</span>
                      <span className="font-medium">{test.questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{test.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Answered</span>
                      <span className="font-medium text-green-600">{answeredQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unanswered</span>
                      <span className="font-medium text-amber-600">{test.questions.length - answeredQuestions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time Taken</span>
                      <span className="font-medium text-blue-600">{formatTime(timeTaken)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullScreenWrapper>
  );
}