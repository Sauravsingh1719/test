import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    const {name, email, password, username, phoneNumber} = await req.json();

    if(!name || !email || !password || !username) {
        return NextResponse.json({message: "Please fill all the fields"}, {status: 400});
    }

    await dbConnect();

    const existingUser = await User.findOne({ $or: [{email}, {username}] });
    if(existingUser) {
        return NextResponse.json({message: "User already exists"}, {status: 400});
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        password: passwordHash,
        username,
        phoneNumber,
        role: "student"
    });
    return NextResponse.json({ user: { id: user._id, role: user.role } }, { status: 201 });
}