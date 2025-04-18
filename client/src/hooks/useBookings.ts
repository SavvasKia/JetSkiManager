import { useQuery } from "@tanstack/react-query";
import { Booking, BookingStatus } from "@shared/schema";

export function useBookings() {
  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const getBooking = (id: number): Booking | undefined => {
    if (!bookings) return undefined;
    return bookings.find((booking: Booking) => booking.id === id);
  };

  const getJetSkiBookings = (jetSkiId: number): Booking[] => {
    if (!bookings) return [];
    return bookings.filter((booking: Booking) => booking.jetSkiId === jetSkiId);
  };

  const getActiveBookings = (): Booking[] => {
    if (!bookings) return [];
    const now = new Date();
    return bookings.filter(
      (booking: Booking) => 
        booking.status === BookingStatus.SCHEDULED || 
        booking.status === BookingStatus.IN_PROGRESS
    );
  };

  const getJetSkiCurrentBooking = (jetSkiId: number): Booking | undefined => {
    if (!bookings) return undefined;
    const now = new Date();
    return bookings.find(
      (booking: Booking) => 
        booking.jetSkiId === jetSkiId && 
        booking.status !== BookingStatus.CANCELLED &&
        booking.status !== BookingStatus.COMPLETED &&
        new Date(booking.startTime) <= now && 
        new Date(booking.endTime) > now
    );
  };

  const getJetSkiNextAvailable = (jetSkiId: number): Date => {
    if (!bookings) return new Date();
    
    const now = new Date();
    const jetSkiBookings = bookings.filter(
      (booking: Booking) => 
        booking.jetSkiId === jetSkiId &&
        booking.status !== BookingStatus.CANCELLED &&
        booking.status !== BookingStatus.COMPLETED &&
        new Date(booking.endTime) > now
    );
    
    if (jetSkiBookings.length === 0) return now;
    
    const sortedBookings = [...jetSkiBookings].sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );
    
    return new Date(sortedBookings[0].endTime);
  };

  return {
    bookings,
    isLoading,
    error,
    getBooking,
    getJetSkiBookings,
    getActiveBookings,
    getJetSkiCurrentBooking,
    getJetSkiNextAvailable
  };
}
