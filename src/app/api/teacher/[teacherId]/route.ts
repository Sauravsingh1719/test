import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import Category from "@/models/Category"; // Import Category model
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    const { teacherId } = await params; // Properly await and destructure params

    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (token.role === "teacher" && token.sub !== teacherId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const teacher = await User.findById(teacherId)
      .select("-password")
      .populate("category", "name");

    if (!teacher || teacher.role !== "teacher") {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, teacher }, { status: 200 });
  } catch (error) {
    console.error("Error in teacher API:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    const { teacherId } = await params;

    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (token.role === "teacher" && token.sub !== teacherId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const { password, phoneNumber } = await request.json();
    const teacher = await User.findById(teacherId).select("+password");

    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 400 }
      );
    }

    if (phoneNumber) {
      teacher.phoneNumber = phoneNumber;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      teacher.password = await bcrypt.hash(password, salt);
    }

    await teacher.save();

    return NextResponse.json(
      { success: true, message: "Teacher details updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating teacher:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    await dbConnect();
    const token = await getToken({ req: request });
    const { teacherId } = await params;

    if (!token || (token.role !== "admin" && token.role !== "teacher")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (token.role === "teacher" && token.sub !== teacherId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return NextResponse.json(
        { success: false, message: "Teacher not found" },
        { status: 400 }
      );
    }

    await teacher.deleteOne();
    return NextResponse.json(
      { success: true, message: "Teacher deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}