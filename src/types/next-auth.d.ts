import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            _id?: string;
            role?: 'admin' | 'student' | 'teacher';
            username?: string;
            name?: string;
            email?: string;
            category?: string | { _id: string; name: string } | null;
        } & DefaultSession["user"];
    }
    
    interface User {
        _id?: string | mongoose.Types.ObjectId;
        role?: 'admin' | 'student' | 'teacher';
        username?: string;
        category?: string | { _id: string; name: string } | null;
        name?: string;
        email?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string | mongoose.Types.ObjectId;
        role?: 'admin' | 'student' | 'teacher';
        username?: string;
        category?: string | { _id: string; name: string } | null;
        name?: string;
        email?: string;
    }
}


declare module "next-auth" {
  interface Session {
    user: {
      _id?: string | mongoose.Types.ObjectId;
      role?: 'admin' | 'student' | 'teacher';
      username?: string;
      name?: string;
      email?: string;
      category?: string | { _id: string; name: string } | null;
    } & DefaultSession['user'];
  }
}