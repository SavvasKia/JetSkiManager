import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardCard from "@/components/dashboard/DashboardCard";
import JetSkiStatusTable from "@/components/dashboard/JetSkiStatusTable";
import AlertsSection from "@/components/dashboard/AlertsSection";
import { format } from "date-fns";

const Dashboard: React.FC = () => {
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  useEffect(() => {
    document.title = "Dashboard | JetSki Manager";
  }, []);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="mt-3 md:mt-0">
            <div className="bg-white p-2 rounded-md shadow-sm flex gap-2 text-sm">
              <span className="text-gray-500">Today:</span>
              <span className="font-medium text-gray-800">
                {format(new Date(), "MMMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
          {isLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-lg shadow-sm p-5 h-24"></div>
            ))
          ) : isError ? (
            <div className="col-span-4 text-center py-4 text-gray-500">
              Error loading dashboard data. Please try again.
            </div>
          ) : (
            <>
              <DashboardCard
                title="Today's Bookings"
                value={dashboardData?.todayBookings || 0}
                icon="ri-calendar-event-line"
                color="primary"
              />
              <DashboardCard
                title="Available JetSkis"
                value={`${dashboardData?.availableJetSkis || 0} / ${dashboardData?.totalJetSkis || 0}`}
                icon="ri-ship-line"
                color="green"
              />
              <DashboardCard
                title="Refueling Needed"
                value={dashboardData?.refuelingNeeded || 0}
                icon="ri-gas-station-line"
                color="amber"
              />
              <DashboardCard
                title="Maintenance Alerts"
                value={dashboardData?.maintenanceAlerts || 0}
                icon="ri-tools-line"
                color="red"
              />
            </>
          )}
        </div>

        {/* Current Status Section */}
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Current JetSki Status</h2>
        <JetSkiStatusTable />

        {/* Alerts Section */}
        <h2 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Alerts & Notifications</h2>
        <AlertsSection />
      </div>
    </section>
  );
};

export default Dashboard;
