import dbConnect from "@/app/lib/dbConnect";
import User from "@/models/User";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                identifier: { label: 'Identifier', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials: any): Promise<any> {
                const { identifier, password } = credentials;

                // Admin login (skip verification for admin)
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (identifier === adminEmail && password === adminPassword) {
                    const adminUser = await User.findOne({ role: 'admin' });
                    
                    if (!adminUser) {
                        throw new Error('Admin user not found');
                    }

                    return {
                        _id: adminUser._id,  
                        name: adminUser.name,
                        email: adminUser.email,
                        role: adminUser.role,
                        username: adminUser.username,
                        category: null,
                        isVerified: true // Admin is always verified
                    };
                }

                await dbConnect();
                try {
                    // Find user by email or username
                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ],
                    })
                    .select('+password +isVerified') // Add isVerified to select
                    .populate('category', 'name');

                    if (!user) {
                        throw new Error('No user found with this email or username');
                    }

                    // Check if user is verified
                    if (!user.isVerified) {
                        throw new Error('Please verify your email before signing in. Check your email for the verification code.');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error('Password is incorrect');
                    }

                    return {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role,
                        category: user.category,
                        isVerified: user.isVerified
                    };
                } catch (err: any) {
                    throw new Error(err.message || 'Authentication failed');
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user._id?.toString?.() ?? user._id;
                token._id = token.sub;
                token.role = user.role;
                token.username = user.username;
                token.name = user.name ?? token.name;
                token.email = user.email ?? token.email;
                token.category = user.category
                    ? (typeof user.category === 'string' ? user.category : { 
                        _id: user.category._id?.toString?.() ?? user.category._id, 
                        name: user.category.name 
                    })
                    : null;
                token.isVerified = user.isVerified; 
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    _id: token.sub,
                    role: token.role,
                    username: token.username,
                    name: token.name,
                    email: token.email,
                    category: token.category ?? null,
                    isVerified: token.isVerified // Add verification status to session
                };
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in'
    }
};