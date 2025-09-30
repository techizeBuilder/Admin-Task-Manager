import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertCircle, Building2 } from "lucide-react";

// Form validation schema
const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  adminEmail: z.string().email("Valid email address required"),
  adminFirstName: z.string().min(1, "First name is required"),
  adminLastName: z.string().min(1, "Last name is required"),
  adminPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
  subscriptionPlanId: z.string().min(1, "Subscription plan is required"),
  billingCycle: z.enum(["monthly", "yearly"]),
  description: z.string().optional(),
});

export function CompanyForm({ isOpen, onClose, company, subscriptionPlans = [] }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      adminEmail: "",
      adminFirstName: "",
      adminLastName: "",
      adminPassword: "",
      subscriptionPlanId: "",
      billingCycle: "monthly",
      description: "",
    },
  });

  // Reset form when company changes
  useEffect(() => {
    if (company) {
      reset({
        name: company.name || "",
        adminEmail: company.adminEmail || "",
        adminFirstName: company.adminFirstName || "",
        adminLastName: company.adminLastName || "",
        adminPassword: "", // Never pre-fill passwords
        subscriptionPlanId: company.subscriptionPlanId || "",
        billingCycle: company.billingCycle || "monthly",
        description: company.description || "",
      });
    } else {
      reset({
        name: "",
        adminEmail: "",
        adminFirstName: "",
        adminLastName: "",
        adminPassword: "",
        subscriptionPlanId: "",
        billingCycle: "monthly",
        description: "",
      });
    }
  }, [company, reset]);

  // Create/Update company mutation
  const companyMutation = useMutation({
    mutationFn: async (data) => {
      const url = company ? `/api/companies/${company.id}` : '/api/companies';
      const method = company ? 'PUT' : 'POST';
      
      return await apiRequest(url, {
        method,
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: company ? "Company updated successfully" : "Company created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/companies'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${company ? 'update' : 'create'} company`,
        variant: "destructive"
      });
    }
  });

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Generate slug from company name
      const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const companyData = {
        ...data,
        slug,
        // Only include password for new companies
        ...(company ? {} : { adminPassword: data.adminPassword })
      };

      await companyMutation.mutateAsync(companyData);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            {company ? 'Edit Company' : 'Add New Company'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300 font-medium mt-2">
            {company 
              ? 'Update company details and subscription information' 
              : 'Register a new company with admin user and subscription plan'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 pt-6">
          {/* Company Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Company Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Company Name <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Enter company name..."
                    className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.name ? 'border-red-500 dark:border-red-400' : ''}`}
                  />
                  {errors.name && (
                    <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of the company..."
                  rows={3}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-4 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Admin User Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Admin User</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Admin Email */}
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="adminEmail" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Admin Email <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="adminEmail"
                  type="email"
                  {...register("adminEmail")}
                  placeholder="admin@company.com"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.adminEmail ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.adminEmail && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.adminEmail.message}
                  </p>
                )}
              </div>

              {/* First Name */}
              <div className="space-y-3">
                <Label htmlFor="adminFirstName" className="text-sm font-semibold text-slate-900 dark:text-white">
                  First Name <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="adminFirstName"
                  {...register("adminFirstName")}
                  placeholder="Enter first name"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.adminFirstName ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.adminFirstName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.adminFirstName.message}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-3">
                <Label htmlFor="adminLastName" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Last Name <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="adminLastName"
                  {...register("adminLastName")}
                  placeholder="Enter last name"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.adminLastName ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.adminLastName && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.adminLastName.message}
                  </p>
                )}
              </div>

              {/* Password (only for new companies) */}
              {!company && (
                <div className="md:col-span-2 space-y-3">
                  <Label htmlFor="adminPassword" className="text-sm font-semibold text-slate-900 dark:text-white">
                    Admin Password <span className="text-red-600 dark:text-red-400">*</span>
                  </Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    {...register("adminPassword")}
                    placeholder="Minimum 8 characters"
                    className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.adminPassword ? 'border-red-500 dark:border-red-400' : ''}`}
                  />
                  {errors.adminPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.adminPassword.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Subscription</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscription Plan */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900 dark:text-white">
                  Subscription Plan <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Controller
                  name="subscriptionPlanId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.subscriptionPlanId ? 'border-red-500 dark:border-red-400' : ''}`}>
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        {subscriptionPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{plan.name}</span>
                              <span className="text-sm text-slate-600 dark:text-slate-300 ml-2">
                                {formatPrice(plan.monthlyPrice)}/mo
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subscriptionPlanId && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.subscriptionPlanId.message}
                  </p>
                )}
              </div>

              {/* Billing Cycle */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-900 dark:text-white">
                  Billing Cycle <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Controller
                  name="billingCycle"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                        <SelectItem value="monthly" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                          Monthly
                        </SelectItem>
                        <SelectItem value="yearly" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                          Yearly (Save 20%)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-8 mt-8 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400 disabled:text-slate-200 px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {company ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                company ? 'Update Company' : 'Create Company'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}