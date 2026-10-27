import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { analyticsApi } from '../api/analyticsApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Briefcase,
  Send,
  Calendar,
  AlertCircle,
  Trophy,
  XCircle,
  Percent,
  HelpCircle,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const STATUS_COLORS = {
  SAVED: '#94a3b8',
  APPLIED: '#3b82f6',
  ASSESSMENT: '#f59e0b',
  INTERVIEW: '#6366f1',
  OFFER: '#10b981',
  REJECTED: '#ef4444',
  WITHDRAWN: '#cbd5e1',
};

const WORK_MODE_COLORS = {
  remote: '#6366f1',
  hybrid: '#0ea5e9',
  onsite: '#8b5cf6',
};

export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('all');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAnalytics(timeRange);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div style={{ flex: 1 }}>
        <Navbar title="Analytics" />
        <LoadingSpinner text="Computing metrics from saved database records..." />
      </div>
    );
  }

  const {
    totalApplications = 0,
    totalActive = 0,
    totalSubmitted = 0,
    offersCount = 0,
    rejectionCount = 0,
    interviewConversionRate = 0,
    offerConversionRate = 0,
    statusCounts = {},
    workModeCounts = {},
    applicationsOverTime = [],
    definitions = {},
  } = data || {};

  // Format Status Data for PieChart
  const statusPieData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || '#64748b',
    }));

  // Format Work Mode Data for BarChart
  const workModeBarData = [
    { name: 'Remote', count: workModeCounts.remote || 0, fill: WORK_MODE_COLORS.remote },
    { name: 'Hybrid', count: workModeCounts.hybrid || 0, fill: WORK_MODE_COLORS.hybrid },
    { name: 'Onsite', count: workModeCounts.onsite || 0, fill: WORK_MODE_COLORS.onsite },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Analytics & Insights" subtitle="Real-time pipeline metrics calculated from your actual data" />

      <div className="page-wrapper">
        {/* Header & Filter Range */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-title">Performance & Pipeline Velocity</h2>
            <p className="page-subtitle">Zero fabricated metrics. Derived entirely from verified database state.</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Time Range:
            </span>
            <select
              className="form-select"
              style={{ width: 'auto' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="180d">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Interview Conversion"
            value={`${interviewConversionRate}%`}
            subtitle="Reached interview / submitted"
            icon={Percent}
            tooltip={definitions.interviewConversionRate}
            color="#4f46e5"
            bgColor="#eef2ff"
          />
          <StatCard
            title="Offer Conversion"
            value={`${offerConversionRate}%`}
            subtitle="Reached offer / submitted"
            icon={Trophy}
            tooltip={definitions.offerConversionRate}
            color="#10b981"
            bgColor="#ecfdf5"
          />
          <StatCard
            title="Submitted Applications"
            value={totalSubmitted}
            subtitle={`Out of ${totalApplications} total tracked`}
            icon={Send}
            color="#2563eb"
            bgColor="#eff6ff"
          />
          <StatCard
            title="Rejections Handled"
            value={rejectionCount}
            subtitle="Every 'no' gets you closer to the right 'yes'"
            icon={XCircle}
            color="#ef4444"
            bgColor="#fef2f2"
          />
        </div>

        {totalApplications === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No data to analyze yet"
            description="Track your first few applications to populate charts, pipeline distribution, and conversion rates."
            actionLabel="Go to Applications"
            onAction={() => window.location.assign('/applications')}
          />
        ) : (
          <>
            {/* Timeline Area Chart */}
            <div className="card" style={{ marginBottom: '2rem' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Applications Submitted Over Time</h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Monthly velocity of applications submitted into your active pipeline
                  </p>
                </div>
              </div>

              {applicationsOverTime.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem 0', textAlign: 'center' }}>
                  No submission dates recorded yet.
                </p>
              ) : (
                <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="Applications"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCount)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Status Breakdown & Work Mode Charts */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              {/* Donut Chart: Status Distribution */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Application Status Breakdown</h3>
                </div>

                <div style={{ height: '280px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart: Work Mode Distribution */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Work Mode Preference</h3>
                </div>

                <div style={{ height: '280px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workModeBarData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Opportunities" radius={[6, 6, 0, 0]}>
                        {workModeBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Calculation Methodology Callout */}
            <div
              className="card"
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <HelpCircle size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.375rem' }}>
                    Transparent Analytics Methodology
                  </h4>
                  <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '1.25rem' }}>
                    <li>
                      <strong>Interview Conversion Rate:</strong> Distinct submitted applications that have reached an interview stage (current status or via status history) divided by total distinct submitted applications. Avoids double-counting repeated interviews.
                    </li>
                    <li>
                      <strong>Offer Conversion Rate:</strong> Distinct submitted applications that culminated in an offer divided by total submitted applications.
                    </li>
                    <li>
                      <strong>Zero Fake Metrics:</strong> ApplyTrack never seeds arbitrary success rates or simulated hiring odds. Empty datasets safely default to 0% with no NaN or dividing-by-zero artifacts.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
