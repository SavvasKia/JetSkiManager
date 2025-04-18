import React, { useState } from "react";
import { useLocation, Link } from "wouter";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const [location] = useLocation();
  
  // Get the title based on the current route
  const getTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/bookings":
        return "Bookings Management";
      case "/fleet":
        return "Fleet Management";
      case "/hardliner":
        return "Next Available Hardliner";
      default:
        return "JetSki Manager";
    }
  };
  
  return (
    <header className="w-full">
      <div className="relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm flex">
        <button 
          type="button" 
          className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          onClick={onMenuToggle}
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
        <div className="flex-1 flex justify-between px-4 md:px-0">
          <div className="flex-1 flex items-center pl-3">
            <h2 className="text-xl font-bold text-gray-800 md:hidden">JetSki Manager</h2>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            <button type="button" className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <i className="ri-notification-3-line text-xl"></i>
            </button>
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="text-gray-700 mr-2">Admin</span>
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
