"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  const [result, setResult] = useState<any>(null); // will hold server response data (includes resultId)
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const router = useRouter();

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
    return () => { mounted = false; if (timerRef.current) clearInterval(timerRef.current); };
  }, [testId, router]);

  // timer
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      void handleSubmit(); // auto submit
      return;
    }
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (!prev) return 0;
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft !== null]);

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

  async function handleSubmit() {
    if (!test || submitting || result) return;
    // confirm only for manual submit; auto submit (timer) skips confirm
    if (timeLeft !== 0) {
      if (!confirm("Submit test now?")) return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { testId: test._id, answers };
      const res = await axios.post("/api/test/submit", payload);
      if (res.data?.success) {
        // set the result data but DO NOT redirect automatically
        setResult(res.data.data);
        // stop the timer if running
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        if (res.data?.error && res.data.error.toLowerCase().includes("unauthorized") ) {
          if (confirm("You must be logged in to submit. Go to login page?")) {
            const callback = encodeURIComponent(`/test/${testId}`);
            router.push(`/auth/signin?callbackUrl=${callback}`);
          }
        } else {
          setError(res.data?.error || "Submission failed");
        }
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      if (err.response?.status === 401) {
        // Redirect to signin if not authenticated
        const callback = encodeURIComponent(`/test/${testId}`);
        router.push(`/auth/signin?callbackUrl=${callback}`);
        return;
      }
      setError(err?.response?.data?.error || err?.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div>Loading test...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!test) return <div>Test not found.</div>;

  // If we have a result, show summary and button to get detailed result
  if (result) {
    const resultId = result.resultId || result.result_id || result._id || result.result || result.id;
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="p-4 border rounded">
          <h2 className="text-2xl font-bold mb-1">{test.title}</h2>
          <p className="text-sm mb-2">{test.description}</p>
          <div className="text-sm">
            Score: {result.score} / {result.maxScore} • Percentage: {result.percentage}% • Correct: {result.correct} • Wrong: {result.wrong} • Unanswered: {result.unanswered}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="btn"
            onClick={() => {
              // navigate to detailed result page when user chooses
              if (resultId) router.push(`/test/result/${resultId}`);
            }}
          >
            Get detailed result
          </button>
          <button className="btn-ghost" onClick={() => router.push("/test")}>Back to tests</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 py-[8%]">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{test.title}</h2>
        <div className="text-sm">Time left: {timeLeft !== null ? formatTime(timeLeft) : "--:--"}</div>
      </div>

      <p className="text-sm text-muted-foreground">{test.description}</p>

      <div className="space-y-6">
        {test.questions.map((q, qi) => (
          <div key={q._id} className="p-4 border rounded">
            <div className="font-medium">Q{qi + 1}. {q.questionText}</div>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                return (
                  <label key={oi} className={`flex items-center cursor-pointer p-2 rounded ${selected ? "bg-slate-100" : ""}`}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      checked={selected}
                      onChange={() => chooseOption(qi, oi)}
                      className="mr-2"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
              {test.marks && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Marks: +{test.marks.correct} | wrong {test.marks.wrong} | unanswered {test.marks.unanswered}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit"}
        </button>
        <button className="btn-ghost" onClick={() => { if (confirm("Quit test? Your progress will be lost.")) router.push("/test"); }}>
          Quit
        </button>
      </div>
    </div>
  );
}
