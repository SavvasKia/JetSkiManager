import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { JetSki, JetSkiStatus, insertBookingSchema, BookingStatus } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  onSuccess?: () => void;
}

const formSchema = insertBookingSchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  date: z.string().min(1, "Date is required"),
});

type BookingFormValues = z.infer<typeof formSchema>;

const BookingForm: React.FC<BookingFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const { data: jetSkis, isLoading: loadingJetSkis } = useQuery({
    queryKey: ["/api/jetskis"],
  });

  const availableJetSkis = jetSkis
    ? jetSkis.filter((jetSki: JetSki) => jetSki.status === JetSkiStatus.AVAILABLE)
    : [];

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      jetSkiId: undefined,
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      status: BookingStatus.SCHEDULED,
      notes: ""
    }
  });
  
  const { formState } = form;
  const isSubmitting = formState.isSubmitting;

  const onSubmit = async (data: BookingFormValues) => {
    try {
      // Combine date and time
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);
      
      // Format data for API
      const bookingData = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        jetSkiId: parseInt(data.jetSkiId as unknown as string),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        status: data.status,
        notes: data.notes
      };
      
      await apiRequest('POST', '/api/bookings', bookingData);
      
      toast({
        title: "Booking created",
        description: "The booking has been successfully created."
      });
      
      // Reset the form
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again."
      });
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">New Booking</h3>
        <p className="mt-1 text-sm text-gray-500">Create a new JetSki booking for a customer</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="555-123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jetSkiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select JetSki</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select available JetSki" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingJetSkis ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : availableJetSkis.length === 0 ? (
                          <SelectItem value="none" disabled>No available JetSkis</SelectItem>
                        ) : (
                          availableJetSkis.map((jetSki: JetSki) => (
                            <SelectItem key={jetSki.id} value={jetSki.id.toString()}>
                              {jetSki.name} ({jetSki.brand})
                            </SelectItem>
                          ))
                        )}
                        
                        {jetSkis && jetSkis
                          .filter((jetSki: JetSki) => jetSki.status !== JetSkiStatus.AVAILABLE)
                          .map((jetSki: JetSki) => (
                            <SelectItem key={jetSki.id} value={jetSki.id.toString()} disabled>
                              {jetSki.name} ({jetSki.brand}) - {jetSki.status.replace('_', ' ')}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Booking Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex space-x-2 items-end">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <span className="px-2 self-center">to</span>
                
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special requests or additional information"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary-dark"
            >
              {isSubmitting ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
