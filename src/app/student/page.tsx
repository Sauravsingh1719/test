import Carousel from '@/components/student/Carousel'
import { getServerSession } from 'next-auth';
import React from 'react'
import { authOptions } from '../api/auth/[...nextauth]/options';
import Category from '@/components/Category';
import StudentTestList from '@/components/student/TestList';
import { BookOpen, Target, Award, Calendar, Star, Zap } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import StudentCreateTestPage from './test-creation/page';

export default async function Page() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name || 'Guest';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 pb-10 rounded-xl shadow-xl">
      {/* Header Section */}
      <div className="pt-8 pb-6 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-200">
                Welcome back, <span className="font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{name}</span>
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <div className="mb-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Carousel />
        </div>
      </div>

      {/* Challenge Section */}
      <div className="relative py-8 mb-10 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-3 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">New Challenges Await!</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Ready for a new <span className="text-blue-600">Challenge</span>?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Explore our latest tests and expand your knowledge with curated categories
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/30 dark:bg-blue-800/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-200/30 dark:bg-purple-800/20 rounded-full blur-xl"></div>
      </div>

      {/* Category Section */}
      <div className="mb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Browse Categories</h2>
          </div>
          <Category />
        </div>
      </div>

      {/* Test List Section */}
      <div className="px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Available Tests</h2>
          </div>
          <StudentTestList />
        <div className="mt-10">
          <StudentCreateTestPage />
        </div>
        </div>
      </div>
    </div>
  )
}