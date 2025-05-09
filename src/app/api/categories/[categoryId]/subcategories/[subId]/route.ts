import dbConnect from "@/app/lib/dbConnect";
import Category from "@/models/Category";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { categoryId: string; subId: string } }
  ) {
    await dbConnect();
    const token = await getToken({ req });
  
    if (!token || token.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
  
    const category = await Category.findById(params.categoryId);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
  
    const sub = category.subcategories.id(params.subId);
    if (!sub) {
      return NextResponse.json({ success: false, message: "Subcategory not found" }, { status: 404 });
    }
  
    return NextResponse.json({ success: true, subcategory: sub });
  }

export async function PUT(request: NextRequest, {params}: {params: {categoryId: string, subId: string}}) {
    await dbConnect();
    const token = await getToken({req: request})
    if(!token || token.role !== 'admin'){
        return NextResponse.json({
            success: false,
            message: 'Unauthorized'
        }, {status: 400})
    }

    const {name, description} = await request.json()
    const cat = await Category.findById(params.categoryId);
    if(!cat) {
        return NextResponse.json({
            success: false,
            message: 'No Category Found'
        }, {status:404})
    }

    const sub = await cat.subcategories.id(params.subId);
    if(!sub) {
        return NextResponse.json({
            success: false,
            message: 'Subcategory not found'
        }, {status:404})
    }

    if(name && name !== sub.name && cat.subcategories.some((s:any) => s.name === name)){
        return NextResponse.json({
            success: false,
            message: 'Subcategory already exists'
        }, {status:404})
    }

    if(name) sub.name = name;
    if(description !== undefined) sub.description = description;
    await cat.save();
    return NextResponse.json(
        {
           success:true,
            data: sub
        })
}

export async function DELETE(req: NextRequest, { params }: { params: { categoryId: string, subId: string } }) {
    await dbConnect();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET! });
    if (!token || token.role !== 'admin') 
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  
    const cat = await Category.findById(params.categoryId);
    if (!cat) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  
    const sub = cat.subcategories.id(params.subId);
    if (!sub) return NextResponse.json({ success: false, error: 'Subcat not found' }, { status: 404 });
  
    sub.remove();
    await cat.save();
    return NextResponse.json({ success: true, message: 'Subcategory deleted' });
  }