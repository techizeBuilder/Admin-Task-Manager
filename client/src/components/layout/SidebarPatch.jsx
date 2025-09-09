// Direct sidebar patch - Add this to your existing sidebar component
import { Receipt } from 'lucide-react';

// Add Billing & Invoices menu item right after License Management
// Find the existing License Management item and add this after it:

<li>
  <Link
    href="/settings/billing"
    className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
  >
    <Receipt className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
    Billing & Invoices
  </Link>
</li>

// Or if using a different structure:
{
  name: 'Billing & Invoices',
  href: '/settings/billing',
  icon: Receipt,
  current: false
}

// Or if using navigation array:
const navigation = [
  // ...existing items...
  { name: 'Profile', href: '/settings/profile', icon: UserIcon },
  { name: 'License Management', href: '/admin/subscription', icon: CrownIcon },
  { name: 'Billing & Invoices', href: '/settings/billing', icon: Receipt }, // ADD THIS LINE
  { name: 'Notifications', href: '/settings/notifications', icon: BellIcon },
  // ...rest of items...
];