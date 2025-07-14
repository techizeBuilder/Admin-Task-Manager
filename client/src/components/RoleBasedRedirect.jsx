import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function RoleBasedRedirect() {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/verify"],
    retry: false,
  });

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not authenticated, redirect to login
      setLocation('/login');
      return;
    }

    // Redirect based on user role
    if (user.role === 'super_admin' || user.role === 'superadmin') {
      setLocation('/super-admin');
    } else if (user.role === 'admin' || user.role === 'member' || user.role === 'employee' || user.role === 'individual') {
      setLocation('/dashboard');
    } else {
      // Unknown role, redirect to login
      setLocation('/login');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}