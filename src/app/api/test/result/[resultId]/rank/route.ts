// src/app/api/result/[resultId]/rank/route.ts
import dbConnect from "@/app/lib/dbConnect";
import Result from "@/models/Result";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    await dbConnect();
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const resultId = await params.resultId;
    if (!mongoose.isValidObjectId(resultId)) {
      return NextResponse.json({ success: false, error: "Invalid result ID" }, { status: 400 });
    }

    // Get the current user's result
    const userResult = await Result.findById(resultId);
    if (!userResult) {
      return NextResponse.json({ 
        success: false, 
        error: "Result not found" 
      }, { status: 404 });
    }

    // Check if the user owns this result
    if (String(userResult.userId) !== String(token.sub)) {
      return NextResponse.json({ 
        success: false, 
        error: "Access denied" 
      }, { status: 403 });
    }

    // Get all results for this test, sorted by percentage (desc) and timeTaken (asc)
    const allResults = await Result.find({ testId: userResult.testId })
      .sort({ 
        percentage: -1, 
        timeTaken: 1 
      })
      .select("userId percentage timeTaken")
      .populate("userId", "name");

    // Calculate ranks
    let currentRank = 1;
    let previousPercentage = -1;
    let previousTimeTaken = -1;
    let userRank = 0;

    const rankedResults = allResults.map((result, index) => {
      // If percentage is different from previous, increment rank
      // If percentage is same but time taken is different, increment rank
      if (index > 0 && (
        result.percentage !== previousPercentage ||
        (result.percentage === previousPercentage && result.timeTaken !== previousTimeTaken)
      )) {
        currentRank = index + 1;
      }

      previousPercentage = result.percentage;
      previousTimeTaken = result.timeTaken;

      // Check if this is the current user's result
      if (result.userId._id.toString() === token.sub) {
        userRank = currentRank;
      }

      return {
        rank: currentRank,
        userId: result.userId._id,
        name: result.userId.name,
        percentage: result.percentage,
        timeTaken: result.timeTaken
      };
    });

    // Get topper's information
    const topper = rankedResults.length > 0 ? rankedResults[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        userRank,
        totalParticipants: allResults.length,
        userPercentage: userResult.percentage,
        topper: topper ? {
          name: topper.name,
          percentage: topper.percentage,
          timeTaken: topper.timeTaken
        } : null,
        leaderboard: rankedResults.slice(0, 10) // Top 10 performers
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching rank:", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}