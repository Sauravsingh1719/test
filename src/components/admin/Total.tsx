// app/admin/Total.tsx
'use client'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BookOpen, 
  Users, 
  User, 
  Folder, 
  FolderOpen,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

const Total = () => {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchStats() {
    try {
      const res = await axios.get('/api/stats');
      if (res.data.success) {
        setStats(res.data.data);
        setError(null);
      } else {
        setError('Failed to fetch stats');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching stats');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex items-center gap-3">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div className="text-destructive font-semibold">{error}</div>
        <button 
          onClick={fetchStats}
          className="ml-auto text-sm text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Tests",
      value: stats?.totalTests || 0,
      icon: BookOpen,
      href: "/admin/tests",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Teachers",
      value: stats?.totalTeachers || 0,
      icon: Users,
      href: "/admin/teacher",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Students",
      value: stats?.totalStudents || 0,
      icon: User,
      href: "/admin/students",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      icon: Folder,
      href: "/admin/category",
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    },
    {
      title: "Subcategories",
      value: stats?.totalSubcategories || 0,
      icon: FolderOpen,
      href: "/admin/category/subcategories",
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Platform Statistics</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-10" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2 ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    View all {stat.title.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Total;