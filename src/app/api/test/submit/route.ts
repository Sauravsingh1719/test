// src/app/api/test/submit/route.ts
import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import Result from "@/models/Result";
import Rank from "@/models/Rank";
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
    const { testId, answers, timeTaken } = body;

    if (!testId || !Array.isArray(answers)) {
      return NextResponse.json({ success: false, error: "Missing payload (testId and answers required)" }, { status: 400 });
    }
    if (!mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test id" }, { status: 400 });
    }

    const validatedTimeTaken = typeof timeTaken === 'number' && timeTaken >= 0 ? timeTaken : 0;

    const test = await Test.findById(testId).lean();
    if (!test) {
      return NextResponse.json({ success: false, error: "Test not found" }, { status: 404 });
    }

    const total = Array.isArray(test.questions) ? test.questions.length : 0;

    // Get marks configuration with defaults
    const marksCorrect = test.marks?.correct || 1;
    const marksWrong = test.marks?.wrong || 0;
    const marksUnanswered = test.marks?.unanswered || 0;

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;
    let score = 0;

    const answersToSave: number[] = new Array(total).fill(-1);
    for (let i = 0; i < total; i++) {
      const given = answers[i];
      
      // Handle unanswered questions
      if (typeof given !== "number" || given < 0) {
        answersToSave[i] = -1;
        unanswered++;
        score += marksUnanswered;
        continue;
      }
      
      answersToSave[i] = Number(given);
      const q = test.questions[i];
      
      // Handle correct answers
      if (answersToSave[i] === q.correctAnswer) {
        correct++;
        score += marksCorrect;
      } 
      // Handle wrong answers (apply negative marking)
      else {
        wrong++;
        score -= marksWrong; // Subtract the negative marks
      }
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    const maxScore = marksCorrect * total;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100 * 100) / 100 : 0;

    // Save result
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
      percentage,
      timeTaken: validatedTimeTaken
    });

    // Check if this user already has a rank entry for this test
    const existingRank = await Rank.findOne({
      testId: new mongoose.Types.ObjectId(testId),
      userId: new mongoose.Types.ObjectId(token.sub)
    });

    // If no rank exists for this user+test combination, create one
    if (!existingRank) {
      await Rank.create({
        testId: new mongoose.Types.ObjectId(testId),
        userId: new mongoose.Types.ObjectId(token.sub),
        percentage,
        timeTaken: validatedTimeTaken
      });
    }

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
        percentage,
        timeTaken: result.timeTaken
      }
    }, { status: 201 });

  } catch (err: any) {
    console.error("POST /api/test/submit error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}