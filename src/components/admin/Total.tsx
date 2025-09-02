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
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'

const Total = () => {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStats() {
    try {
      setRefreshing(true);
      const res = await axios.get('/api/stats');
      if (res.data.success) {
        setStats(res.data.data);
        setError(null);
      } else {
        setError('Failed to fetch statistics data');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching platform statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (error && !loading) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <div className="text-destructive font-semibold">{error}</div>
        </div>
        <button 
          onClick={fetchStats}
          disabled={refreshing}
          className="ml-auto flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
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
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      borderColor: "hover:border-blue-300"
    },
    {
      title: "Teachers",
      value: stats?.totalTeachers || 0,
      icon: Users,
      href: "/admin/teacher",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      borderColor: "hover:border-green-300"
    },
    {
      title: "Students",
      value: stats?.totalStudents || 0,
      icon: User,
      href: "/admin/students",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      borderColor: "hover:border-purple-300"
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      icon: Folder,
      href: "/admin/category",
      color: "text-amber-600",
      bgColor: "bg-amber-100 dark:bg-amber-900/20",
      borderColor: "hover:border-amber-300"
    },
    {
      title: "Subcategories",
      value: stats?.totalSubcategories || 0,
      icon: FolderOpen,
      href: "/admin/category/subcategories",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      borderColor: "hover:border-red-300"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Platform Statistics</h2>
            <p className="text-muted-foreground">Overview of your platform's data</p>
          </div>
        </div>
        <button 
          onClick={fetchStats}
          disabled={refreshing}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          {refreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>
      
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className={`group transition-all hover:shadow-md hover:-translate-y-1.5 cursor-pointer border-2 border-transparent ${stat.borderColor} overflow-hidden`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.title}
                  </CardTitle>
                  <div className={`rounded-full p-2.5 ${stat.bgColor} transition-colors group-hover:opacity-90`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground transition-colors">
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