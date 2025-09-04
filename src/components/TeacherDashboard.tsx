// components/TeacherDashboard.tsx
'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Users, FileText, BookOpen, GraduationCap, RefreshCw, AlertCircle } from 'lucide-react';
import Button from './button';

interface Teacher {
  _id: string;
  name: string;
  username: string;
  email: string;
}

interface Test {
  _id: string;
  title: string;
  createdBy: {
    name: string;
  };
  questionsCount: number;
  duration: number | string;
  createdAt: string;
}

interface DashboardData {
  success: boolean;
  data?: {
    teacher: any;
    otherTeachers: Teacher[];
    tests: Test[];
    category: {
      _id: string;
      name: string;
    };
  };
  error?: string;
}

interface TeacherDashboardClientProps {
  initialData: DashboardData;
  userName: string;
  userRole: string;
}

export default function TeacherDashboardClient({ 
  initialData, 
  userName, 
  userRole 
}: TeacherDashboardClientProps) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/teacher/dashboard');
      setData(response.data);
    } catch (err) {
      setError('Failed to refresh data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!data.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 ">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">{data.error || 'Unknown error occurred'}</p>
          <button 
            onClick={refreshData}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { category, otherTeachers, tests } = data.data!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 pt-[8%]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-100 rounded-full">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Welcome, <span className="text-blue-600">{userName}</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="h-4 w-4" />
                <p className="text-lg">
                  Your assigned category: <span className="font-semibold text-blue-700">{category.name}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-blue-700">{otherTeachers.length}</div>
                <div className="text-sm text-blue-600">Teachers</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center min-w-[120px]">
                <div className="text-2xl font-bold text-green-700">{tests.length}</div>
                <div className="text-sm text-green-600">Tests</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Teachers Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Teachers in Your Category</h2>
              </div>
              <button 
                onClick={refreshData}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-4">
              {otherTeachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No other teachers in this category</p>
                </div>
              ) : (
                otherTeachers.map((teacher) => (
                  <div key={teacher._id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800 truncate">{teacher.name}</h3>
                      <p className="text-sm text-gray-500 truncate">@{teacher.username}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tests Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Available Tests</h2>
            </div>
            
            <div className="space-y-4">
              {tests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No tests available in this category</p>
                </div>
              ) : (
                tests.map((test) => (
                  <div>
                  <div key={test._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h3 className="font-semibold text-gray-800 mb-2">{test.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{test.questionsCount} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">⏱</span>
                        <span>{test.duration} mins</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">Created by {test.createdBy.name}</span>
                    </div>
                    
                  </div>
                  
                </div>
              ))
            )}
            <div>
                    <a href='/teacher/test-creation'>
                      <Button>
                        Create New Test
                      </Button>
                    </a>
                  </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}