import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const Sidebar: React.FC = () => {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: "ri-dashboard-line" },
    { path: "/bookings", label: "Bookings", icon: "ri-calendar-check-line" },
    { path: "/fleet", label: "Fleet Management", icon: "ri-ship-line" },
    { path: "/hardliner", label: "Next Available Hardliner", icon: "ri-time-line" }
  ];

  return (
    <aside className="flex w-full">
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold text-primary">JetSki Manager</h1>
          </div>
          <nav className="flex-1 px-2 space-y-1 bg-white">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center px-2 py-3 text-base font-medium rounded-md group",
                  location === item.path 
                    ? "active-nav border-l-4 border-primary bg-primary bg-opacity-10 text-primary" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                )}
              >
                <i className={`${item.icon} mr-3 text-xl`}></i>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Admin Portal</h3>
              <p className="text-xs font-medium text-gray-500">Internal Use Only</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
