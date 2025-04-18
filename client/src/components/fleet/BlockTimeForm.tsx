import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { JetSki, insertMaintenanceSchema, MaintenanceType } from "@shared/schema";
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

interface BlockTimeFormProps {
  onSuccess?: () => void;
}

const formSchema = insertMaintenanceSchema.extend({
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  date: z.string().min(1, "Date is required"),
});

type BlockTimeFormValues = z.infer<typeof formSchema>;

const BlockTimeForm: React.FC<BlockTimeFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const { data: jetSkis, isLoading: loadingJetSkis } = useQuery({
    queryKey: ["/api/jetskis"],
  });

  const form = useForm<BlockTimeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jetSkiId: undefined,
      type: undefined,
      date: new Date().toISOString().split('T')[0],
      startTime: "",
      endTime: "",
      completed: false,
      notes: ""
    }
  });
  
  const { formState } = form;
  const isSubmitting = formState.isSubmitting;

  const onSubmit = async (data: BlockTimeFormValues) => {
    try {
      // Combine date and time
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = new Date(`${data.date}T${data.endTime}`);
      
      // Format data for API
      const maintenanceData = {
        jetSkiId: parseInt(data.jetSkiId as unknown as string),
        type: data.type,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        completed: false,
        notes: data.notes
      };
      
      await apiRequest('POST', '/api/maintenance', maintenanceData);
      
      toast({
        title: "Downtime scheduled",
        description: "The maintenance or refueling time has been scheduled."
      });
      
      // Reset the form
      form.reset();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/jetskis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error scheduling downtime:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule downtime. Please try again."
      });
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <SelectValue placeholder="Select JetSki" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingJetSkis ? (
                          <SelectItem value="loading">Loading...</SelectItem>
                        ) : !jetSkis || jetSkis.length === 0 ? (
                          <SelectItem value="none" disabled>No JetSkis found</SelectItem>
                        ) : (
                          jetSkis.map((jetSki: JetSki) => (
                            <SelectItem key={jetSki.id} value={jetSki.id.toString()}>
                              {jetSki.name} ({jetSki.brand})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Downtime Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={MaintenanceType.MAINTENANCE}>Maintenance</SelectItem>
                        <SelectItem value={MaintenanceType.REFUELING}>Refueling</SelectItem>
                        <SelectItem value={MaintenanceType.REPAIRS}>Repairs</SelectItem>
                        <SelectItem value={MaintenanceType.OTHER}>Other</SelectItem>
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
                    <FormLabel>Date</FormLabel>
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
                        placeholder="Details about the maintenance or refueling"
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
              {isSubmitting ? "Scheduling..." : "Block Time"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BlockTimeForm;
