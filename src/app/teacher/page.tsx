
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/options";
import TeacherDashboardClient from "@/components/TeacherDashboard";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import Test from "@/models/Test";
import mongoose from "mongoose";
import TestCreate from "@/components/Testcreate";
import TeacherCreateTestPage from "./test-creation/page";

async function getDashboardData(userId: string) {
  try {
    await dbConnect();

    
    const teacher = await User.findById(userId)
      .select("-password -__v")
      .populate("category", "name")
      .lean();

    if (!teacher) {
      return { success: false, error: "User not found" };
    }

    const categoryId = teacher.category?._id || teacher.category;
    if (!categoryId || !mongoose.isValidObjectId(categoryId)) {
      return { 
        success: false, 
        error: "No valid category assigned" 
      };
    }

    
    const [otherTeachers, tests] = await Promise.all([
      User.find({ 
        role: "teacher", 
        category: categoryId, 
        _id: { $ne: userId } 
      })
      .select("name username email")
      .lean(),
      
      Test.find({ category: categoryId })
        .select("title createdBy questions duration createdAt")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .lean()
    ]);

    
    const formattedTests = tests.map(test => ({
      _id: test._id,
      title: test.title,
      createdBy: test.createdBy || { name: "Admin" },
      questionsCount: test.questions?.length || 0,
      duration: test.duration || "N/A",
      createdAt: test.createdAt
    }));

    return {
      success: true,
      data: {
        teacher,
        otherTeachers,
        tests: formattedTests,
        category: teacher.category
      }
    };

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return { 
      success: false, 
      error: 'Failed to load dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view this page.</p>
          <a 
            href="/sign-in" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Check if user is a teacher
  if (session.user.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Restricted</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to teachers.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const dashboardData = await getDashboardData(session.user._id);

  return (
    <div>
    <TeacherDashboardClient 
      initialData={dashboardData}
      userName={session.user.name}
      userRole={session.user.role}
    />
    <TeacherCreateTestPage />
    </div>
  );
}