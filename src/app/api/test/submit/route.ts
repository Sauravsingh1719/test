// src/app/api/test/submit/route.ts
import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import Result from "@/models/Result";
import { getToken } from "next-auth/jwt";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please login to submit the test." }, { status: 401 });
    }

    const body = await request.json();
    const { testId, answers } = body;

    if (!testId || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: "Missing payload (testId and answers required)" }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test id" }, { status: 400 });
    }

    const test = await Test.findById(testId).lean();
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    const total = Array.isArray(test.questions) ? test.questions.length : 0;

    // marks config (normalize wrong to negative)
    const marksCorrect = test.marks && typeof test.marks.correct === "number" ? Number(test.marks.correct) : 1;
    const marksWrongRaw = test.marks && typeof test.marks.wrong === "number" ? Number(test.marks.wrong) : 0;
    const marksWrong = -Math.abs(marksWrongRaw);
    const marksUnanswered = test.marks && typeof test.marks.unanswered === "number" ? Number(test.marks.unanswered) : 0;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let score = 0;

    // Normalize answers array length: create an answersToSave array of length `total`,
    // fill missing with -1, clamp extras.
    const answersToSave: number[] = new Array(total).fill(-1);
    for (let i = 0; i < total; i++) {
      const given = answers[i];
      // treat undefined/null or non-number or negative as unanswered => store -1
      if (typeof given !== "number" || given < 0) {
        answersToSave[i] = -1;
        unanswered++;
        score += marksUnanswered;
        continue;
      }
      // valid numeric answer
      answersToSave[i] = Number(given);

      const q = test.questions[i];
      if (answersToSave[i] === q.correctAnswer) {
        correct++;
        score += marksCorrect;
      } else {
        wrong++;
        score += marksWrong;
      }
    }

    const maxScore = marksCorrect * total;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100 * 100) / 100 : 0;

    // Save result (now includes answersToSave and total)
    const result = await Result.create({
      testId: new mongoose.Types.ObjectId(testId),
      userId: new mongoose.Types.ObjectId(token.sub),
      correct,
      wrong,
      unanswered,
      answers: answersToSave,
      total,
      score,
      maxScore,
      percentage
    });

    return NextResponse.json({
      success: true,
      data: {
        resultId: result._id,
        correct,
        wrong,
        unanswered,
        total,
        score,
        maxScore,
        percentage
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/test/submit error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
