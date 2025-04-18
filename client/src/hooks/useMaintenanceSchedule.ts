import { useQuery } from "@tanstack/react-query";
import { Maintenance } from "@shared/schema";

export function useMaintenanceSchedule() {
  const { data: maintenanceSchedules, isLoading, error } = useQuery({
    queryKey: ["/api/maintenance"],
  });

  const getMaintenanceSchedule = (id: number): Maintenance | undefined => {
    if (!maintenanceSchedules) return undefined;
    return maintenanceSchedules.find((schedule: Maintenance) => schedule.id === id);
  };

  const getJetSkiMaintenanceSchedules = (jetSkiId: number): Maintenance[] => {
    if (!maintenanceSchedules) return [];
    return maintenanceSchedules.filter((schedule: Maintenance) => schedule.jetSkiId === jetSkiId);
  };

  const getActiveMaintenanceSchedules = (): Maintenance[] => {
    if (!maintenanceSchedules) return [];
    return maintenanceSchedules.filter((schedule: Maintenance) => !schedule.completed);
  };

  const getPendingMaintenanceCount = (): number => {
    if (!maintenanceSchedules) return 0;
    return maintenanceSchedules.filter(
      (schedule: Maintenance) => !schedule.completed && schedule.type === 'maintenance'
    ).length;
  };

  const getRefuelingNeededCount = (): number => {
    if (!maintenanceSchedules) return 0;
    return maintenanceSchedules.filter(
      (schedule: Maintenance) => !schedule.completed && schedule.type === 'refueling'
    ).length;
  };

  const getJetSkiCurrentMaintenance = (jetSkiId: number): Maintenance | undefined => {
    if (!maintenanceSchedules) return undefined;
    const now = new Date();
    return maintenanceSchedules.find(
      (schedule: Maintenance) => 
        schedule.jetSkiId === jetSkiId && 
        !schedule.completed &&
        new Date(schedule.startTime) <= now && 
        new Date(schedule.endTime) > now
    );
  };

  return {
    maintenanceSchedules,
    isLoading,
    error,
    getMaintenanceSchedule,
    getJetSkiMaintenanceSchedules,
    getActiveMaintenanceSchedules,
    getPendingMaintenanceCount,
    getRefuelingNeededCount,
    getJetSkiCurrentMaintenance
  };
}
