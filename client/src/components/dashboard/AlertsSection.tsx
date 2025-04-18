import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Maintenance } from "@shared/schema";

const AlertsSection: React.FC = () => {
  const { data: maintenanceData, isLoading } = useQuery({
    queryKey: ["/api/maintenance"],
  });

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!maintenanceData || maintenanceData.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">No alerts at this time.</p>
      </div>
    );
  }

  // Filter out completed maintenance tasks
  const activeMaintenanceTasks = maintenanceData.filter(
    (maintenance: Maintenance) => !maintenance.completed
  );

  if (activeMaintenanceTasks.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">No alerts at this time.</p>
      </div>
    );
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "maintenance":
        return "ri-tools-line";
      case "refueling":
        return "ri-gas-station-line";
      case "repairs":
        return "ri-error-warning-line";
      default:
        return "ri-error-warning-line";
    }
  };

  const getBackgroundForType = (type: string) => {
    switch (type) {
      case "maintenance":
        return "bg-red-100";
      case "refueling":
        return "bg-amber-100";
      case "repairs":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getTextColorForType = (type: string) => {
    switch (type) {
      case "maintenance":
        return "text-red-600";
      case "refueling":
        return "text-amber-600";
      case "repairs":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {activeMaintenanceTasks.map((maintenance: Maintenance, index: number) => (
        <div 
          key={maintenance.id} 
          className={`p-4 ${index < activeMaintenanceTasks.length - 1 ? "border-b border-gray-200" : ""}`}
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-full p-2 ${getBackgroundForType(maintenance.type)}`}>
              <i className={`${getIconForType(maintenance.type)} text-xl ${getTextColorForType(maintenance.type)}`}></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">
                {maintenance.type === "maintenance" && "Maintenance due"}
                {maintenance.type === "refueling" && "Refueling needed"}
                {maintenance.type === "repairs" && "Repairs needed"}
                {maintenance.type === "other" && "Attention needed"}
              </h3>
              <p className="text-sm text-gray-500">{maintenance.notes || "No additional details"}</p>
            </div>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
              >
                View
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertsSection;
