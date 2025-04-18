import React from "react";
import { useHardlinerAvailability } from "@/hooks/useHardlinerAvailability";
import { formatDate, formatTimeRangeShort, getDurationInHours } from "@/lib/utils";
import { JetSki } from "@shared/schema";

const AvailableCombinations: React.FC = () => {
  const { availabilityData, isLoading } = useHardlinerAvailability();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white shadow-sm rounded-lg p-6">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!availabilityData || availabilityData.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Available Combinations</h3>
          <p className="mt-1 text-sm text-gray-500">When multiple Hardliner jet skis are available at the same time</p>
        </div>
        <div className="px-4 py-5">
          <p className="text-gray-500 text-center">No available Hardliner combinations found at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Available Combinations</h3>
        <p className="mt-1 text-sm text-gray-500">When multiple Hardliner jet skis are available at the same time</p>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Number of JetSkis
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available From
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Available Until
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duration
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              JetSki Names
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {availabilityData.map((availability, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{availability.count} JetSki{availability.count > 1 ? 's' : ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(availability.from)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(availability.until)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getDurationInHours(availability.from, availability.until)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-2">
                  {availability.jetSkis.map((jetSki: JetSki) => (
                    <span 
                      key={jetSki.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary bg-opacity-10 text-primary"
                    >
                      {jetSki.name}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailableCombinations;
