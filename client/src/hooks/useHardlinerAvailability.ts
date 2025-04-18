import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { JetSki } from "@shared/schema";

interface AvailabilityCombination {
  count: number;
  from: Date;
  until: Date;
  jetSkis: JetSki[];
}

export function useHardlinerAvailability() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/hardliner/availability"],
    select: (data: any) => {
      if (!data) return [];
      
      // Convert string dates to Date objects
      return data.map((item: any) => ({
        ...item,
        from: new Date(item.from),
        until: new Date(item.until)
      }));
    }
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/hardliner/availability'] });
    queryClient.invalidateQueries({ queryKey: ['/api/jetskis'] });
  };

  return {
    availabilityData: data as AvailabilityCombination[],
    isLoading,
    error,
    refreshData
  };
}
