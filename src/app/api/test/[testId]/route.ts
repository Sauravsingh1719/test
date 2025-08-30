import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/test/:testId
 * - PUBLIC SAFE FETCH: returns questions but WITHOUT correctAnswer/explanation
 * - This allows students/public to take the test without seeing answers.
 */
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
      options: q.options
    }));

    const payload = {
      _id: test._id,
      title: test.title,
      description: test.description,
      category: test.category,
      createdBy: test.createdBy,
      duration: test.duration,
      questions: safeQuestions
    };

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (err) {
    console.error("GET /api/test/[testId] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * PUT /api/test/:testId
 * - Update test (admin or teacher who created the test)
 */
export async function PUT(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const testId = params.testId;
    if (!mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test id" }, { status: 400 });
    }

    const body = await request.json();
    await dbConnect();

    const test = await Test.findById(testId);
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    // If teacher, ensure they own the test
    if (token.role === "teacher" && String(test.createdBy) !== String(token.sub)) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    // Minimal update behavior: allow title, description, questions, duration, category
    const { title, description, questions, duration, category } = body;
    if (title !== undefined) test.title = String(title).trim();
    if (description !== undefined) test.description = String(description);
    if (questions !== undefined && Array.isArray(questions)) test.questions = questions;
    if (duration !== undefined) test.duration = Number(duration);
    if (category !== undefined && mongoose.isValidObjectId(category)) test.category = category;

    await test.save();
    return NextResponse.json({ success: true, data: test }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/test/[testId] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/test/:testId
 * - Allowed only to admin OR the teacher who created the test
 */
export async function DELETE(request: NextRequest, { params }: { params: { testId: string } }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const testId = params.testId;
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
