import dbConnect from "@/app/lib/dbConnect";
import Category from "@/models/Category";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { categoryId: string } }) {
    await dbConnect();
    const token = await getToken({ req: request });
  
    if (!token || token.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
  
    const category = await Category.findById(params.categoryId);
  
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }
  
    return NextResponse.json({
      success: true,
      subcategories: category.subcategories,
    });
  }

export async function POST(request: NextRequest, {params}: {params: {categoryId: string}}) {
    await dbConnect();

    const token = await getToken({req: request});
    if(!token || token.role !== 'admin'){
        return NextResponse.json({
            success: false,
            message: 'Unauthorized'
        }, {status:400})
    }

    const {name, description} = await request.json();
    if(!name){
        return NextResponse.json({
            success: false,
            message: 'Name is required'
        }, {status: 400})
    }

    const cat = await Category.findById(params.categoryId);
    if(!cat){
        return NextResponse.json({
            success: false,
            message: 'Category not found'
        }, 
    {
        status:400
    })
    }

    if (cat.subcategories.some((s: any) => s.name === name)){
        return NextResponse.json({
            success: false,
            message: 'Subcategory with same name already exists'
        }, {status:400})
    }

    cat.subcategories.push({name, description: description || '', createdBy: token.sub})
    await cat.save();
    return NextResponse.json({
        success: true,
        message: 'Subcategory added successfully'
    })
}