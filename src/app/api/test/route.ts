import dbConnect from "@/app/lib/dbConnect";
import Test from "@/models/Test";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token.role !== 'admin' && token.role !== 'teacher')) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  let tests;
  if (token.role === 'admin') {
    tests = await Test.find().populate('category').populate('createdBy', 'name email');
  } else {
  
    tests = await Test.find({ createdBy: token.sub }).populate('category').populate('createdBy', 'name email');
  }

  return NextResponse.json({ success: true, tests }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token || (token.role !== 'admin' && token.role !== 'teacher')) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const { title, category, description, questions, duration } = data;
  if (!title || !category || !Array.isArray(questions) || questions.length < 5 || !duration) {
    return NextResponse.json({ success: false, message: "Missing or invalid fields" }, { status: 400 });
  }

  await dbConnect();

  try {
    const test = await Test.create({
      title,
      category,
      description: description || '',
      questions,
      duration,
      createdBy: token.sub
    });
    return NextResponse.json({ success: true, test }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}