// Add Billing & Invoices to Settings menu
// In the Settings section navigation
<NavItem
  href="/settings/billing"
  icon={Receipt}
  label="Billing & Invoices"
  permissions={['view_billing']}
/>

// Or if using a different navigation structure:
{
  title: 'Billing & Invoices',
  href: '/settings/billing', 
  icon: <Receipt className="h-4 w-4" />,
  permissions: ['view_billing']
}