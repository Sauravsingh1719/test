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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, User, BookOpen, AlertCircle, Folder, Calendar } from "lucide-react";

type TestSummary = {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  category?: { name: string };
  createdBy?: { name: string };
  marks?: { correct: number; wrong: number; unanswered: number };
  createdAt?: string;
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium mb-2">Unable to load tests</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No tests available</h3>
        <p className="text-muted-foreground">Check back later for new tests</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
      {tests.map((test) => (
        <Card key={test._id} className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <CardTitle className="text-lg line-clamp-2 leading-tight">
                  <Link 
                    href={`/test/${test._id}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {test.title}
                  </Link>
                </CardTitle>
                <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                  {test.category?.name && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {test.category.name}
                    </Badge>
                  )}
                  {test.createdBy?.name && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {test.createdBy.name}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3 w-3" />
                {test.duration} min
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pb-3 flex-grow">
            {test.description ? (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{test.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic mb-3">No description provided</p>
            )}

            {test.marks && (
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex flex-col">
                  <span className="font-medium text-green-600">+{test.marks.correct}</span>
                  <span>Correct</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-red-600">{test.marks.wrong}</span>
                  <span>Wrong</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-600">{test.marks.unanswered}</span>
                  <span>Unanswered</span>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center pt-3 border-t">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'Recent'}
            </div>
            <Button asChild size="sm">
              <Link href={`/test/${test._id}`}>
                Take Test
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}