import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { JetSki, JetSkiStatus } from "@shared/schema";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const FleetTable: React.FC = () => {
  const { toast } = useToast();
  const [selectedJetSki, setSelectedJetSki] = useState<JetSki | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<JetSkiStatusType>("");
  
  const { data: jetSkis, isLoading } = useQuery({
    queryKey: ["/api/jetskis"],
  });
  
  const handleStatusChange = async () => {
    if (!selectedJetSki || !newStatus) return;
    
    try {
      await apiRequest('PATCH', `/api/jetskis/${selectedJetSki.id}`, { status: newStatus });
      
      toast({
        title: "Status updated",
        description: `JetSki status changed to ${newStatus.replace('_', ' ')}`
      });
      
      // Close dialog and refresh data
      setIsStatusDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/jetskis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    } catch (error) {
      console.error("Error updating JetSki status:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update JetSki status"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="animate-pulse bg-white shadow-sm rounded-lg p-6">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!jetSkis || jetSkis.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p>No jet skis found.</p>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JetSki Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Maintenance</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours Used</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jetSkis.map((jetSki: JetSki) => (
              <tr key={jetSki.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-light bg-opacity-10 rounded-full flex items-center justify-center">
                      <i className="ri-ship-line text-lg text-primary"></i>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{jetSki.name}</div>
                      <div className="text-sm text-gray-500">ID: JK-{jetSki.id.toString().padStart(3, '0')}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={jetSki.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jetSki.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {jetSki.lastMaintenanceDate ? formatDate(jetSki.lastMaintenanceDate).split(',')[0] : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jetSki.hoursUsed || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedJetSki(jetSki);
                        setNewStatus(jetSki.status);
                        setIsStatusDialogOpen(true);
                      }}
                    >
                      Change Status
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary-dark"
                    >
                      Manage
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change JetSki Status</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">
              Update the status for <span className="font-semibold">{selectedJetSki?.name}</span>
            </p>
            <Select
              value={newStatus}
              onValueChange={(value) => setNewStatus(value as JetSkiStatusType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={JetSkiStatus.AVAILABLE}>Available</SelectItem>
                <SelectItem value={JetSkiStatus.IN_USE}>In Use</SelectItem>
                <SelectItem value={JetSkiStatus.REFUELING}>Refueling</SelectItem>
                <SelectItem value={JetSkiStatus.MAINTENANCE}>Maintenance</SelectItem>
                <SelectItem value={JetSkiStatus.BROKEN}>Broken</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleStatusChange} className="bg-primary hover:bg-primary-dark">
                Update Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FleetTable;
