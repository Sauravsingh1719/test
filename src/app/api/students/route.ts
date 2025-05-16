// app/api/students/route.ts
import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access'
      }, { status: 401 });
    }

    await dbConnect();

    const students = await User.find({ role: "student" })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({ students }, { status: 200 });

  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({
      success: false,
      message: 'Server error occurred'
    }, { status: 500 });
  }
}