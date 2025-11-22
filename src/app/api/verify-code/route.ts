import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const user = await User.findOne({ username });

        if (!user) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "User not found" 
                },
                { status: 404 }
            );
        }

        // Check if code is valid and not expired
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            user.verifyCode = undefined;
            user.verifyCodeExpiry = undefined;
            await user.save();

            return NextResponse.json(
                { 
                    success: true, 
                    message: "Account verified successfully! You can now sign in." 
                },
                { status: 200 }
            );
        } else if (!isCodeNotExpired) {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Verification code has expired. Please request a new one." 
                },
                { status: 400 }
            );
        } else {
            return NextResponse.json(
                { 
                    success: false, 
                    message: "Invalid verification code. Please check and try again." 
                },
                { status: 400 }
            );
        }

    } catch (error) {
        console.error("Error verifying code:", error);
        return NextResponse.json(
            { 
                success: false, 
                message: "Error verifying code" 
            },
            { status: 500 }
        );
    }
}