import { useState } from 'react';
import { 
  X, 
  Calendar, 
  CreditCard, 
  Building2, 
  Users, 
  Activity
} from 'lucide-react';

const OrganizationSubscriptionModal = ({ isOpen, onClose, organization }) => {
  const [formData] = useState({
    license_code: organization?.currentPlan || '',
    subscription_status: organization?.status || 'trial',
    subscription_end_date: organization?.expiresAt ? 
      new Date(organization.expiresAt).toISOString().split('T')[0] : ''
  });

  // Debug: Log organization data to see what's available
  console.log('Organization data in modal:', organization);

  if (!isOpen || !organization) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Organization Details</h2>
            <p className="text-sm text-gray-600 mt-1">{organization.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Organization Overview */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-500 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Organization</div>
                <div className="font-medium">{organization.name}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Users</div>
                <div className="font-medium">{organization.userCount}</div>
              </div>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-purple-500 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Current Plan</div>
                <div className="font-medium">{organization.currentPlan}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Activity className="h-5 w-5 text-orange-500 mr-2" />
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  organization.status === 'active' ? 'bg-green-100 text-green-800' :
                  organization.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                  organization.status === 'expired' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {organization.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plan
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {formData.license_code || 'EXPLORE'} {formData.license_code === 'EXPLORE' ? '(Free Trial)' : 
                 formData.license_code === 'PLAN' ? '($29/month)' :
                 formData.license_code === 'EXECUTE' ? '($49/month)' :
                 formData.license_code === 'OPTIMIZE' ? '($99/month)' : ''}
              </div>
            </div>

            {/* Subscription Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subscription Status
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 capitalize">
                {formData.subscription_status}
              </div>
            </div>

            {/* Expiration Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                {organization?.status === 'trial' ? 'Trial End Date' : 'Subscription End Date'}
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {(() => {
                  // For trial organizations, show trial end date, otherwise show subscription end date
                  const relevantDate = organization?.status === 'trial' ? 
                    organization?.trialEndsAt : 
                    organization?.expiresAt;
                  
                  if (relevantDate) {
                    return new Date(relevantDate).toLocaleDateString();
                  }
                  
                  // Fallback to formData if organization data doesn't have the date
                  if (formData.subscription_end_date) {
                    return new Date(formData.subscription_end_date).toLocaleDateString();
                  }
                  
                  return 'No end date specified';
                })()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {(() => {
                  const relevantDate = organization?.status === 'trial' ? 
                    organization?.trialEndsAt : 
                    organization?.expiresAt;
                  
                  if (!relevantDate && !formData.subscription_end_date) {
                    return 'Unlimited access or trial period';
                  }
                  
                  const dateToCheck = relevantDate || formData.subscription_end_date;
                  const isExpired = dateToCheck && new Date(dateToCheck) < new Date();
                  const statusText = organization?.status === 'trial' ? 'Trial' : 'Subscription';
                  
                  return `${statusText} ${isExpired ? 'expired' : 'expires'} on this date`;
                })()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSubscriptionModal;