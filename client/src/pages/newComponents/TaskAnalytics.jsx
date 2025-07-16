
import React, { useState } from 'react'

export default function TaskAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  
  const analyticsData = {
    totalTasks: 156,
    completedTasks: 89,
    inProgressTasks: 45,
    pendingTasks: 22,
    overdueTasks: 8
  }

  const completionRate = Math.round((analyticsData.completedTasks / analyticsData.totalTasks) * 100)

  const teamMembers = [
    { name: 'John Smith', completed: 24, rate: 95, avatar: 'JS', color: 'bg-blue-500' },
    { name: 'Sarah Wilson', completed: 18, rate: 88, avatar: 'SW', color: 'bg-purple-500' },
    { name: 'Mike Johnson', completed: 21, rate: 92, avatar: 'MJ', color: 'bg-green-500' },
    { name: 'Emily Davis', completed: 15, rate: 85, avatar: 'ED', color: 'bg-pink-500' },
    { name: 'Alex Chen', completed: 11, rate: 78, avatar: 'AC', color: 'bg-indigo-500' }
  ]

  const priorityData = [
    { priority: 'High Priority', percentage: 35, count: 55, color: 'bg-red-500' },
    { priority: 'Medium Priority', percentage: 45, count: 70, color: 'bg-yellow-500' },
    { priority: 'Low Priority', percentage: 20, count: 31, color: 'bg-green-500' }
  ]

  const timeframes = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  return (
    <div className="analytics-container h-auto overflow-scroll">
      {/* Header Section */}
      <div className="analytics-header">
        <div className="header-content">
          <div>
            <h1 className="analytics-title">📊 Task Analytics</h1>
            <p className="analytics-subtitle">Comprehensive insights and performance metrics</p>
          </div>
          <div className="header-controls">
            <select 
              className="period-selector"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
            <button className="export-btn">
              📤 Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card featured">
          <div className="metric-header">
            <div className="metric-icon total">📊</div>
            <div className="metric-trend positive">+12%</div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Total Tasks</h3>
            <div className="metric-value">{analyticsData.totalTasks}</div>
            <div className="metric-sublabel">vs last {selectedPeriod}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon completed">✅</div>
            <div className="metric-trend positive">+8%</div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Completed</h3>
            <div className="metric-value">{analyticsData.completedTasks}</div>
            <div className="metric-sublabel">{completionRate}% completion rate</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon progress">🔄</div>
            <div className="metric-trend neutral">-2%</div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">In Progress</h3>
            <div className="metric-value">{analyticsData.inProgressTasks}</div>
            <div className="metric-sublabel">28% of total tasks</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon pending">⏳</div>
            <div className="metric-trend neutral">+5%</div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Pending</h3>
            <div className="metric-value">{analyticsData.pendingTasks}</div>
            <div className="metric-sublabel">14% of total tasks</div>
          </div>
        </div>

        <div className="metric-card alert">
          <div className="metric-header">
            <div className="metric-icon overdue">⚠️</div>
            <div className="metric-trend negative">+3</div>
          </div>
          <div className="metric-content">
            <h3 className="metric-label">Overdue</h3>
            <div className="metric-value">{analyticsData.overdueTasks}</div>
            <div className="metric-sublabel">Needs immediate attention</div>
          </div>
        </div>

        {/* Completion Rate Circle */}
        <div className="metric-card completion-card">
          <div className="completion-circle-container">
            <h3 className="metric-label mb-4">Overall Progress</h3>
            <div className="completion-circle">
              <svg className="circle-svg" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#f3f4f6"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${completionRate * 3.14} 314`}
                  strokeLinecap="round"
                  className="progress-circle"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="circle-content">
                <span className="circle-percentage">{completionRate}%</span>
                <span className="circle-label">Complete</span>
              </div>
            </div>
            <div className="completion-message">🎉 Excellent progress!</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Priority Distribution */}
        <div className="chart-card priority-chart">
          <div className="chart-header">
            <h3 className="chart-title">📋 Task Distribution by Priority</h3>
            <div className="chart-actions">
              <button className="chart-action-btn">⚙️</button>
            </div>
          </div>
          <div className="priority-bars">
            {priorityData.map((item, index) => (
              <div key={index} className="priority-item">
                <div className="priority-info">
                  <div className="priority-header">
                    <span className="priority-name">{item.priority}</span>
                    <span className="priority-count">{item.count} tasks</span>
                  </div>
                  <div className="priority-percentage">{item.percentage}%</div>
                </div>
                <div className="priority-bar-container">
                  <div 
                    className={`priority-bar ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="chart-card team-chart">
          <div className="chart-header">
            <h3 className="chart-title">👥 Team Performance</h3>
            <div className="chart-actions">
              <button className="chart-action-btn">📊</button>
            </div>
          </div>
          <div className="team-performance">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card">
                <div className="member-avatar-section">
                  <div className={`member-avatar ${member.color}`}>
                    {member.avatar}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-stats">
                      {member.completed} tasks • {member.rate}% rate
                    </div>
                  </div>
                </div>
                <div className="member-progress">
                  <div className="progress-bar-bg">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${member.rate}%` }}
                    />
                  </div>
                  <span className="progress-text">{member.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="insights-section">
        <div className="insight-card">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h4>Peak Productivity</h4>
            <p>Your team completes 40% more tasks on Tuesday-Thursday</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">⏰</div>
          <div className="insight-content">
            <h4>Average Completion Time</h4>
            <p>Tasks are completed 2.3 days faster than last month</p>
          </div>
        </div>
        <div className="insight-card">
          <div className="insight-icon">🔥</div>
          <div className="insight-content">
            <h4>Hottest Category</h4>
            <p>Development tasks show highest completion rates</p>
          </div>
        </div>
      </div>
    </div>
  )
}
