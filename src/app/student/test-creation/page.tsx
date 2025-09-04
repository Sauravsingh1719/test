// app/student/create-test/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import TestCreate from "@/components/Testcreate";

export default async function StudentCreateTestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only students can access this page.</p>
        </div>
      </div>
    );
  }

  return <TestCreate userRole={session.user.role} />;
}   