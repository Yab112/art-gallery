import { useFetchData } from "@/hooks/use-query";

interface PlatformSettings {
  platformCommissionRate: number; // Percentage (0-100)
  siteName: string;
}

interface PlatformSettingsResponse {
  success: boolean;
  settings: PlatformSettings;
}

export const usePlatformSettings = () => {
  return useFetchData<PlatformSettingsResponse>(
    ["settings", "platform"],
    "settings/platform",
    {
      staleTime: 30 * 60 * 1000, // 30 minutes - settings don't change often
      refetchOnWindowFocus: false,
    }
  );
};

