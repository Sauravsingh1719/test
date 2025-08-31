"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Button from "../button";

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
        const res = await axios.get("/api/test/public");
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
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    // grid of skeleton cards
    return (
      <div aria-live="polite" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-[5%]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg shadow-sm animate-pulse bg-white"
            aria-hidden
          >
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-12 bg-gray-100 rounded mb-3" />
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded w-20" />
              <div className="h-8 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error)
    return (
      <div role="alert" className="text-red-600">
        {error}
      </div>
    );

  if (!tests || tests.length === 0)
    return <div className="text-muted-foreground">No tests available right now.</div>;

  return (
    <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((t) => (
        <Card
          key={t._id}
          className="transition-transform hover:-translate-y-1 hover:shadow-lg border-blue-400 shadow-2xl bg-blue-50"
        >
          <CardHeader>
            <div className="flex justify-between items-start gap-3">
              <div>
                <CardTitle className="text-lg line-clamp-2">
                  <Link href={`/test/${t._id}`} className="hover:underline">
                    {t.title}
                  </Link>
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {t.category?.name ?? "General"} • {t.createdBy?.name ?? "Testify"}
                </CardDescription>
              </div>

              <div className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100">
                {t.duration} min
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {t.description ? (
              <p className="text-sm text-muted-foreground line-clamp-3">{t.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No description provided.</p>
            )}

            {t.marks && (
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="mr-2">+{t.marks.correct}</span>
                <span className="mr-2">wrong {t.marks.wrong}</span>
                <span>unanswered {t.marks.unanswered}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">ID: {t._id.slice(0, 6)}</div>

            <Link
              href={`/test/${t._id}`}
            >
              <Button>Take test</Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
