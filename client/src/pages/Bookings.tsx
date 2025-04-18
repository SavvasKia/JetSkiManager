import React, { useEffect, useState } from "react";
import BookingsTable from "@/components/bookings/BookingsTable";
import BookingForm from "@/components/bookings/BookingForm";
import { Button } from "@/components/ui/button";

const Bookings: React.FC = () => {
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    document.title = "Bookings | JetSki Manager";
  }, []);

  return (
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-5">
          <h1 className="text-2xl font-semibold text-gray-900">Bookings Management</h1>
          <div className="mt-3 md:mt-0">
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => setShowBookingForm(!showBookingForm)}
            >
              <i className="ri-add-line mr-2"></i> 
              {showBookingForm ? "Hide Booking Form" : "New Booking"}
            </Button>
          </div>
        </div>

        {/* Booking Form */}
        {showBookingForm && (
          <div className="mb-8">
            <BookingForm onSuccess={() => setShowBookingForm(false)} />
          </div>
        )}

        {/* Bookings Table */}
        <BookingsTable />
      </div>
    </section>
  );
};

export default Bookings;
