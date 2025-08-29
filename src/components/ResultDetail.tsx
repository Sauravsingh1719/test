"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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

  if (loading) return <div>Loading result...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!data) return <div>No data</div>;

  const { result, test, questions } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="p-4 border rounded">
        <h2 className="text-xl font-bold">{test.title}</h2>
        <p className="text-sm text-muted-foreground">{test.description}</p>
        <div className="mt-2 text-sm">
          Score: {result.score} / {result.maxScore} • Percentage: {result.percentage}% • Correct: {result.correct} • Wrong: {result.wrong} • Unanswered: {result.unanswered}
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((q: QReview, i: number) => {
          const userAns = q.userAnswer;
          const correctAns = q.correctAnswer;
          const isUnanswered = userAns === -1;
          return (
            <div key={q._id} className="p-3 border rounded">
              <div className="mb-2 font-medium">Q{i + 1}. {q.questionText}</div>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isUser = userAns === oi;
                  const isCorrect = correctAns === oi;
                  const bg = isCorrect ? "bg-green-50" : isUser ? "bg-red-50" : "";
                  const label = isCorrect ? " (Correct)" : isUser ? " (Your answer)" : "";
                  return (
                    <div key={oi} className={`p-2 rounded ${bg} flex items-start gap-2`}>
                      <div className="w-5 font-medium">{String.fromCharCode(65 + oi)}</div>
                      <div>
                        <div>{opt}{label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2 text-sm">
                {isUnanswered ? (
                  <div className="text-orange-600">You did not answer this question.</div>
                ) : (userAns === correctAns ? (
                  <div className="text-green-600">Your answer was correct.</div>
                ) : (
                  <div className="text-red-600">Your answer was incorrect.</div>
                ))}
              </div>

              {q.explanation && (
                <div className="mt-3 p-2 bg-slate-50 rounded text-sm">
                  <strong>Explanation:</strong>
                  <div>{q.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
