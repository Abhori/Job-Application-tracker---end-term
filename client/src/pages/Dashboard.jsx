import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { analyticsApi } from '../api/analyticsApi.js';
import { applicationApi } from '../api/applicationApi.js';
import { eventApi } from '../api/eventApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Briefcase,
  Send,
  Calendar,
  AlertCircle,
  Trophy,
  Percent,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const Dashboard = () => {
  const { openNewAppModal } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const loadDashboardData = async () => {
    try {
      const [analyticsRes, appsRes] = await Promise.all([
        analyticsApi.getAnalytics('all'),
        applicationApi.getApplications({ limit: 6, sortBy: 'createdAt', order: 'desc' }),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (appsRes.success) setRecentApplications(appsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Could not load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen for global applicationSaved event to refresh
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('applytrack:applicationSaved', handleRefresh);
    return () => window.removeEventListener('applytrack:applicationSaved', handleRefresh);
  }, []);

  const handleToggleEvent = async (eventId) => {
    try {
      await eventApi.toggleEventCompletion(eventId);
      toast.success('Event status updated');
      loadDashboardData();
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1 }}>
        <Navbar title="Dashboard" subtitle="Overview of your career search" />
        <LoadingSpinner text="Computing live pipeline metrics..." />
      </div>
    );
  }

  const {
    totalApplications = 0,
    totalActive = 0,
    totalSubmitted = 0,
    upcomingInterviewsCount = 0,
    overdueEventsCount = 0,
    offersCount = 0,
    interviewConversionRate = 0,
    offerConversionRate = 0,
    upcomingEvents = [],
    overdueEvents = [],
    statusCounts = {},
    definitions = {},
  } = analytics || {};

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Dashboard" subtitle="Live tracking & career pipeline analytics" />

      <div className="page-wrapper">
        {/* Quick Actions Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
          <div>
            <h2 className="page-title">Career Pipeline Snapshot</h2>
            <p className="page-subtitle">Real-time metrics calculated from your actual submissions</p>
          </div>
          <button className="btn btn-primary" onClick={openNewAppModal}>
            <Plus size={18} />
            <span>Add Application</span>
          </button>
        </div>

        {/* Overdue Action Alert Banner */}
        {overdueEventsCount > 0 && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <AlertCircle size={22} />
              </div>
              <div>
                <strong style={{ color: '#991b1b', fontSize: '0.9375rem' }}>
                  Action Needed: You have {overdueEventsCount} overdue follow-up{overdueEventsCount > 1 ? 's' : ''} or deadline{overdueEventsCount > 1 ? 's' : ''}!
                </strong>
                <p style={{ color: '#b91c1c', fontSize: '0.8125rem', marginTop: '0.125rem' }}>
                  {overdueEvents[0]?.title} ({overdueEvents[0]?.application?.company || 'Opportunity'}) was due{' '}
                  {new Date(overdueEvents[0]?.dateTime).toLocaleDateString()}.
                </p>
              </div>
            </div>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ borderColor: '#fca5a5', color: '#991b1b' }}>
              Resolve Tasks
            </Link>
          </div>
        )}

        {/* High-level Metric Stat Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            title="Active Applications"
            value={totalActive}
            subtitle={`${totalApplications} total opportunities logged`}
            icon={Briefcase}
            tooltip={definitions.activeApplications}
            color="var(--primary)"
            bgColor="var(--primary-light)"
          />
          <StatCard
            title="Applications Submitted"
            value={totalSubmitted}
            subtitle="Moved past discovery/saved stage"
            icon={Send}
            color="#2563eb"
            bgColor="#eff6ff"
          />
          <StatCard
            title="Upcoming Interviews"
            value={upcomingInterviewsCount}
            subtitle={`${upcomingEvents.length} total scheduled events`}
            icon={Calendar}
            color="#4f46e5"
            bgColor="#eef2ff"
          />
          <StatCard
            title="Offers Received"
            value={offersCount}
            subtitle={`${offerConversionRate}% offer conversion rate`}
            icon={Trophy}
            tooltip={definitions.offerConversionRate}
            color="#10b981"
            bgColor="#ecfdf5"
          />
        </div>

        {/* Pipeline Distribution Bar */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">Pipeline Funnel Distribution</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Interview Conversion: <strong style={{ color: 'var(--primary)' }}>{interviewConversionRate}%</strong>
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              height: '14px',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              backgroundColor: '#e2e8f0',
              marginBottom: '1rem',
            }}
          >
            {totalApplications === 0 ? (
              <div style={{ width: '100%', backgroundColor: '#e2e8f0' }} />
            ) : (
              <>
                <div style={{ width: `${((statusCounts.SAVED || 0) / totalApplications) * 100}%`, backgroundColor: '#94a3b8' }} title={`Saved: ${statusCounts.SAVED || 0}`} />
                <div style={{ width: `${((statusCounts.APPLIED || 0) / totalApplications) * 100}%`, backgroundColor: '#3b82f6' }} title={`Applied: ${statusCounts.APPLIED || 0}`} />
                <div style={{ width: `${((statusCounts.ASSESSMENT || 0) / totalApplications) * 100}%`, backgroundColor: '#f59e0b' }} title={`Assessment: ${statusCounts.ASSESSMENT || 0}`} />
                <div style={{ width: `${((statusCounts.INTERVIEW || 0) / totalApplications) * 100}%`, backgroundColor: '#6366f1' }} title={`Interview: ${statusCounts.INTERVIEW || 0}`} />
                <div style={{ width: `${((statusCounts.OFFER || 0) / totalApplications) * 100}%`, backgroundColor: '#10b981' }} title={`Offer: ${statusCounts.OFFER || 0}`} />
                <div style={{ width: `${((statusCounts.REJECTED || 0) / totalApplications) * 100}%`, backgroundColor: '#ef4444' }} title={`Rejected: ${statusCounts.REJECTED || 0}`} />
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8125rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
              Saved: <strong>{statusCounts.SAVED || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
              Applied: <strong>{statusCounts.APPLIED || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              Assessment: <strong>{statusCounts.ASSESSMENT || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
              Interview: <strong>{statusCounts.INTERVIEW || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              Offer: <strong>{statusCounts.OFFER || 0}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              Rejected: <strong>{statusCounts.REJECTED || 0}</strong>
            </span>
          </div>
        </div>

        {/* Bottom Section: Recent Applications & Upcoming Events */}
        <div className="grid-2">
          {/* Recent Applications */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Applications</h3>
              <Link to="/applications" className="btn btn-ghost btn-sm">
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <EmptyState
                title="No applications tracked yet"
                description="Start tracking your internship and job applications to see live metrics and status updates."
                actionLabel="Track First Application"
                onAction={openNewAppModal}
              />
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app._id}>
                        <td>
                          <Link
                            to={`/applications/${app._id}`}
                            style={{ fontWeight: 600, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                          >
                            {app.company}
                          </Link>
                        </td>
                        <td>{app.jobTitle}</td>
                        <td>
                          <StatusBadge status={app.status} />
                        </td>
                        <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                          {app.workMode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Upcoming Agenda / Events */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Next Scheduled Actions</h3>
              <Link to="/events" className="btn btn-ghost btn-sm">
                <span>Full Agenda</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming events"
                description="Schedule upcoming interview rounds, take-home assessment deadlines, and recruiter follow-ups."
                actionLabel="Add Reminder"
                onAction={() => window.location.assign('/events')}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcomingEvents.slice(0, 5).map((evt) => (
                  <div
                    key={evt._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.875rem 1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        onClick={() => handleToggleEvent(evt._id)}
                        className="btn-ghost"
                        style={{ padding: '0.25rem', color: '#94a3b8' }}
                        title="Mark Complete"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {evt.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {evt.application?.company} • {new Date(evt.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`badge badge-${evt.eventType === 'interview' ? 'INTERVIEW' : 'SAVED'}`}
                      style={{ fontSize: '0.7rem' }}
                    >
                      {evt.eventType}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
