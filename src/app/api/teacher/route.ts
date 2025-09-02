import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    await dbConnect();
  
    const teachers = await User.find({ role: "teacher" }).select("-password"); // exclude password
  
    return NextResponse.json({ teachers }, { status: 200 });
  }


export async function POST(request: NextRequest) {

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET});
    if(!token || token.role!= 'admin') {
        return NextResponse.json ({error: 'unauthorized'}, {status:401})
    }

    const {name, email, password, username, phoneNumber, category} = await request.json();

    if(!name || !email || !username || !phoneNumber || !password || !category) {
        return NextResponse.json({message: "Please fill all the fields"}, {status:400})
    }

    await dbConnect();

    const existingUser = await User.findOne({ $or: [{email}, {username}]})
    if(existingUser){
        return NextResponse.json({message:"Already exists"})
    }

    
    const user = await User.create({
        name, 
        email,
        username,
        phoneNumber,
        password,
        role: 'teacher',
        category
    });

    return NextResponse.json({ user: { id: user._id, role: user.role } }, { status: 201 });
}