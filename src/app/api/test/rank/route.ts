// src/app/api/test/rank/route.ts
import dbConnect from "@/app/lib/dbConnect";
import Rank from "@/models/Rank"; // Use Rank model instead of Result
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await request.json();
    
    if (!testId || !mongoose.isValidObjectId(testId)) {
      return NextResponse.json({ success: false, error: "Invalid test ID" }, { status: 400 });
    }

    // Check if the user has a rank entry for this test
    const userRankEntry = await Rank.findOne({
      testId: new mongoose.Types.ObjectId(testId),
      userId: new mongoose.Types.ObjectId(token.sub)
    });

    if (!userRankEntry) {
      return NextResponse.json({ 
        success: false, 
        error: "You haven't taken this test yet" 
      }, { status: 404 });
    }

    // Get all rank entries for this test, sorted by percentage (desc) and timeTaken (asc)
    const allRanks = await Rank.find({ 
      testId: new mongoose.Types.ObjectId(testId) 
    })
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

    const rankedResults = allRanks.map((rank, index) => {
      // If percentage is different from previous, increment rank
      // If percentage is same but time taken is different, increment rank
      if (index > 0 && (
        rank.percentage !== previousPercentage ||
        (rank.percentage === previousPercentage && rank.timeTaken !== previousTimeTaken)
      )) {
        currentRank = index + 1;
      }

      previousPercentage = rank.percentage;
      previousTimeTaken = rank.timeTaken;

      // Check if this is the current user's rank
      if (rank.userId._id.toString() === token.sub) {
        userRank = currentRank;
      }

      return {
        rank: currentRank,
        userId: rank.userId._id,
        name: rank.userId.name,
        percentage: rank.percentage,
        timeTaken: rank.timeTaken
      };
    });

    // Get topper's information
    const topper = rankedResults.length > 0 ? rankedResults[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        userRank,
        totalParticipants: allRanks.length,
        userPercentage: userRankEntry.percentage,
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