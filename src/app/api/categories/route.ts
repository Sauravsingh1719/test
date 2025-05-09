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
        try{
            await dbConnect();
            const token = await getToken({req: request});
            if(!token || !isAuthorized(token.role)){
                return NextResponse.json({
                    success: false,
                    message: "Unauthorized"
                },{status: 400});
            }

            const {name, description, subcategories} = await request.json();
            
            if(!name){
                return NextResponse.json({
                    success: false,
                    error: 'Category name required'
                }, {status: 400});
            }

            const newCategory = await Category.create({
                name,
                description,
                subcategories: subcategories?.map((sub: any) => ({
                    ...sub,
                    createdBy: token.sub
                })),
                createdBy: token.sub
            })

            return NextResponse.json({
                success: true, data: newCategory
            }, {status:201})
        }catch(error: any) {
            if(error.code === 11000) {
                return NextResponse.json({
                    success: false, error: 'Category Name already exists'
                }, {status:409});
            }
            return NextResponse.json({
                success: false, error: 'Category creation failed'
            }, {status:500})
        }  
}