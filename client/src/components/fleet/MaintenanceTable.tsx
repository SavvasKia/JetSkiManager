import React from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Maintenance, JetSki } from "@shared/schema";
import { formatTimeRange, getDurationInHours } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MaintenanceTable: React.FC = () => {
  const { toast } = useToast();
  
  const { data: maintenanceData, isLoading: loadingMaintenance } = useQuery({
    queryKey: ["/api/maintenance"],
  });
  
  const { data: jetSkis, isLoading: loadingJetSkis } = useQuery({
    queryKey: ["/api/jetskis"],
  });
  
  const getJetSkiName = (jetSkiId: number) => {
    if (!jetSkis) return "Unknown";
    const jetSki = jetSkis.find((js: JetSki) => js.id === jetSkiId);
    return jetSki ? jetSki.name : "Unknown";
  };
  
  const handleComplete = async (id: number) => {
    try {
      await apiRequest('PATCH', `/api/maintenance/${id}`, { completed: true });
      
      toast({
        title: "Maintenance completed",
        description: "The maintenance task has been marked as completed."
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jetskis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    } catch (error) {
      console.error("Error completing maintenance task:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete maintenance task"
      });
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/maintenance/${id}`);
      
      toast({
        title: "Maintenance deleted",
        description: "The maintenance task has been deleted."
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    } catch (error) {
      console.error("Error deleting maintenance task:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete maintenance task"
      });
    }
  };
  
  if (loadingMaintenance || loadingJetSkis) {
    return (
      <div className="animate-pulse bg-white shadow-sm rounded-lg p-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded w-full"></div>
      </div>
    );
  }
  
  // Filter only active (not completed) maintenance tasks
  const activeMaintenance = maintenanceData
    ? maintenanceData.filter((m: Maintenance) => !m.completed)
    : [];
  
  if (!activeMaintenance || activeMaintenance.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">No active maintenance tasks scheduled.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JetSki</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {activeMaintenance.map((maintenance: Maintenance) => {
            const now = new Date();
            const isInProgress = new Date(maintenance.startTime) <= now && new Date(maintenance.endTime) > now;
            const isUpcoming = new Date(maintenance.startTime) > now;
            
            return (
              <tr key={maintenance.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getJetSkiName(maintenance.jetSkiId)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {maintenance.type.charAt(0).toUpperCase() + maintenance.type.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatTimeRange(maintenance.startTime, maintenance.endTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getDurationInHours(maintenance.startTime, maintenance.endTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isInProgress 
                        ? "bg-blue-100 text-blue-800" 
                        : isUpcoming 
                          ? "bg-gray-100 text-gray-800" 
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isInProgress ? "In Progress" : isUpcoming ? "Scheduled" : "Overdue"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-primary hover:text-primary-dark">
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      className="text-success hover:text-green-700"
                      onClick={() => handleComplete(maintenance.id)}
                    >
                      <i className="ri-checkbox-circle-line"></i>
                    </button>
                    <button 
                      className="text-error hover:text-red-700"
                      onClick={() => handleDelete(maintenance.id)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MaintenanceTable;
