import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Download, CreditCard, Calendar, AlertCircle, CheckCircle, Clock, FileText } from 'lucide-react';
import useLicensing from '../hooks/useLicensing';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Billing & Invoices Page - Billing summary card, payment history table with Download Invoice
 */
export default function BillingPage() {
  const {
    currentPlan: currentPlanKey,
    billingCycle,
    invoices,
    getCurrentPlan,
    hasAccess
  } = useLicensing();

  const currentPlan = getCurrentPlan();
  const currentPrice = currentPlan.price[billingCycle];
  const nextBillingDate = new Date();
  nextBillingDate.setMonth(nextBillingDate.getMonth() + (billingCycle === 'yearly' ? 12 : 1));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadInvoice = (invoiceId) => {
    // Mock download - in real app this would trigger actual PDF download
    console.log(`Downloading invoice ${invoiceId}`);
    // Simulate file download
    const link = document.createElement('a');
    link.href = `#`; // In real app: `/api/invoices/${invoiceId}/download`
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Check access - only admins should see billing details
  if (!hasAccess('billing')) {
    return (
      <div className="container mx-auto p-6" data-testid="billing-access-denied">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>Access Denied</span>
            </CardTitle>
            <CardDescription>
              You don't have permission to view billing information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Contact your organization administrator for billing details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="billing-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Billing & Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1" data-testid="page-description">
            Manage your subscription and download invoices
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Billing Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Subscription */}
          <Card data-testid="billing-summary-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Current Subscription</span>
              </CardTitle>
              <CardDescription>
                Your active plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Info */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <div className="font-semibold text-lg text-blue-900 dark:text-blue-100" data-testid="current-plan-name">
                    {currentPlan.name}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300" data-testid="billing-cycle">
                    Billed {billingCycle === 'yearly' ? 'annually' : 'monthly'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100" data-testid="current-price">
                    ${currentPrice}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    per {billingCycle === 'yearly' ? 'year' : 'month'}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Next Billing Date
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm" data-testid="next-billing-date">
                      {format(nextBillingDate, 'MMMM d, yyyy')}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Status
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600" data-testid="payment-status">
                      Current
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card data-testid="billing-history-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Billing History</span>
              </CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8" data-testid="empty-billing-history">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No invoices yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {currentPlanKey === 'explore' 
                      ? 'Upgrade to a paid plan to see invoices here.' 
                      : 'Your invoices will appear here after your first billing cycle.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id} data-testid={`invoice-row-${invoice.id}`}>
                          <TableCell className="font-medium" data-testid={`invoice-id-${invoice.id}`}>
                            {invoice.id}
                          </TableCell>
                          <TableCell data-testid={`invoice-date-${invoice.id}`}>
                            {format(new Date(invoice.date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell data-testid={`invoice-plan-${invoice.id}`}>
                            <div>
                              <div>{invoice.plan}</div>
                              <div className="text-xs text-gray-500 capitalize">
                                {invoice.period}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium" data-testid={`invoice-amount-${invoice.id}`}>
                            ${invoice.amount}
                          </TableCell>
                          <TableCell data-testid={`invoice-status-${invoice.id}`}>
                            <Badge className={cn('text-xs', getStatusColor(invoice.status))}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(invoice.status)}
                                <span className="capitalize">{invoice.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                              className="text-blue-600 hover:text-blue-700"
                              data-testid={`download-invoice-${invoice.id}`}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Method */}
          <Card data-testid="payment-method-card">
            <CardHeader>
              <CardTitle className="text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm" data-testid="payment-method">
                    •••• •••• •••• 4242
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires 12/25
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" data-testid="update-payment-button">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Billing Contact */}
          <Card data-testid="billing-contact-card">
            <CardHeader>
              <CardTitle className="text-lg">Billing Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="font-medium" data-testid="billing-contact-name">
                  John Smith
                </div>
                <div className="text-gray-600" data-testid="billing-contact-email">
                  admin@company.com
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" data-testid="update-billing-contact-button">
                Update Contact
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card data-testid="quick-actions-card">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" data-testid="view-usage-button">
                <FileText className="h-4 w-4 mr-2" />
                View Usage Details
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" data-testid="change-plan-button">
                <CreditCard className="h-4 w-4 mr-2" />
                Change Plan
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700" data-testid="cancel-subscription-button">
                <AlertCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}