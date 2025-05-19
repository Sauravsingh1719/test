import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  await dbConnect();
  const token = await getToken({ req: request });
  const studentId = await params.studentId;

  if (!token || (token.role !== "admin"  && token.role !== "student")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
const student = await User.findById(studentId).select("-password");

if (!student) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, student }, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  await dbConnect();
  const token = await getToken({ req: request });
  const studentId = params.studentId;

  if (!token || (token.role !== "admin" && token.role !== "student")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (token.role === "student" && token.sub !== studentId) {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

  const {password, phoneNumber} = await request.json();
  const student = await User.findById(studentId).select("+password");

 if (!student) {
     return NextResponse.json(
       { success: false, message: "Student not found" },
       { status: 400 }
     );
   }
 
   if (phoneNumber) {
     student.phoneNumber = phoneNumber;
   }
 
   if (password) {
     const salt = await bcrypt.genSalt(10);
     student.password = await bcrypt.hash(password, salt);
   }
 
   await student.save();
 
   return NextResponse.json(
     { success: true, message: "Student details updated successfully" },
     { status: 200 }
   );
 }

 export async function DELETE(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  await dbConnect();
  const token = await getToken({ req: request });
  const studentId =  params.studentId;

  if (!token || (token.role !== "admin" && token.role !== "student")) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (token.role === "student" && token.sub !== studentId) {
    return NextResponse.json(
      { success: false, message: "Access denied" },
      { status: 403 }
    );
  }

  const student = await User.findByIdAndDelete(studentId);

  if (!student) {
    return NextResponse.json(
      { success: false, message: "Student not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { success: true, message: "Student deleted successfully" },
    { status: 200 }
  );
}
