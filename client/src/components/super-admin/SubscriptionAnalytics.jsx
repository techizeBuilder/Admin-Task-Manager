import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const SubscriptionAnalytics = ({ subscriptionStats }) => {
  // Mock data for analytics - replace with real data from API
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 1200, subscriptions: 25 },
    { month: 'Feb', revenue: 1800, subscriptions: 37 },
    { month: 'Mar', revenue: 2400, subscriptions: 49 },
    { month: 'Apr', revenue: 2200, subscriptions: 45 },
    { month: 'May', revenue: 2800, subscriptions: 57 },
    { month: 'Jun', revenue: 3200, subscriptions: 65 }
  ];

  const planGrowthData = [
    { month: 'Jan', EXPLORE: 15, PLAN: 8, EXECUTE: 2, OPTIMIZE: 0 },
    { month: 'Feb', EXPLORE: 22, PLAN: 12, EXECUTE: 3, OPTIMIZE: 0 },
    { month: 'Mar', EXPLORE: 28, PLAN: 16, EXECUTE: 4, OPTIMIZE: 1 },
    { month: 'Apr', EXPLORE: 25, PLAN: 15, EXECUTE: 4, OPTIMIZE: 1 },
    { month: 'May', EXPLORE: 30, PLAN: 20, EXECUTE: 6, OPTIMIZE: 1 },
    { month: 'Jun', EXPLORE: 32, PLAN: 25, EXECUTE: 7, OPTIMIZE: 1 }
  ];

  const churnData = [
    { month: 'Jan', newSignups: 8, churn: 1, net: 7 },
    { month: 'Feb', newSignups: 12, churn: 2, net: 10 },
    { month: 'Mar', newSignups: 15, churn: 3, net: 12 },
    { month: 'Apr', newSignups: 10, churn: 4, net: 6 },
    { month: 'May', newSignups: 18, churn: 2, net: 16 },
    { month: 'Jun', newSignups: 20, churn: 3, net: 17 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const planDistributionData = subscriptionStats?.planDistribution?.map(plan => ({
    name: plan.planName,
    value: plan.count,
    percentage: plan.percentage
  })) || [];

  return (
    <div className="space-y-6">
      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [`$${value}`, name === 'revenue' ? 'Revenue' : 'Subscriptions']} />
              <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="subscriptions" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={planDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {planDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="EXPLORE" stackId="a" fill="#8884d8" />
              <Bar dataKey="PLAN" stackId="a" fill="#82ca9d" />
              <Bar dataKey="EXECUTE" stackId="a" fill="#ffc658" />
              <Bar dataKey="OPTIMIZE" stackId="a" fill="#ff7300" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Churn and Growth Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Acquisition vs Churn</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={churnData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="newSignups" fill="#4ade80" name="New Signups" />
            <Bar dataKey="churn" fill="#f87171" name="Churn" />
            <Bar dataKey="net" fill="#3b82f6" name="Net Growth" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {((subscriptionStats?.activeSubscriptions || 0) / (subscriptionStats?.totalOrganizations || 1) * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Conversion Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              ${((subscriptionStats?.monthlyRevenue || 0) / (subscriptionStats?.activeSubscriptions || 1)).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 mt-1">ARPU (Monthly)</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">2.5%</div>
            <div className="text-sm text-gray-600 mt-1">Monthly Churn Rate</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">95%</div>
            <div className="text-sm text-gray-600 mt-1">Customer Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Feature Usage Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Most Popular Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {[
              { feature: 'Task Management', usage: 95, organizations: 62 },
              { feature: 'Form Builder', usage: 78, organizations: 45 },
              { feature: 'Process Automation', usage: 65, organizations: 38 },
              { feature: 'Analytics & Reports', usage: 52, organizations: 30 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900">{item.feature}</span>
                    <span className="text-gray-500">{item.usage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${item.usage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Used by {item.organizations} organizations
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Usage Insights</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>• Task Management is the most utilized feature across all plans</div>
              <div>• Form Builder usage increases significantly with paid plans</div>
              <div>• Process Automation is primarily used by EXECUTE+ plan subscribers</div>
              <div>• Analytics & Reports show highest engagement in OPTIMIZE plan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAnalytics;