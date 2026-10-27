import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ApplicationModal } from '../components/ApplicationModal.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { applicationApi } from '../api/applicationApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Search,
  Filter,
  Kanban,
  List as ListIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowUpDown,
} from 'lucide-react';

const STATUS_COLUMNS = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const Applications = () => {
  const { openNewAppModal } = useOutletContext();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  // Modal states
  const [selectedAppForEdit, setSelectedAppForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppForDelete, setSelectedAppForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim(),
        status: statusFilter,
        workMode: workModeFilter,
        employmentType: employmentTypeFilter,
        sortBy,
        order,
        page: pagination.page,
        limit: viewMode === 'kanban' ? 100 : pagination.limit,
      };

      const res = await applicationApi.getApplications(params);
      if (res.success) {
        setApplications(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to fetch applications', err);
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, workModeFilter, employmentTypeFilter, sortBy, order, pagination.page, pagination.limit, viewMode, toast]);

  useEffect(() => {
    fetchApplications();

    const handleRefresh = () => fetchApplications();
    window.addEventListener('applytrack:applicationSaved', handleRefresh);
    return () => window.removeEventListener('applytrack:applicationSaved', handleRefresh);
  }, [fetchApplications]);

  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      await applicationApi.updateStatus(appId, newStatus);
      toast.success(`Moved application to ${newStatus}`);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to update application status');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppForDelete) return;
    setIsDeleting(true);
    try {
      await applicationApi.deleteApplication(selectedAppForDelete._id);
      toast.success('Application deleted successfully');
      setSelectedAppForDelete(null);
      fetchApplications();
    } catch (err) {
      toast.error('Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Applications" subtitle="Pipeline lifecycle, filtering & Kanban view" />

      <div className="page-wrapper">
        {/* Top Controls: Search, Filters, View Mode, New Button */}
        <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 260px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by company, role, location, or tag..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              />
              <Search
                size={18}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <option value="ALL">All Statuses</option>
                {STATUS_COLUMNS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={workModeFilter}
                onChange={(e) => {
                  setWorkModeFilter(e.target.value);
                  setPagination((p) => ({ ...p, page: 1 }));
                }}
              >
                <option value="ALL">All Work Modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>

              {/* View Switcher */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#f1f5f9',
                  borderRadius: 'var(--radius-sm)',
                  padding: '2px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <button
                  className="btn-ghost"
                  style={{
                    padding: '0.375rem 0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: viewMode === 'kanban' ? '#ffffff' : 'transparent',
                    boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none',
                    color: viewMode === 'kanban' ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                  onClick={() => setViewMode('kanban')}
                  title="Kanban Board View"
                >
                  <Kanban size={18} />
                </button>
                <button
                  className="btn-ghost"
                  style={{
                    padding: '0.375rem 0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: viewMode === 'list' ? '#ffffff' : 'transparent',
                    boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                    color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                  onClick={() => setViewMode('list')}
                  title="List Table View"
                >
                  <ListIcon size={18} />
                </button>
              </div>

              <button className="btn btn-primary" onClick={openNewAppModal}>
                <Plus size={18} />
                <span>New Application</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {loading ? (
          <LoadingSpinner text="Loading your pipeline..." />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications match your criteria"
            description="Try clearing your search query or filters, or track a new application opportunity."
            actionLabel="Add New Application"
            onAction={openNewAppModal}
          />
        ) : viewMode === 'kanban' ? (
          /* Kanban Board View */
          <div className="kanban-board">
            {STATUS_COLUMNS.map((colStatus) => {
              const colApps = applications.filter((a) => a.status === colStatus);
              return (
                <div key={colStatus} className="kanban-column">
                  <div className="kanban-column-header">
                    <span className="kanban-column-title">
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor:
                            colStatus === 'OFFER'
                              ? '#10b981'
                              : colStatus === 'INTERVIEW'
                              ? '#4f46e5'
                              : colStatus === 'REJECTED'
                              ? '#ef4444'
                              : '#64748b',
                        }}
                      />
                      {colStatus}
                    </span>
                    <span
                      style={{
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.125rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {colApps.length}
                    </span>
                  </div>

                  <div className="kanban-cards">
                    {colApps.map((app) => (
                      <div key={app._id} className="kanban-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <Link
                            to={`/applications/${app._id}`}
                            style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}
                          >
                            {app.company}
                          </Link>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => {
                                setSelectedAppForEdit(app);
                                setIsEditModalOpen(true);
                              }}
                              className="btn-ghost btn-sm"
                              style={{ padding: '0.25rem', color: '#94a3b8' }}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setSelectedAppForDelete(app)}
                              className="btn-ghost btn-sm"
                              style={{ padding: '0.25rem', color: '#ef4444' }}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                          {app.jobTitle}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '0.75rem' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: 'var(--text-muted)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {app.workMode}
                          </span>
                          {app.salary && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '4px',
                                backgroundColor: '#ecfdf5',
                                color: '#065f46',
                              }}
                            >
                              {app.salary}
                            </span>
                          )}
                        </div>

                        {/* Quick Status Move Dropdown */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.625rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <select
                            value={app.status}
                            onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-color)',
                              backgroundColor: '#f8fafc',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {STATUS_COLUMNS.map((st) => (
                              <option key={st} value={st}>
                                Move: {st}
                              </option>
                            ))}
                          </select>

                          <Link
                            to={`/applications/${app._id}`}
                            style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}
                          >
                            Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table / List View */
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Date Applied</th>
                    <th>Deadline</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <Link
                          to={`/applications/${app._id}`}
                          style={{ fontWeight: 600, color: 'var(--primary)' }}
                        >
                          {app.company}
                        </Link>
                      </td>
                      <td style={{ color: 'var(--text-main)' }}>{app.jobTitle}</td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>
                        {app.workMode}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {app.deadline ? new Date(app.deadline).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <Link
                            to={`/applications/${app._id}`}
                            className="btn btn-ghost btn-sm"
                            title="View details"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedAppForEdit(app);
                              setIsEditModalOpen(true);
                            }}
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setSelectedAppForDelete(app)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.5rem',
                  borderTop: '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                }}
              >
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} opportunities)
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={!pagination.hasNextPage}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAppForEdit(null);
        }}
        application={selectedAppForEdit}
        onSaved={() => {
          setIsEditModalOpen(false);
          setSelectedAppForEdit(null);
          fetchApplications();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!selectedAppForDelete}
        onClose={() => setSelectedAppForDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Job Application"
        message={`Are you sure you want to delete your application for "${selectedAppForDelete?.jobTitle}" at "${selectedAppForDelete?.company}"? All related interview events and notes will also be removed.`}
        confirmText="Permanently Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
