import dbConnect from "@/app/lib/dbConnect";
import Category    from "@/models/Category";
import Test        from "@/models/Test";
import User        from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();

    
    const [ totalTests, totalTeachers, totalStudents , totalCategories ] = await Promise.all([
      Test.countDocuments(),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "student" }),
      Category.countDocuments()
    ]);

    
    const totalSubcategories = await Category.aggregate([
      { $unwind: "$subcategories" },
      { $count: "total" }       // ← correct usage
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalTests,
        totalTeachers,
        totalStudents,
        totalCategories,
        totalSubcategories: totalSubcategories[0]?.total || 0
      }
    });

  } catch (error) {
    console.error(" — /api/stats GET error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
