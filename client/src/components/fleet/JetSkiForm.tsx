import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { insertJetSkiSchema, JetSkiStatus, JetSkiStatusType } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface JetSkiFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Extend the schema with validation rules
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  status: z.enum([
    JetSkiStatus.AVAILABLE, 
    JetSkiStatus.IN_USE, 
    JetSkiStatus.MAINTENANCE, 
    JetSkiStatus.REFUELING, 
    JetSkiStatus.BROKEN
  ]).default(JetSkiStatus.AVAILABLE),
  hoursUsed: z.coerce.number().min(0, "Hours must be a positive number").nullish(),
  lastMaintenanceDate: z.preprocess((arg) => {
    if (typeof arg == "string") return new Date(arg);
    return arg;
  }, z.date().nullish())
});

type JetSkiFormValues = z.infer<typeof formSchema>;

const JetSkiForm: React.FC<JetSkiFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  
  const form = useForm<JetSkiFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      status: JetSkiStatus.AVAILABLE,
      hoursUsed: 0,
      lastMaintenanceDate: new Date()
    }
  });
  
  const onSubmit = async (data: JetSkiFormValues) => {
    try {
      // Convert form data to match the expected schema
      const formattedData = {
        name: data.name,
        brand: data.brand,
        status: data.status as JetSkiStatusType,
        hoursUsed: data.hoursUsed || 0,
        lastMaintenanceDate: data.lastMaintenanceDate || null
      };
      
      console.log("Submitting JetSki data:", formattedData);
      
      await apiRequest('POST', '/api/jetskis', formattedData);
      
      toast({
        title: "JetSki Added",
        description: "The new JetSki has been added successfully"
      });
      
      // Invalidate the queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/jetskis'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset the form
      form.reset();
    } catch (error) {
      console.error("Error adding JetSki:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add the JetSki. Please try again."
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>JetSki Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter JetSki name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter brand name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={JetSkiStatus.AVAILABLE}>Available</SelectItem>
                        <SelectItem value={JetSkiStatus.IN_USE}>In Use</SelectItem>
                        <SelectItem value={JetSkiStatus.MAINTENANCE}>Maintenance</SelectItem>
                        <SelectItem value={JetSkiStatus.REFUELING}>Refueling</SelectItem>
                        <SelectItem value={JetSkiStatus.BROKEN}>Broken</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="hoursUsed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Used</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastMaintenanceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Maintenance Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="bg-primary hover:bg-primary-dark">
              Add JetSki
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default JetSkiForm;