"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type TestSummary = {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  category?: { name: string };
  createdBy?: { name: string };
  marks?: { correct: number; wrong: number; unanswered: number };
};

export default function StudentTestList() {
  const [tests, setTests] = useState<TestSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await axios.get("/api/test");
        if (res.data?.success) {
          if (mounted) setTests(res.data.data || []);
        } else {
          if (mounted) setError(res.data?.error || "Failed to load tests");
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err?.message || "Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading tests...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!tests || tests.length === 0) return <div>No tests available right now.</div>;

  return (
    <div className="space-y-4">
      {tests.map(t => (
        <div key={t._id} className="p-4 border rounded-md hover:shadow">
          <div className="flex justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                <Link href={`/test/${t._id}`}>{t.title}</Link>
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.category?.name} • {t.createdBy?.name}
              </p>
            </div>
            <div className="text-sm">{t.duration} min</div>
          </div>

          {t.description && <p className="mt-2 text-sm">{t.description}</p>}

          {t.marks && (
            <p className="mt-2 text-xs text-muted-foreground">
              Marks: +{t.marks.correct} | wrong {t.marks.wrong} | unanswered {t.marks.unanswered}
            </p>
          )}

          <div className="mt-3">
            <Link href={`/test/${t._id}`} className="inline-block btn-sm btn">
              Take test
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
