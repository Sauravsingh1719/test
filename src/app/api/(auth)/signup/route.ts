import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendVerificationEmail } from "@/app/helpers/sendVerificationEmail";

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
                { email: email },
                { username: username }
            ]
        });

        // Generate verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour

        if (existingUser) {
            // If user exists and is verified, return error
            if (existingUser.isVerified) {
                return NextResponse.json(
                    { message: "User already exists with this email or username" },
                    { status: 409 }
                );
            } else {
                // User exists but not verified, update with new code
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUser.name = name.trim();
                existingUser.password = hashedPassword;
                existingUser.verifyCode = verifyCode;
                existingUser.verifyCodeExpiry = verifyCodeExpiry;
                await existingUser.save();
            }
        } else {            
            const user = await User.create({
                name: name.trim(),
                email: email.trim(),
                password,
                username: username.trim(),
                phoneNumber: phoneNumber?.trim(),
                role: "student",
                isVerified: false,
                verifyCode: verifyCode,
                verifyCodeExpiry: verifyCodeExpiry
            });
        }

        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return NextResponse.json(
                { message: "User registered but failed to send verification email. Please contact support." },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { 
                message: "Account created successfully. Please check your email for verification code.",
                username: username
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