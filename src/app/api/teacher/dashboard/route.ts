// app/api/teacher/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import Test from "@/models/Test";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Get session using getServerSession (more reliable for API routes)
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a teacher
    if (session.user.role !== 'teacher') {
      return NextResponse.json({ 
        success: false, 
        error: "Access restricted to teachers only" 
      }, { status: 403 });
    }

    const userId = session.user._id;
    if (!userId) {
      return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 401 });
    }

    // Connect to DB
    await dbConnect();

    // Get teacher with populated category
    const teacher = await User.findById(userId)
      .select("-password -__v")
      .populate("category", "name")
      .lean();

    if (!teacher) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Get category ID
    const categoryId = teacher.category?._id || teacher.category;
    if (!categoryId || !mongoose.isValidObjectId(categoryId)) {
      return NextResponse.json({ 
        success: false, 
        error: "No valid category assigned" 
      }, { status: 400 });
    }

    // Fetch other teachers in same category (parallel execution)
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

    // Transform tests data
    const formattedTests = tests.map(test => ({
      _id: test._id,
      title: test.title,
      createdBy: test.createdBy || { name: "Unknown" },
      questionsCount: test.questions?.length || 0,
      duration: test.duration || "N/A",
      createdAt: test.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        teacher,
        otherTeachers,
        tests: formattedTests,
        category: teacher.category
      }
    });

  } catch (error) {
    console.error("Teacher dashboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" }, 
      { status: 500 }
    );
  }
}