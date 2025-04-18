import React from "react";
import { cn } from "@/lib/utils";
import { JetSkiStatusType, BookingStatusType } from "@shared/schema";

interface StatusBadgeProps {
  status: JetSkiStatusType | BookingStatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  let bgColor = "";
  let textColor = "";
  
  switch (status.toLowerCase()) {
    case "available":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "in_use":
    case "in_progress":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
    case "refueling":
      bgColor = "bg-amber-100";
      textColor = "text-amber-800";
      break;
    case "maintenance":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    case "broken":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    case "scheduled":
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      break;
    case "completed":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "cancelled":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    case "interrupted":
      bgColor = "bg-amber-100";
      textColor = "text-amber-800";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
  }
  
  // Format the status for display (convert snake_case to Title Case)
  const displayStatus = status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  return (
    <span 
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", 
        bgColor, 
        textColor,
        className
      )}
    >
      {displayStatus}
    </span>
  );
};

export default StatusBadge;
