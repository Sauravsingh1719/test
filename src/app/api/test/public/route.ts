import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import "@/models/Category";
import "@/models/User";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const tests = await Test.find()
      .select("title description duration category createdBy createdAt") // category (lowercase)
      .populate("category", "name")   // populate the 'category' field
      .populate("createdBy", "name")  // populate user name for createdBy
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: tests }, { status: 200 });
  } catch (err) {
    console.error("GET /api/test/public error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
