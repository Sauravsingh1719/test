'use client'
import React, { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import axios from 'axios'
import SkeletonCard from '../SkeletonLoading';

const Total = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

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
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  if (error) {
    return <div className="text-red-500 font-semibold">{error}</div>;
  }

  if (!stats) {
    return <div><SkeletonCard/></div>;
  }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
          </CardContent>
        </Card>
        <a href='/admin/teacher'>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
          </CardContent>
        </Card>
        </a>
        <a href='/admin/students'>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        </a>
        <a href='/admin/category'>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
          </CardContent>
        </Card>
        </a>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubcategories}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Total;
