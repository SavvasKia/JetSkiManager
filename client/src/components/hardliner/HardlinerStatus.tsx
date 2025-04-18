import React from "react";
import { useQuery } from "@tanstack/react-query";
import { JetSki, JetSkiStatus } from "@shared/schema";
import { useHardlinerAvailability } from "@/hooks/useHardlinerAvailability";
import { formatRelativeTime } from "@/lib/utils";

const HardlinerStatus: React.FC = () => {
  const { data: jetSkis, isLoading: loadingJetSkis } = useQuery({
    queryKey: ["/api/jetskis"],
  });
  
  const { availabilityData, isLoading: loadingAvailability } = useHardlinerAvailability();

  if (loadingJetSkis || loadingAvailability) {
    return (
      <div className="animate-pulse bg-white shadow-sm rounded-lg p-6">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Get Hardliner jetskis
  const hardlinerJetSkis = jetSkis ? jetSkis.filter((jetSki: JetSki) => jetSki.brand.toLowerCase() === 'hardliner') : [];
  
  // Count available hardliners
  const availableHardliners = hardlinerJetSkis.filter((jetSki: JetSki) => jetSki.status === JetSkiStatus.AVAILABLE);
  
  // Get next available time
  const nextAvailableTime = availabilityData && availabilityData.length > 0 
    ? availabilityData[0].from 
    : null;

  return (
    <div className="bg-white shadow-sm rounded-lg p-5">
      <h2 className="text-lg font-medium text-gray-900 mb-3">Hardliner Fleet Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-green-100 text-green-600">
              <i className="ri-checkbox-circle-line text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Available Now</h3>
              <p className="text-xl font-bold text-gray-800">
                {availableHardliners.length} Hardliners
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-blue-100 text-blue-600">
              <i className="ri-time-line text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Total Hardliners</h3>
              <p className="text-xl font-bold text-gray-800">
                {hardlinerJetSkis.length} Units
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-full p-2 bg-amber-100 text-amber-600">
              <i className="ri-calendar-check-line text-xl"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Next Available</h3>
              <p className="text-xl font-bold text-gray-800">
                {availableHardliners.length > 0 
                  ? "Now" 
                  : nextAvailableTime 
                    ? formatRelativeTime(nextAvailableTime)
                    : "None scheduled"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HardlinerStatus;
