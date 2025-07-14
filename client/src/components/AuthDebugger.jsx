
import { useQuery } from "@tanstack/react-query";

export default function AuthDebugger() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/verify"],
    retry: false,
  });

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs max-w-xs">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-400">Error: {error.message}</p>}
      {user && (
        <div>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Org:</strong> {user.organizationId || 'None'}</p>
        </div>
      )}
    </div>
  );
}
