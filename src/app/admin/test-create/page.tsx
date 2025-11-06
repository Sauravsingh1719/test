import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/options";
import TestCreate from "@/components/Testcreate";

export default async function AdminCreateTestPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only admins can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <TestCreate 
      userRole={session.user.role} 
      userCategory={session.user.category} 
    />
  );
}
