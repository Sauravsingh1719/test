import dbConnect from "@/app/lib/dbConnect";
import Category from "@/models/Category";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


const isAuthorized = (role?: string) => 
    role === 'admin' || role === 'teacher';

export async function GET(){
    try {
        await dbConnect();
        const categories = await Category.find().sort({createdAt: -1})
        return NextResponse.json({success: true, data: categories});
    } catch(error){
        return NextResponse.json(
            {
                success: false, error: "Failed to fetch Categories"
            },
            {status:500}
        );
    }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token || !isAuthorized(token.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, description, subcategories = [] } = await request.json();
    if (!name.trim()) {
      return NextResponse.json({ success: false, error: "Category name required" }, { status: 400 });
    }

    const newCategory = await Category.create({
      name,
      description,
      subcategories: subcategories.map((sub: any) => ({
        ...sub,
        createdBy: token._id!
      })),
      createdBy: token._id!
    });

    return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/categories error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, error: "Category already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Category creation failed" }, { status: 500 });
  }
}

