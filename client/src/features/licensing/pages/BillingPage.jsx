import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText,
  RefreshCw,
  TrendingUp,
  Building,
  Receipt,
  ChevronUp,
  ChevronDown,
  X
} from 'lucide-react';
import useLicensing from '../hooks/useLicensing';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

/**
 * Billing & Invoices Page - Billing summary card, payment history table with Download Invoice
 */
export default function BillingPage() {
  const [autoRenew, setAutoRenew] = useState(true);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isRetrying, setIsRetrying] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [updateErrors, setUpdateErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
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

  // Mock billing data for demonstration
  const mockInvoices = [
    {
      id: 'INV-2024-001',
      date: '2024-08-15',
      plan: 'Execute',
      period: 'monthly',
      amount: 49,
      transactionId: 'TXN_ABC123',
      status: 'paid',
      paymentMethod: '**** 4242'
    },
    {
      id: 'INV-2024-002',
      date: '2024-07-15',
      plan: 'Execute',
      period: 'monthly',
      amount: 49,
      transactionId: 'TXN_DEF456',
      status: 'paid',
      paymentMethod: '**** 4242'
    },
    {
      id: 'INV-2024-003',
      date: '2024-06-15',
      plan: 'Plan',
      period: 'monthly',
      amount: 19,
      transactionId: 'TXN_GHI789',
      status: 'paid',
      paymentMethod: '**** 4242'
    }
  ];

  // Use mock data if no real invoices
  const displayInvoices = invoices.length > 0 ? invoices : mockInvoices;

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

  const handleRetryInvoices = () => {
    setIsRetrying(true);
    setDownloadError('');
    // Mock retry logic
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  };

  const handleSortInvoices = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 ml-1" /> : 
      <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const handleDownloadInvoice = (invoiceId) => {
    setDownloadError('');
    
    // Mock download with error handling
    const shouldFail = Math.random() < 0.2; // 20% chance of failure for demo
    
    if (shouldFail) {
      setDownloadError('Unable to download invoice, please try again later.');
      return;
    }
    
    console.log(`Downloading invoice ${invoiceId}`);
    // Simulate file download
    const link = document.createElement('a');
    link.href = `#`; // In real app: `/api/invoices/${invoiceId}/download`
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validateBillingDetails = (formData) => {
    const errors = {};
    
    if (!formData.cardNumber || formData.cardNumber.length < 16) {
      errors.cardNumber = 'Please enter a valid card number';
    }
    
    if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      errors.expiry = 'Please enter a valid expiry date (MM/YY)';
    }
    
    if (!formData.cvv || formData.cvv.length < 3) {
      errors.cvv = 'Please enter a valid CVV';
    }
    
    if (!formData.gstNumber && formData.gstNumber !== '') {
      errors.gstNumber = 'GST/VAT number format is invalid';
    }
    
    return errors;
  };

  const handleUpdateBilling = (formData) => {
    const errors = validateBillingDetails(formData);
    setUpdateErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Mock successful update
      setShowBillingModal(false);
      setUpdateErrors({});
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(displayInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = displayInvoices.slice(startIndex, startIndex + itemsPerPage);

  // Sort invoices
  const sortedInvoices = [...paginatedInvoices].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'amount') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6" data-testid="billing-page">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                Billing & Invoices
              </h1>
              <p className="text-gray-600 mt-1" data-testid="page-description">
                Manage your subscription and download invoices
              </p>
            </div>
          </div>
        </div>

        {/* Billing Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content - Left 8 columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* Billing Summary Card */}
            <Card data-testid="billing-summary-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Billing Summary</span>
                </CardTitle>
                <CardDescription>
                  Your active plan and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Plan Info */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <div className="font-semibold text-lg text-blue-900" data-testid="current-plan-name">
                      {currentPlan.name}
                    </div>
                    <div className="text-sm text-blue-700" data-testid="billing-cycle">
                      Billed {billingCycle === 'yearly' ? 'annually' : 'monthly'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900" data-testid="current-price">
                      ${currentPrice}
                    </div>
                    <div className="text-sm text-blue-700">
                      per {billingCycle === 'yearly' ? 'year' : 'month'}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Billing Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
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
                    <div className="text-sm font-medium text-gray-700">
                      Payment Status
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600" data-testid="payment-status">
                        Current
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700">
                      Auto-Renewal
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={autoRenew} 
                        onCheckedChange={setAutoRenew}
                        data-testid="auto-renew-toggle"
                      />
                      <span className="text-sm" data-testid="auto-renew-status">
                        {autoRenew ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    {autoRenew && (
                      <div className="text-xs text-gray-500 mt-1">
                        Next billing on {format(nextBillingDate, 'MMM d, yyyy')}
                      </div>
                    )}
                    {!autoRenew && (
                      <div className="text-xs text-orange-600 mt-1">
                        Renew before expiry
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card data-testid="billing-history-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Payment History</span>
                    </CardTitle>
                    <CardDescription>
                      View and download your past invoices
                    </CardDescription>
                  </div>
                  {invoices.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryInvoices}
                      disabled={isRetrying}
                      data-testid="retry-invoices-button"
                    >
                      {isRetrying ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 mr-2" />
                      )}
                      Refresh
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Download Error Alert */}
                {downloadError && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {downloadError}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto ml-2 text-red-600"
                        onClick={() => setDownloadError('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {displayInvoices.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12" data-testid="empty-billing-history">
                    <div className="p-3 bg-blue-100 rounded-xl w-fit mx-auto mb-4">
                      <FileText className="h-12 w-12 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No billing history yet
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {currentPlanKey === 'explore' 
                        ? 'Upgrade to a paid plan to see invoices here.' 
                        : 'Your invoices will appear here after your first billing cycle.'}
                    </p>
                    {currentPlanKey === 'explore' && (
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Upgrade Now
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50 select-none"
                              onClick={() => handleSortInvoices('id')}
                            >
                              <div className="flex items-center">
                                Invoice ID
                                {getSortIcon('id')}
                              </div>
                            </TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50 select-none"
                              onClick={() => handleSortInvoices('date')}
                            >
                              <div className="flex items-center">
                                Date
                                {getSortIcon('date')}
                              </div>
                            </TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Cycle</TableHead>
                            <TableHead 
                              className="cursor-pointer hover:bg-gray-50 select-none"
                              onClick={() => handleSortInvoices('amount')}
                            >
                              <div className="flex items-center">
                                Amount
                                {getSortIcon('amount')}
                              </div>
                            </TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedInvoices.map((invoice, index) => (
                            <TableRow 
                              key={invoice.id} 
                              className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                              data-testid={`invoice-row-${invoice.id}`}
                            >
                              <TableCell className="font-medium" data-testid={`invoice-id-${invoice.id}`}>
                                #{invoice.id}
                              </TableCell>
                              <TableCell data-testid={`invoice-date-${invoice.id}`}>
                                {format(new Date(invoice.date), 'MMM d, yyyy')}
                              </TableCell>
                              <TableCell data-testid={`invoice-plan-${invoice.id}`}>
                                {invoice.plan}
                              </TableCell>
                              <TableCell data-testid={`invoice-cycle-${invoice.id}`}>
                                <span className="capitalize text-sm">
                                  {invoice.period}
                                </span>
                              </TableCell>
                              <TableCell className="font-medium" data-testid={`invoice-amount-${invoice.id}`}>
                                ${invoice.amount}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600" data-testid={`payment-method-${invoice.id}`}>
                                {invoice.paymentMethod}
                              </TableCell>
                              <TableCell className="text-sm text-gray-600" data-testid={`transaction-id-${invoice.id}`}>
                                {invoice.transactionId}
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
                                  aria-label={`Download invoice for ${format(new Date(invoice.date), 'MMMM d, yyyy')}`}
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, displayInvoices.length)} of {displayInvoices.length} invoices
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="flex items-center px-3 py-1 text-sm">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right 4 columns */}
          <div className="lg:col-span-4 space-y-6">
            {/* Payment Method */}
            <Card data-testid="payment-method-card">
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className="p-2 bg-blue-100 rounded">
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
                <Dialog open={showBillingModal} onOpenChange={setShowBillingModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" data-testid="update-payment-button">
                      Update Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Update Billing Details</DialogTitle>
                      <DialogDescription>
                        Update your payment method, billing contact, and tax information.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const data = Object.fromEntries(formData);
                      handleUpdateBilling(data);
                    }}>
                      <div className="space-y-6 py-4">
                        {/* Payment Method Section */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Payment Method</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="card-number">Card Number *</Label>
                              <Input 
                                id="card-number" 
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456" 
                                defaultValue="4242 4242 4242 4242"
                                className={updateErrors.cardNumber ? "border-red-300" : ""}
                              />
                              {updateErrors.cardNumber && (
                                <p className="text-sm text-red-600">{updateErrors.cardNumber}</p>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="expiry">Expiry Date *</Label>
                                <Input 
                                  id="expiry" 
                                  name="expiry"
                                  placeholder="MM/YY" 
                                  defaultValue="12/25"
                                  className={updateErrors.expiry ? "border-red-300" : ""}
                                />
                                {updateErrors.expiry && (
                                  <p className="text-sm text-red-600">{updateErrors.expiry}</p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cvv">CVV *</Label>
                                <Input 
                                  id="cvv" 
                                  name="cvv"
                                  placeholder="123" 
                                  defaultValue="123"
                                  className={updateErrors.cvv ? "border-red-300" : ""}
                                />
                                {updateErrors.cvv && (
                                  <p className="text-sm text-red-600">{updateErrors.cvv}</p>
                                )}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="cardholder-name">Cardholder Name *</Label>
                              <Input 
                                id="cardholder-name" 
                                name="cardholderName"
                                placeholder="John Doe" 
                                defaultValue="John Smith"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Billing Contact Section */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Billing Contact</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="company-name">Company Name</Label>
                              <Input 
                                id="company-name" 
                                name="companyName"
                                placeholder="Tech Solutions Inc." 
                                defaultValue="Tech Solutions Inc."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="contact-name">Contact Name</Label>
                                <Input 
                                  id="contact-name" 
                                  name="contactName"
                                  placeholder="John Smith" 
                                  defaultValue="John Smith"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="contact-email">Email</Label>
                                <Input 
                                  id="contact-email" 
                                  name="contactEmail"
                                  type="email"
                                  placeholder="admin@company.com" 
                                  defaultValue="admin@company.com"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Tax Information Section */}
                        <div className="space-y-4">
                          <h3 className="font-medium text-gray-900">Tax Information</h3>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gst-number">GST/VAT Number</Label>
                              <Input 
                                id="gst-number" 
                                name="gstNumber"
                                placeholder="GST123456789" 
                                defaultValue="GST123456789"
                                className={updateErrors.gstNumber ? "border-red-300" : ""}
                              />
                              {updateErrors.gstNumber && (
                                <p className="text-sm text-red-600">{updateErrors.gstNumber}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="billing-address">Billing Address</Label>
                              <Textarea 
                                id="billing-address" 
                                name="billingAddress"
                                placeholder="Enter billing address" 
                                defaultValue="123 Business Street&#10;Business City, BC 12345&#10;Canada"
                                rows={3}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="country">Country</Label>
                              <Select name="country" defaultValue="CA">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                  <SelectItem value="DE">Germany</SelectItem>
                                  <SelectItem value="FR">France</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => {
                          setShowBillingModal(false);
                          setUpdateErrors({});
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          Update Billing Details
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Billing Contact */}
            <Card data-testid="billing-contact-card">
              <CardHeader>
                <CardTitle className="text-lg">Billing Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm" data-testid="billing-contact-name">
                    John Smith
                  </div>
                  <div className="text-gray-600 text-sm" data-testid="billing-contact-email">
                    admin@company.com
                  </div>
                  <div className="text-gray-600 text-sm" data-testid="billing-company">
                    Tech Solutions Inc.
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" data-testid="update-billing-contact-button">
                  <Building className="h-4 w-4 mr-2" />
                  Update Billing Details
                </Button>
              </CardContent>
            </Card>

            {/* GST/VAT Information */}
            <Card data-testid="tax-info-card">
              <CardHeader>
                <CardTitle className="text-lg">Tax Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="font-medium text-sm">GST/VAT Number</div>
                  <div className="text-gray-600 text-sm" data-testid="gst-number">
                    GST123456789
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-sm">Billing Address</div>
                  <div className="text-gray-600 text-sm" data-testid="billing-address">
                    123 Business Street<br />
                    Business City, BC 12345<br />
                    Canada
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" data-testid="update-tax-info-button">
                  <FileText className="h-4 w-4 mr-2" />
                  Update Tax Details
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
                  <TrendingUp className="h-4 w-4 mr-2" />
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
    </div>
  );
}