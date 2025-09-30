import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Mock API configuration
const MOCK_API_BASE_URL = "http://localhost:3001";
const USE_MOCK_API = true; // Set to false to use real backend

export async function apiRequest(method, url, data) {
  const token = localStorage.getItem("token");
  const headers = {
    ...(data ? { "Content-Type": "application/json" } : {}),
    ...(token && !USE_MOCK_API ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Use mock API if enabled, otherwise use original backend
  const baseUrl = USE_MOCK_API ? MOCK_API_BASE_URL : "";
  const fullUrl = `${baseUrl}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: USE_MOCK_API ? "omit" : "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const token = localStorage.getItem("token");

    console.log("=== API REQUEST DEBUG ===");
    console.log("URL:", queryKey[0]);
    console.log("Using Mock API:", USE_MOCK_API);
    console.log("Token exists:", !!token);

    // For mock API, skip token requirement for auth verify endpoint
    if (USE_MOCK_API && !token && queryKey[0] === "/api/auth/verify") {
      console.log("Mock API: Allowing auth/verify without token");
    } else if (!USE_MOCK_API && !token) {
      console.log("ERROR: No token found in localStorage");
      throw new Error("No authentication token found");
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token && !USE_MOCK_API ? { Authorization: `Bearer ${token}` } : {}),
    };

    console.log("Headers being sent:", headers);

    // Use mock API if enabled, otherwise use original backend
    const baseUrl = USE_MOCK_API ? MOCK_API_BASE_URL : "";
    const fullUrl = `${baseUrl}${queryKey[0]}`;

    const res = await fetch(fullUrl, {
      method: "GET",
      headers,
      credentials: USE_MOCK_API ? "omit" : "include",
    });

    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log("401 unauthorized, returning null");
      return null;
    }

    if (!res.ok) {
      const errorText = await res.text();
      console.log("Error response body:", errorText);
      throw new Error(`${res.status}: ${errorText}`);
    }

    const data = await res.json();
    console.log("user data in query client : ", data);
    console.log(
      "Success response:",
      Array.isArray(data) ? `Array[${data.length}]` : typeof data,
    );
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: Infinity, // Always consider data stale for fresh updates
      gcTime: 0, // Don't cache data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
