import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { name, email, password, username, phoneNumber } = await req.json();

        // Input validation
        if (!name || !email || !password || !username) {
            return NextResponse.json(
                { message: "All required fields must be filled" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check for existing user
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Username or email already exists" },
                { status: 409 }
            );
        }

        const user = await User.create({
                name:       name.trim(),
                email:      email.toLowerCase().trim(),
                password,                      // ← pass raw password here
                username: username.toLowerCase().trim(),
                phoneNumber: phoneNumber?.trim(),
                role: "student"
            });

       
        return NextResponse.json(
            { 
                message: "Account created successfully",
                user: { 
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    username: user.username
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "Server error, please try again later" },
            { status: 500 }
        );
    }
}