import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import Category from "@/models/Category";
import mongoose from "mongoose";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher" && token.role !== "student")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let tests;
    if (token.role === "admin") {
      tests = await Test.find()
        .populate("category", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    } else {
      tests = await Test.find({ createdBy: token.sub })
        .populate("category", "name")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ success: true, data: tests }, { status: 200 });
  } catch (err) {
    console.error("GET /api/test error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, category, description, questions, duration, marks } = data;

    // Minimal required checks
    if (!title || !category || !Array.isArray(questions) || questions.length < 1 || !duration) {
      return NextResponse.json({ success: false, error: "Missing or invalid fields" }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(category)) {
      return NextResponse.json({ success: false, error: "Invalid category id" }, { status: 400 });
    }

    await dbConnect();

    
    const cat = await Category.findById(category);
    if (!cat) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }

    const test = await Test.create({
      title: title.trim(),
      category,
      description: description || "",
      questions,
      duration,
      marks: marks || { correct: 1, wrong: 0, unanswered: 0 }, 
      createdBy: new mongoose.Types.ObjectId(token.sub)
    });

    return NextResponse.json({ success: true, data: test }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/test error:", err);
    return NextResponse.json({ success: false, error: err.message || "Server error" }, { status: 500 });
  }
}
