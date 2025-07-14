import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { AlertCircle, CreditCard, Plus, X } from "lucide-react";

// Form validation schema
const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0, "Monthly price must be non-negative"),
  yearlyPrice: z.number().min(0, "Yearly price must be non-negative"),
  features: z.array(z.string()).default([]),
  maxUsers: z.number().min(1, "Must allow at least 1 user"),
  maxProjects: z.number().min(1, "Must allow at least 1 project"),
  maxStorage: z.number().min(100, "Must provide at least 100MB storage"),
  isActive: z.boolean().default(true),
});

export function SubscriptionPlanForm({ isOpen, onClose, plan }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: "",
      description: "",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [],
      maxUsers: 10,
      maxProjects: 5,
      maxStorage: 1024,
      isActive: true,
    },
  });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features",
  });

  const monthlyPrice = watch("monthlyPrice");

  // Auto-calculate yearly price with 20% discount
  useEffect(() => {
    const yearlyWithDiscount = Math.round(monthlyPrice * 12 * 0.8);
    setValue("yearlyPrice", yearlyWithDiscount);
  }, [monthlyPrice, setValue]);

  // Reset form when plan changes
  useEffect(() => {
    if (plan) {
      reset({
        name: plan.name || "",
        description: plan.description || "",
        monthlyPrice: plan.monthlyPrice / 100 || 0, // Convert from cents
        yearlyPrice: plan.yearlyPrice / 100 || 0, // Convert from cents
        features: plan.features || [],
        maxUsers: plan.maxUsers || 10,
        maxProjects: plan.maxProjects || 5,
        maxStorage: plan.maxStorage || 1024,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
      });
    } else {
      reset({
        name: "",
        description: "",
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [],
        maxUsers: 10,
        maxProjects: 5,
        maxStorage: 1024,
        isActive: true,
      });
    }
  }, [plan, reset]);

  // Create/Update plan mutation
  const planMutation = useMutation({
    mutationFn: async (data) => {
      const url = plan ? `/api/subscription-plans/${plan.id}` : '/api/subscription-plans';
      const method = plan ? 'PUT' : 'POST';
      
      return await apiRequest(url, {
        method,
        body: {
          ...data,
          monthlyPrice: Math.round(data.monthlyPrice * 100), // Convert to cents
          yearlyPrice: Math.round(data.yearlyPrice * 100), // Convert to cents
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: plan ? "Subscription plan updated successfully" : "Subscription plan created successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to ${plan ? 'update' : 'create'} subscription plan`,
        variant: "destructive"
      });
    }
  });

  const handleFormSubmit = async (data) => {
    setIsLoading(true);
    try {
      await planMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      appendFeature(newFeature.trim());
      setNewFeature("");
    }
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-2xl">
        <DialogHeader className="pb-6 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            {plan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300 font-medium mt-2">
            {plan 
              ? 'Update subscription plan details and pricing' 
              : 'Create a new subscription plan for your SaaS platform'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 pt-6">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Plan Name */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Plan Name <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Basic, Pro, Enterprise"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.name ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of the plan..."
                  rows={3}
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white p-4 resize-none"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-3">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  )}
                />
                <Label className="text-sm font-semibold text-slate-900 dark:text-white">
                  Active Plan
                </Label>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Price */}
              <div className="space-y-3">
                <Label htmlFor="monthlyPrice" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Monthly Price <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                  <Input
                    id="monthlyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("monthlyPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 pl-8 pr-4 ${errors.monthlyPrice ? 'border-red-500 dark:border-red-400' : ''}`}
                  />
                </div>
                {errors.monthlyPrice && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.monthlyPrice.message}
                  </p>
                )}
              </div>

              {/* Yearly Price */}
              <div className="space-y-3">
                <Label htmlFor="yearlyPrice" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Yearly Price <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-slate-400">$</span>
                  <Input
                    id="yearlyPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("yearlyPrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 pl-8 pr-4 ${errors.yearlyPrice ? 'border-red-500 dark:border-red-400' : ''}`}
                  />
                </div>
                {monthlyPrice > 0 && (
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Auto-calculated with 20% yearly discount: {formatPrice(monthlyPrice * 12 * 0.8)}
                  </p>
                )}
                {errors.yearlyPrice && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.yearlyPrice.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Limits */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Plan Limits</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Max Users */}
              <div className="space-y-3">
                <Label htmlFor="maxUsers" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Max Users <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="maxUsers"
                  type="number"
                  min="1"
                  {...register("maxUsers", { valueAsNumber: true })}
                  placeholder="10"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.maxUsers ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.maxUsers && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.maxUsers.message}
                  </p>
                )}
              </div>

              {/* Max Projects */}
              <div className="space-y-3">
                <Label htmlFor="maxProjects" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Max Projects <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="maxProjects"
                  type="number"
                  min="1"
                  {...register("maxProjects", { valueAsNumber: true })}
                  placeholder="5"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.maxProjects ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.maxProjects && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.maxProjects.message}
                  </p>
                )}
              </div>

              {/* Max Storage (MB) */}
              <div className="space-y-3">
                <Label htmlFor="maxStorage" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Storage (MB) <span className="text-red-600 dark:text-red-400">*</span>
                </Label>
                <Input
                  id="maxStorage"
                  type="number"
                  min="100"
                  {...register("maxStorage", { valueAsNumber: true })}
                  placeholder="1024"
                  className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-12 px-4 ${errors.maxStorage ? 'border-red-500 dark:border-red-400' : ''}`}
                />
                {errors.maxStorage && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.maxStorage.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Features</h3>
            
            <div className="space-y-4">
              {/* Add Feature Input */}
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-10 px-4"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={handleAddFeature}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-600 px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Feature List */}
              {featureFields.length > 0 && (
                <div className="space-y-2">
                  {featureFields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                        {field.value}
                      </span>
                      <Button
                        type="button"
                        onClick={() => removeFeature(index)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
                  {plan ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                plan ? 'Update Plan' : 'Create Plan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}