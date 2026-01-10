import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/hooks/use-axios-auth";

/**
 * Component that prefetches categories and talent types on app mount
 * This ensures data is available immediately when the mega menu is opened
 * Data is cached and only refetched when stale (based on staleTime)
 */
export function DataPrefetcher() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch categories
    queryClient.prefetchQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const response = await api.get("/categories");
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && "categories" in data && Array.isArray(data.categories)) {
          return data.categories;
        }
        return [];
      },
      staleTime: 30 * 60 * 1000, // 30 minutes
    });

    // Prefetch talent types
    queryClient.prefetchQuery({
      queryKey: ["talent-types"],
      queryFn: async () => {
        const response = await api.get("/talent-types");
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        }
        if (data && "data" in data && Array.isArray(data.data)) {
          return data.data;
        }
        if (data && "success" in data && data.success && Array.isArray((data as any).data)) {
          return (data as any).data;
        }
        return [];
      },
      staleTime: 30 * 60 * 1000, // 30 minutes
    });
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}












