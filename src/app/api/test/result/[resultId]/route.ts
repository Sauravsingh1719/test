// src/app/api/test/result/[resultId]/route.ts
import dbConnect from "@/app/lib/dbConnect";
import Result from "@/models/Result";
import Test from "@/models/Test";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { resultId: string } }) {
  try {
    await dbConnect();
    const { resultId } = await params;

    if (!mongoose.isValidObjectId(resultId)) {
      return NextResponse.json({ success: false, error: "Invalid result id" }, { status: 400 });
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // load result
    const result = await Result.findById(resultId).lean();
    if (!result) {
      return NextResponse.json({ success: false, error: "Result not found" }, { status: 404 });
    }

    
    const isOwner = String(result.userId) === String(token.sub);
    const isPrivileged = token.role === "admin" || token.role === "teacher" || token.role === "student";
    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    // load test with full question details (including correctAnswer and explanation)
    const test = await Test.findById(result.testId).lean();
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    // Compose per-question review objects: questionText, options, correctAnswer, explanation, userAnswer
    const questionsReview = (test.questions || []).map((q: any, idx: number) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      userAnswer: (Array.isArray(result.answers) && typeof result.answers[idx] === "number") ? result.answers[idx] : -1
    }));

    const payload = {
      result: {
        _id: result._id,
        userId: result.userId,
        correct: result.correct,
        wrong: result.wrong,
        unanswered: result.unanswered,
        total: result.total,
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
        createdAt: result.createdAt
      },
      test: {
        _id: test._id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        marks: test.marks
      },
      questions: questionsReview
    };

    return NextResponse.json({ success: true, data: payload }, { status: 200 });

  } catch (err: any) {
    console.error("GET /api/test/result/[resultId] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
