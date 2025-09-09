
'use client';
import RankDisplay from "@/components/RankDisplay";
import ResultDetail from "@/components/ResultDetail";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = { params: { resultId: string } };

export default function Page({ params }: Props) {
  const { resultId } = params;
  const [resultData, setResultData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<string | null>(null);

  useEffect(() => {
    if (resultId) {
      axios.get(`/api/test/result/${resultId}`)
        .then(response => {
          const data = response.data;
          console.log("API Response:", data);
          if (data.success) {
            setResultData(data.data);
            
            // Extract testId from the result data
            const testIdFromResult = data.data.result?.testId;
            const testIdFromTest = data.data.test?._id;
            
            console.log("Test ID from result:", testIdFromResult);
            console.log("Test ID from test:", testIdFromTest);
            
            // Use whichever is available
            if (testIdFromResult) {
              setTestId(testIdFromResult);
            } else if (testIdFromTest) {
              setTestId(testIdFromTest);
            } else {
              console.error("No test ID found in response");
            }
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("API error:", error);
          setLoading(false);
        });
    }
  }, [resultId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 py-[5%] space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  if (!resultData) {
    return (
      <div className="container mx-auto p-4 py-[5%]">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Result not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-[5%] space-y-6">
      <Card>
        <CardContent className="pt-6">
          <ResultDetail resultId={resultId} />
        </CardContent>
      </Card>
      
      {/* Only show RankDisplay if we have a testId */}
      {testId ? (
        <RankDisplay testId={testId} />
      ) : (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Ranking data is not available for this test.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}