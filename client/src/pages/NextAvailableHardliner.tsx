import React, { useEffect } from "react";
import HardlinerStatus from "@/components/hardliner/HardlinerStatus";
import AvailableCombinations from "@/components/hardliner/AvailableCombinations";
import HardlinerSchedule from "@/components/hardliner/HardlinerSchedule";
import { Button } from "@/components/ui/button";
import { useHardlinerAvailability } from "@/hooks/useHardlinerAvailability";

const NextAvailableHardliner: React.FC = () => {
  const { refreshData } = useHardlinerAvailability();

  useEffect(() => {
    document.title = "Next Available Hardliner | JetSki Manager";
  }, []);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Next Available Hardliner</h1>
          <div className="mt-3 md:mt-0">
            <Button 
              variant="outline"
              onClick={refreshData}
            >
              <i className="ri-refresh-line mr-2"></i> Refresh Data
            </Button>
          </div>
        </div>

        {/* Hardliner Status Overview */}
        <HardlinerStatus />

        {/* Available Combinations Table */}
        <div className="mt-6">
          <AvailableCombinations />
        </div>

        {/* Hardliner Detailed Schedule */}
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Hardliner Detailed Schedule</h2>
        <HardlinerSchedule />
      </div>
    </section>
  );
};

export default NextAvailableHardliner;
