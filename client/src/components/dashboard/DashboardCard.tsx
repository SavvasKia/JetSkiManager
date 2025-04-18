import React from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "primary" | "green" | "amber" | "red";
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "bg-primary-light bg-opacity-10 text-primary";
      case "green":
        return "bg-green-100 text-green-600";
      case "amber":
        return "bg-amber-100 text-amber-600";
      case "red":
        return "bg-red-100 text-red-600";
      default:
        return "bg-primary-light bg-opacity-10 text-primary";
    }
  };
  
  return (
    <div className="dashboard-card bg-white rounded-lg shadow-sm p-5 transition-all hover:shadow-md">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-md p-3 ${getColorClasses()}`}>
          <i className={`${icon} text-xl`}></i>
        </div>
        <div className="ml-5">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-xl font-semibold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
