import React from "react";
import { useQuery } from "@tanstack/react-query";
import { JetSki } from "@shared/schema";
import StatusBadge from "@/components/ui/StatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { formatRelativeTime } from "@/lib/utils";

const JetSkiStatusTable: React.FC = () => {
  const { data: jetSkis, isLoading } = useQuery({
    queryKey: ["/api/jetskis"],
  });
  
  const { getJetSkiCurrentBooking, getJetSkiNextAvailable } = useBookings();

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!jetSkis || jetSkis.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">No jet skis found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JetSki</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Booking</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Available</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jetSkis.map((jetSki: JetSki) => {
            const currentBooking = getJetSkiCurrentBooking(jetSki.id);
            const nextAvailableTime = getJetSkiNextAvailable(jetSki.id);
            
            return (
              <tr key={jetSki.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-light bg-opacity-10 rounded-full flex items-center justify-center">
                      <i className="ri-ship-line text-lg text-primary"></i>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{jetSki.name}</div>
                      <div className="text-sm text-gray-500">{jetSki.brand}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={jetSki.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{jetSki.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {currentBooking ? currentBooking.customerName : 'None'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {jetSki.status === 'available' ? 'Now' : formatRelativeTime(nextAvailableTime)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default JetSkiStatusTable;
