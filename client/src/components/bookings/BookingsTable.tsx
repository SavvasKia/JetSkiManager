import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Booking, BookingStatus, JetSki } from "@shared/schema";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatTimeRangeShort, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const BookingsTable: React.FC = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jetSkiFilter, setJetSkiFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ["/api/bookings"],
  });
  
  const { data: jetSkis, isLoading: loadingJetSkis } = useQuery({
    queryKey: ["/api/jetskis"],
  });
  
  const handleStatusChange = async (bookingId: number, newStatus: BookingStatus) => {
    try {
      await apiRequest('PATCH', `/api/bookings/${bookingId}`, { status: newStatus });
      
      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus.replace('_', ' ')}`
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
    } catch (error) {
      console.error("Error updating booking status:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status"
      });
    }
  };
  
  const getJetSkiName = (jetSkiId: number) => {
    if (!jetSkis) return "Unknown";
    const jetSki = jetSkis.find((js: JetSki) => js.id === jetSkiId);
    return jetSki ? jetSki.name : "Unknown";
  };
  
  // Apply filters
  const filteredBookings = bookings ? bookings.filter((booking: Booking) => {
    // Status filter
    if (statusFilter !== "all" && booking.status !== statusFilter) {
      return false;
    }
    
    // JetSki filter
    if (jetSkiFilter !== "all" && booking.jetSkiId !== parseInt(jetSkiFilter)) {
      return false;
    }
    
    // Date filter
    if (dateFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const bookingDate = new Date(booking.startTime);
      if (bookingDate < today || bookingDate >= tomorrow) {
        return false;
      }
    } else if (dateFilter === "week") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const bookingDate = new Date(booking.startTime);
      if (bookingDate < today || bookingDate >= nextWeek) {
        return false;
      }
    } else if (dateFilter === "month") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const bookingDate = new Date(booking.startTime);
      if (bookingDate < today || bookingDate >= nextMonth) {
        return false;
      }
    }
    
    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        booking.customerName.toLowerCase().includes(term) ||
        (booking.customerEmail && booking.customerEmail.toLowerCase().includes(term)) ||
        (booking.customerPhone && booking.customerPhone.toLowerCase().includes(term))
      );
    }
    
    return true;
  }) : [];
  
  if (loadingBookings || loadingJetSkis) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="bg-white shadow-sm rounded-lg p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700">Date Range</label>
            <Select onValueChange={setDateFilter} value={dateFilter}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="all">All Dates</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
            <Select onValueChange={setStatusFilter} value={statusFilter}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={BookingStatus.SCHEDULED}>Scheduled</SelectItem>
                <SelectItem value={BookingStatus.IN_PROGRESS}>In Progress</SelectItem>
                <SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
                <SelectItem value={BookingStatus.INTERRUPTED}>Interrupted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="jetski-filter" className="block text-sm font-medium text-gray-700">JetSki</label>
            <Select onValueChange={setJetSkiFilter} value={jetSkiFilter}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Filter by JetSki" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All JetSkis</SelectItem>
                {jetSkis && jetSkis.map((jetSki: JetSki) => (
                  <SelectItem key={jetSki.id} value={jetSki.id.toString()}>{jetSki.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label htmlFor="search-booking" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Customer name or email"
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JetSki</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                  No bookings found matching the filters
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking: Booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(booking.startTime).split(',')[0]}</div>
                    <div className="text-sm text-gray-500">{formatTimeRangeShort(booking.startTime, booking.endTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getJetSkiName(booking.jetSkiId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.customerEmail || "N/A"}</div>
                    <div className="text-sm text-gray-500">{booking.customerPhone || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-primary hover:text-primary-dark">
                        <i className="ri-edit-line"></i>
                      </button>
                      {booking.status !== BookingStatus.COMPLETED && booking.status !== BookingStatus.CANCELLED && (
                        <button 
                          className="text-success hover:text-green-700"
                          onClick={() => handleStatusChange(booking.id, 
                            booking.status === BookingStatus.SCHEDULED 
                              ? BookingStatus.IN_PROGRESS 
                              : BookingStatus.COMPLETED
                          )}
                        >
                          <i className="ri-checkbox-circle-line"></i>
                        </button>
                      )}
                      {booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.COMPLETED && (
                        <button 
                          className="text-error hover:text-red-700"
                          onClick={() => handleStatusChange(booking.id, BookingStatus.CANCELLED)}
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {filteredBookings.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredBookings.length}</span> of{" "}
                    <span className="font-medium">{filteredBookings.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button variant="outline" size="sm" className="rounded-l-md">
                      <i className="ri-arrow-left-s-line"></i>
                    </Button>
                    <Button variant="outline" size="sm" className="bg-primary text-white">
                      1
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-r-md">
                      <i className="ri-arrow-right-s-line"></i>
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingsTable;
