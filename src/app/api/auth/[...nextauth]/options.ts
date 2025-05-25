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
                                    username: adminUser.username
                                };
                                }


                await dbConnect();
                try {
                    const user = await User.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ],
                    }).select('+password');

                    if (!user) {
                        throw new Error('No user found');
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error('Password incorrect');
                    }

                    return {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        role: user.role
                    };
                } catch (err: any) {
                    throw new Error(err);
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id;
                token.role = user.role;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user = {
                    _id: token._id as string,
                    role: token.role as 'admin' | 'student' | 'teacher',
                    username: token.username as string,
                    name: token.name,
                    email: token.email
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