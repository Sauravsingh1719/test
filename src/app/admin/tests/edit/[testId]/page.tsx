
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
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Test {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  questions: any[];
  marks: {
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
          <p className="text-muted-foreground">Update test details</p>
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
                value={test.marks.correct}
                onChange={(e) => setTest({
                  ...test,
                  marks: { ...test.marks, correct: Number(e.target.value) }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marksWrong">Marks for Wrong Answer</Label>
              <Input
                id="marksWrong"
                type="number"
                value={test.marks.wrong}
                onChange={(e) => setTest({
                  ...test,
                  marks: { ...test.marks, wrong: Number(e.target.value) }
                })}
              />
            </div>
          </div>
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