import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher" && token.role !== "student")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const testId = await params.testId;
    if (!mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test id" }, { status: 400 });
    }

    await dbConnect();
    const test = await Test.findById(testId).populate("category", "name").populate("createdBy", "name");
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    const safeQuestions = (test.questions || []).map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation
    }));

    const payload = {
      _id: test._id,
      title: test.title,
      description: test.description,
      category: test.category,
      createdBy: test.createdBy,
      duration: test.duration,
      marks: test.marks,
      questions: safeQuestions
    };

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (err) {
    console.error("GET /api/test/[testId] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const testId = await params.testId;
    if (!mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test id" }, { status: 400 });
    }

    const body = await request.json();
    await dbConnect();

    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    if (token.role === "teacher" && String(test.createdBy) !== String(token.sub)) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    const { title, description, questions, duration, category, marks } = body;
    if (title !== undefined) test.title = String(title).trim();
    if (description !== undefined) test.description = String(description);
    if (duration !== undefined) test.duration = Number(duration);
    if (category !== undefined && mongoose.isValidObjectId(category)) test.category = category;
    if (marks !== undefined) test.marks = marks;

    // Handle questions update with proper validation
    if (questions !== undefined && Array.isArray(questions)) {
      // Validate questions before updating
      const validatedQuestions = questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
        explanation: q.explanation || ""
      }));
      
      test.questions = validatedQuestions;
    }

    await test.save();
    return NextResponse.json({ success: true, data: test }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/test/[testId] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const testId = await params.testId;
    if (!mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test id" }, { status: 400 });
    }

    await dbConnect();
    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    if (token.role === "teacher" && String(test.createdBy) !== String(token.sub)) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    await test.deleteOne();
    return NextResponse.json({ success: true, message: "Test deleted" }, { status: 200 });
  } catch (err) {
    console.error("DELETE /api/test/[testId] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}