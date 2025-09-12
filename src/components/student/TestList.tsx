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
import Button from "@/components/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  User, 
  BookOpen, 
  AlertCircle, 
  Folder, 
  Calendar, 
  Search,
  Filter,
  Trophy,
  Target,
  Zap,
  Star,
  BarChart3
} from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter tests based on search query
  const filteredTests = tests?.filter(test => 
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-10 w-64 mx-auto" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="bg-destructive/15 p-3 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Unable to load tests</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!tests || tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="bg-muted p-3 rounded-full">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">No tests available yet</h3>
        <p className="text-muted-foreground max-w-md">
          Check back later for new tests or be the first to create one!
        </p>
        <Button  className="mt-4">
          <Link href="/student/test-creation">Create a Test</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-[10%]">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Available Tests
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Challenge yourself with our curated collection of tests. Expand your knowledge, track your progress, and climb the leaderboard!
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 py-4">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">{tests.length} Tests Available</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
            <Trophy className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">Earn Badges</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <span className="font-semibold">Track Progress</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tests by title, description or category..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="flex flex-row gap-3 items-center">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-center text-muted-foreground">
          Found {filteredTests?.length} test{filteredTests?.length === 1 ? '' : 's'} matching "{searchQuery}"
        </p>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(searchQuery ? filteredTests : tests)?.map((test) => (
          <Card key={test._id} className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
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
                      <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <Folder className="h-3 w-3" />
                        {test.category.name}
                      </Badge>
                    )}
                    {test.createdBy?.name && (
                      <span className="flex items-center gap-1 text-xs">
                        <User className="h-3 w-3" />
                        By {test.createdBy.name}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1 whitespace-nowrap bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
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
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-green-600">+{test.marks.correct}</span>
                    <span>Correct</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-medium text-red-600">{test.marks.wrong}</span>
                    <span>Wrong</span>
                  </div>
                  <div className="flex flex-col items-center">
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
              <Link href={`/test/${test._id}`}>
              <Button className="flex flex-row gap-3 items-center">
                
                  <Zap className="h-4 w-4" />
                  Take Test
                
              </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Empty search state */}
      {searchQuery && filteredTests?.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">No tests found</h3>
          <p className="text-muted-foreground">
            We couldn't find any tests matching "{searchQuery}". Try different keywords.
          </p>
          <Button className="flex flex-row gap-3 items-center" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </div>
      )}

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6 text-center mt-8">
        <h3 className="text-xl font-semibold mb-2">Can't find what you're looking for?</h3>
        <p className="text-muted-foreground mb-4">
          Create your own test and share it with the community!
        </p>
        <Link href="/student/test-creation">
        <Button className="gap-3 flex flex-row items-center justify-center mx-auto">
          
            <Star className="h-5 w-5" />
            Create a Test
          </Button>
        </Link>
      </div>
    </div>
  );
}