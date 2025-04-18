import React from "react";
import { useQuery } from "@tanstack/react-query";
import { JetSki, JetSkiStatus } from "@shared/schema";
import StatusBadge from "@/components/ui/StatusBadge";
import { useBookings } from "@/hooks/useBookings";
import { formatRelativeTime } from "@/lib/utils";

const HardlinerSchedule: React.FC = () => {
  const { data: jetSkis, isLoading } = useQuery({
    queryKey: ["/api/jetskis"],
  });
  
  const { getJetSkiCurrentBooking, getJetSkiNextAvailable } = useBookings();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white shadow-sm rounded-lg p-6">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Filter for only Hardliner jetskis
  const hardlinerJetSkis = jetSkis
    ? jetSkis.filter((jetSki: JetSki) => jetSki.brand.toLowerCase() === 'hardliner')
    : [];

  if (hardlinerJetSkis.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <p className="text-gray-500">No Hardliner jet skis found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              JetSki Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current/Next Booking
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available From
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hardlinerJetSkis.map((jetSki: JetSki) => {
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
                      <div className="text-sm text-gray-500">Hardliner</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={jetSki.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {currentBooking ? (
                    <>
                      {formatRelativeTime(currentBooking.startTime)} - {formatRelativeTime(currentBooking.endTime)}
                      <div className="text-xs text-gray-400">{currentBooking.customerName}</div>
                    </>
                  ) : (
                    "No current booking"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {jetSki.status === JetSkiStatus.AVAILABLE 
                    ? "Now" 
                    : formatRelativeTime(nextAvailableTime)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {jetSki.status === JetSkiStatus.MAINTENANCE && "Regular service check"}
                  {jetSki.status === JetSkiStatus.REFUELING && "Refueling in progress"}
                  {jetSki.status === JetSkiStatus.AVAILABLE && "Good condition"}
                  {jetSki.status === JetSkiStatus.IN_USE && "Recently serviced"}
                  {jetSki.status === JetSkiStatus.BROKEN && "Needs repair"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HardlinerSchedule;
