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
  BarChart3,
  Grid3X3
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TestSummary = {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  category?: { name: string; _id: string };
  createdBy?: { name: string };
  marks?: { correct: number; wrong: number; unanswered: number };
  createdAt?: string;
};

type Category = {
  _id: string;
  name: string;
  description?: string;
};

export default function TestListWithCategories() {
  const [tests, setTests] = useState<TestSummary[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    
    async function loadData() {
      setLoading(true);
      try {
        // Fetch tests
        const testsRes = await axios.get("/api/test/public");
        if (testsRes.data?.success && mounted) {
          setTests(testsRes.data.data || []);
          
          // Extract unique categories from tests
          const categoryMap = new Map();
          testsRes.data.data.forEach((test: TestSummary) => {
            if (test.category && test.category._id) {
              categoryMap.set(test.category._id, test.category);
            }
          });
          
          setCategories(Array.from(categoryMap.values()));
        } else if (mounted) {
          setError(testsRes.data?.error || "Failed to load tests");
        }
      } catch (err: any) {
        console.error(err);
        if (mounted) setError(err?.message || "Network error");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter tests based on selected category and search query
  const filteredTests = tests?.filter(test => {
    const matchesCategory = selectedCategory === "all" || test.category?._id === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
        <Button className="mt-4">
          <Link href="/student/test-creation">Create a Test</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Browse Tests
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore tests organized by category. Filter to find exactly what you want to practice!
        </p>
        
        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-6 py-4">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg">
            <Grid3X3 className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">{categories.length} Categories</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg">
            <Target className="h-5 w-5 text-purple-600" />
            <span className="font-semibold">{tests.length} Tests Available</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-600" />
            <span className="font-semibold">Earn Badges</span>
          </div>
        </div>
      </div>

      {/* Search and Category Filter Section */}
      <div className="flex flex-col gap-6">
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
          <Button className="gap-2 flex flex-row items-center">
            <Filter className="h-4 w-4" />
            Advanced Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <div className="w-full overflow-x-auto">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="flex flex-wrap justify-center h-auto p-1 bg-muted/50">
              <TabsTrigger value="all" className="rounded-md px-4 py-2 data-[state=active]:bg-background">
                All Tests
              </TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger 
                  key={category._id} 
                  value={category._id}
                  className="rounded-md px-4 py-2 data-[state=active]:bg-background"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-center text-muted-foreground">
          Found {filteredTests?.length} test{filteredTests?.length === 1 ? '' : 's'} matching "{searchQuery}"
          {selectedCategory !== "all" && ` in ${categories.find(c => c._id === selectedCategory)?.name}`}
        </p>
      )}

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTests?.map((test) => (
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
      {filteredTests?.length === 0 && (
        <div className="text-center py-12 space-y-4">
          <div className="bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">
            {selectedCategory === "all" ? "No tests found" : `No tests found in ${categories.find(c => c._id === selectedCategory)?.name}`}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `We couldn't find any tests matching "${searchQuery}". Try different keywords.`
              : "There are no tests available in this category yet."}
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => setSearchQuery('')}>
              Clear Search
            </Button>
            <Button variant="outline" onClick={() => setSelectedCategory('all')}>
              Show All Tests
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}