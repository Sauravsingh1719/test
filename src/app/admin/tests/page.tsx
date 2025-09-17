// app/admin/tests/page.tsx
'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, Edit, Trash2, Eye, Users, Clock, FileText, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Test {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  duration: number;
  questions: any[];
  marks?: {
    correct: number;
    wrong: number;
    unanswered: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/test");
      if (res.data?.success) {
        setTests(res.data.data || []);
      } else {
        setError(res.data?.error || "Failed to load tests");
        toast.error(res.data?.error || "Failed to load tests");
      }
    } catch (err: any) {
      console.error("Error loading tests:", err);
      setError(err?.response?.data?.error || err?.message || "Network error");
      toast.error(err?.response?.data?.error || err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (testId: string) => {
    try {
      const res = await axios.delete(`/api/test/${testId}`);
      if (res.data?.success) {
        toast.success("Test deleted successfully");
        setTests(tests.filter(test => test._id !== testId));
        setDeleteConfirm(null);
      } else {
        toast.error(res.data?.error || "Failed to delete test");
      }
    } catch (err: any) {
      console.error("Error deleting test:", err);
      toast.error(err?.response?.data?.error || err?.message || "Network error");
    }
  };

  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Admin
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tests Management</h1>
          <p className="text-muted-foreground">Manage all tests in the system</p>
        </div>
        <Button asChild>
          <Link href="/test/create">
            <Plus className="mr-2 h-4 w-4" /> Create New Test
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
          <CardDescription>
            View, edit, and delete tests. {tests.length} test(s) found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tests by title, description, or category..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {filteredTests.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No tests found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search query" : "Get started by creating a new test"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Marks Scheme</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{test.title}</span>
                        {test.description && (
                          <span className="text-sm text-muted-foreground line-clamp-1">
                            {test.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{test.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{test.questions.length}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{test.duration} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{test.createdBy.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {test.createdBy.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>✓: {test.marks?.correct || 1}</span>
                        <span>✗: -{test.marks?.wrong || 0}</span>
                        <span>?: {test.marks?.unanswered || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(test.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/test/${test._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/tests/edit/${test._id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirm(test._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {deleteConfirm === test._id && (
                        <div className="absolute right-0 mt-2 p-4 bg-white border rounded-lg shadow-lg z-10">
                          <p className="text-sm font-medium mb-2">
                            Are you sure you want to delete this test?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(test._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredTests.length} of {tests.length} tests
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}