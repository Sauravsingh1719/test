import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            _id: string;
            role: 'admin' | 'student' | 'teacher';
            username: string;
        } & DefaultSession["user"];
    }
    
    interface User {
        _id: string;
        role: 'admin' | 'student' | 'teacher';
        username: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id: string;
        role: 'admin' | 'student' | 'teacher';
        username: string;
    }
}


declare module "next-auth" {
  interface Session {
    user: {
      _id: string;
      role: 'admin' | 'student' | 'teacher';
      username: string;
    } & DefaultSession['user'];
  }
}