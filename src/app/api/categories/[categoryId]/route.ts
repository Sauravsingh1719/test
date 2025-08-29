import dbConnect from "@/app/lib/dbConnect";
import Category from "@/models/Category";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { categoryId: string } }) {
    try {
      await dbConnect();
      const token = await getToken({ req: request });
      const categoryId = await params.categoryId;
  
      if (!token || (token.role !== "admin" && token.role !== "teacher")) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
  
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
      }
  
      return NextResponse.json({
        success: true,
        data: {
          _id: category._id,
          name: category.name,
          description: category.description,
          subcategories: category.subcategories.length,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch category" },
        { status: 500 }
      );
    }
  }

export async function PUT(request: NextRequest, {params}:{params: {categoryId: string}}) {
        try {
            await dbConnect();
            const token = await getToken({req: request});
            const categoryId = await params.categoryId;

            if(!token || (token.role !=='admin' && token.role !== 'teacher')) {
                return NextResponse.json(
                    {success: false, error: 'Unauthorized'},
                    {status: 401}
                )
            }

            const { name, description } = await request.json();
            const category = await Category.findById(categoryId)

            if(!category){
                return NextResponse.json({
                    success: false, error: 'Category not found'
                }, {status: 404})
            }

            if (name && name !== category.name){
                const existing = await Category.findOne({ name });
                if(existing){
                    return NextResponse.json({
                        success: false, error: 'Category already existing'
                }, {status: 409});
                }

                category.name = name;
            }

            if(description !== undefined) category.description = description;
            await category.save();

            return NextResponse.json({
                success: true,
                data:
                {
                    _id: category._id,
                    name: category.name,
                    description: category.description,
                    subcategories: category.subcategories.length
                }
            });
        } catch (error) {
            return NextResponse.json({
                success: false,
                message: 'Failed to update Category'
            }, {status: 500})
        }
}

export async function DELETE(request: NextRequest, {params}: {params: {categoryId: string}}){
    try{
        await dbConnect();
        const token = await getToken({req: request});
        const categoryId = await params.categoryId;

        if(!token || token.role !== 'admin'){
            return NextResponse.json({
                success: false,
                error: 'Unauthorized'
            }, {status:404})
        }

        const category = await Category.findById(categoryId);
        if(!category){
            return NextResponse.json({
                success: false,
                error: 'Category does not exist'
            }, {status:400})
        }
        await Category.deleteOne({_id: categoryId})

        return NextResponse.json({
            success: true,
            Message: 'Category deleted successfully'
        }, {status:200})
    } catch(error){
            return NextResponse.json({
                success: false,
                message: 'Not able ot delete Category'
            }, {status: 500})
    }
}