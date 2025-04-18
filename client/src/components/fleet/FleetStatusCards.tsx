import React from "react";
import { useQuery } from "@tanstack/react-query";
import { JetSki, JetSkiStatus } from "@shared/schema";

const FleetStatusCards: React.FC = () => {
  const { data: jetSkis, isLoading } = useQuery({
    queryKey: ["/api/jetskis"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-2">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-5">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!jetSkis) {
    return <div>No data available</div>;
  }

  const statusCounts = {
    [JetSkiStatus.AVAILABLE]: 0,
    [JetSkiStatus.IN_USE]: 0,
    [JetSkiStatus.REFUELING]: 0,
    [JetSkiStatus.MAINTENANCE]: 0,
    [JetSkiStatus.BROKEN]: 0,
  };

  jetSkis.forEach((jetSki: JetSki) => {
    statusCounts[jetSki.status as JetSkiStatusType]++;
  });

  const statusCards = [
    {
      status: JetSkiStatus.AVAILABLE,
      label: "Available",
      icon: "ri-check-line",
      bgClass: "bg-green-100",
      textClass: "text-green-600"
    },
    {
      status: JetSkiStatus.IN_USE,
      label: "In Use",
      icon: "ri-user-line",
      bgClass: "bg-blue-100",
      textClass: "text-blue-600"
    },
    {
      status: JetSkiStatus.REFUELING,
      label: "Refueling",
      icon: "ri-gas-station-line",
      bgClass: "bg-amber-100",
      textClass: "text-amber-600"
    },
    {
      status: JetSkiStatus.MAINTENANCE,
      label: "Maintenance",
      icon: "ri-tools-line",
      bgClass: "bg-red-100",
      textClass: "text-red-600"
    },
    {
      status: JetSkiStatus.BROKEN,
      label: "Broken",
      icon: "ri-error-warning-line",
      bgClass: "bg-red-100",
      textClass: "text-red-600"
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-2">
      {statusCards.map((card) => (
        <div key={card.status} className="dashboard-card bg-white rounded-lg shadow-sm p-5">
          <div className="text-center">
            <div className={`inline-flex rounded-full p-3 ${card.bgClass} ${card.textClass} mb-4`}>
              <i className={`${card.icon} text-xl`}></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{card.label}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{statusCounts[card.status]}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FleetStatusCards;
