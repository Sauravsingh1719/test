'use client';
import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Crown, Trophy, Clock, Award } from "lucide-react";

interface RankData {
  userRank: number;
  totalParticipants: number;
  userPercentage: number;
  topper: {
    name: string;
    percentage: number;
    timeTaken: number;
  } | null;
  leaderboard: Array<{
    rank: number;
    name: string;
    percentage: number;
    timeTaken: number;
  }>;
}

interface RankDisplayProps {
  testId: string;
}

export default function RankDisplay({ testId }: RankDisplayProps) {
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Don't render if testId is not provided
  if (!testId) {
    return (
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-700">
          Test ID is missing. Cannot fetch rank.
        </AlertDescription>
      </Alert>
    );
  }

  const fetchRank = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching rank for testId:', testId);
      
      const response = await axios.post('/api/test/rank', { testId });
      const data = response.data;
      
      console.log('Rank API response:', data);
      
      if (data.success) {
        setRankData(data.data);
      } else {
        setError(data.error || 'Failed to fetch rank');
      }
    } catch (err: any) {
      console.error('Rank fetch error:', err);
      setError(err.response?.data?.error || 'Failed to fetch rank. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking
        </CardTitle>
        <CardDescription>
          See how you performed compared to other participants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button 
          onClick={fetchRank} 
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </>
          ) : (
            <>
              <Award className="h-4 w-4" />
              Get My Rank
            </>
          )}
        </Button>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        )}
        
        {rankData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                    <Badge className="bg-blue-600">Your Rank</Badge>
                  </h3>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {rankData.userRank} / {rankData.totalParticipants}
                  </p>
                  <p className="text-blue-700 mt-1">Score: {rankData.userPercentage}%</p>
                </CardContent>
              </Card>
              
              {rankData.topper && (
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-600" />
                      Topper: {rankData.topper.name}
                    </h3>
                    <p className="text-yellow-700">Score: {rankData.topper.percentage}%</p>
                    <div className="flex items-center gap-1 text-yellow-700 mt-1">
                      <Clock className="h-4 w-4" />
                      Time: {formatTime(rankData.topper.timeTaken)}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {rankData.leaderboard.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-lg">Top Performers</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Time
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rankData.leaderboard.map((participant) => (
                        <TableRow 
                          key={participant.rank} 
                          className={participant.rank === 1 ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                        >
                          <TableCell className="font-medium">{participant.rank}</TableCell>
                          <TableCell>{participant.name}</TableCell>
                          <TableCell>{participant.percentage}%</TableCell>
                          <TableCell>{formatTime(participant.timeTaken)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}