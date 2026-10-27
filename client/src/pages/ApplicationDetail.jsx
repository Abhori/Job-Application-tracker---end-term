import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ApplicationModal } from '../components/ApplicationModal.jsx';
import { EventModal } from '../components/EventModal.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { applicationApi } from '../api/applicationApi.js';
import { eventApi } from '../api/eventApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  ExternalLink,
  Edit2,
  Trash2,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  FileText,
  User,
  Mail,
  Phone,
} from 'lucide-react';

const STATUS_OPTIONS = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getApplicationById(id);
      if (res.success) {
        setApplication(res.data);
      }
    } catch (err) {
      toast.error('Failed to load application details.');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!application || application.status === newStatus) return;
    try {
      await applicationApi.updateStatus(application._id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      fetchApplicationDetails();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleEvent = async (eventId) => {
    try {
      await eventApi.toggleEventCompletion(eventId);
      toast.success('Event status updated');
      fetchApplicationDetails();
    } catch (err) {
      toast.error('Failed to update event status');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await eventApi.deleteEvent(eventId);
      toast.success('Event removed');
      fetchApplicationDetails();
    } catch (err) {
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteApplication = async () => {
    setIsDeleting(true);
    try {
      await applicationApi.deleteApplication(id);
      toast.success('Application deleted successfully');
      navigate('/applications');
    } catch (err) {
      toast.error('Failed to delete application');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1 }}>
        <Navbar title="Application Details" />
        <LoadingSpinner text="Retrieving application record..." />
      </div>
    );
  }

  if (!application) return null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title={application.company} subtitle={application.jobTitle} />

      <div className="page-wrapper">
        {/* Navigation Breadcrumb & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button
            onClick={() => navigate('/applications')}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Applications</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} />
              <span>Edit Details</span>
            </button>
            <button
              className="btn btn-ghost"
              style={{ color: 'var(--danger)' }}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Header Hero Card */}
        <div className="card" style={{ marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {application.jobTitle}
                </h2>
                <StatusBadge status={application.status} />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                  <Building size={16} color="var(--primary)" />
                  {application.company}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <MapPin size={16} />
                  {application.location} ({application.workMode})
                </span>
                <span style={{ textTransform: 'capitalize' }}>
                  {application.employmentType}
                </span>
                {application.salary && (
                  <span style={{ fontWeight: 600, color: '#065f46' }}>
                    {application.salary}
                  </span>
                )}
              </div>
            </div>

            {application.jobUrl && (
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary btn-sm"
              >
                <span>Original Posting</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Quick Status Bar */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.625rem' }}>
              Update Pipeline Status:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st}
                  className={st === application.status ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                  onClick={() => handleStatusChange(st)}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-3">
          {/* Main Column: Details, Recruiter, Notes */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Key Information */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
                Opportunity Overview
              </h3>

              <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Date Applied
                  </span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {application.dateApplied ? new Date(application.dateApplied).toLocaleDateString() : 'Not applied yet'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Application Deadline
                  </span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {application.deadline ? new Date(application.deadline).toLocaleDateString() : 'No deadline specified'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Resume Version
                  </span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {application.resumeVersion || 'Default Resume'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Created Timestamp
                  </span>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, marginTop: '0.25rem' }}>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Recruiter Details */}
              {(application.contact?.name || application.contact?.email) && (
                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <User size={16} />
                    <span>Recruiter / Point of Contact</span>
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {application.contact?.name && <strong>{application.contact.name} {application.contact.role && `(${application.contact.role})`}</strong>}
                    {application.contact?.email && (
                      <a href={`mailto:${application.contact.email}`} style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Mail size={14} />
                        {application.contact.email}
                      </a>
                    )}
                    {application.contact?.phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={14} />
                        {application.contact.phone}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {application.notes && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Personal Notes & Strategy
                  </span>
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.875rem', marginTop: '0.375rem', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                    {application.notes}
                  </div>
                </div>
              )}

              {/* Tags */}
              {application.tags && application.tags.length > 0 && (
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Tags
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
                    {application.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          fontWeight: 500,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description & Skill Comparison CTA */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Job Description</h3>
                <Link
                  to="/skill-analyzer"
                  state={{ prefillJd: application.jobDescription }}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: '0.375rem' }}
                >
                  <Sparkles size={15} color="var(--primary)" />
                  <span>Analyze Skills Gap</span>
                </Link>
              </div>

              {application.jobDescription ? (
                <div
                  style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {application.jobDescription}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No job description pasted. Edit this application to paste the job description and compare it against your resume.
                </p>
              )}
            </div>

            {/* Linked Events & Reminders */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Interviews & Action Items</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsEventModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Add Event</span>
                </button>
              </div>

              {application.events && application.events.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {application.events.map((evt) => (
                    <div
                      key={evt._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: evt.isCompleted ? '#f8fafc' : '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => handleToggleEvent(evt._id)}
                          className="btn-ghost"
                          style={{
                            padding: '0.25rem',
                            color: evt.isCompleted ? 'var(--success)' : '#94a3b8',
                          }}
                        >
                          <CheckCircle2 size={20} />
                        </button>
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: '0.9375rem',
                              color: 'var(--text-main)',
                              textDecoration: evt.isCompleted ? 'line-through' : 'none',
                            }}
                          >
                            {evt.title}
                          </div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                            {new Date(evt.dateTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                            {evt.locationOrLink && ` • ${evt.locationOrLink}`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge badge-${evt.eventType === 'interview' ? 'INTERVIEW' : 'SAVED'}`}>
                          {evt.eventType}
                        </span>
                        <button
                          onClick={() => handleDeleteEvent(evt._id)}
                          className="btn-ghost btn-sm"
                          style={{ color: '#ef4444' }}
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  No interview rounds or follow-up events scheduled yet.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Status History / Activity Log */}
          <div>
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
                Pipeline Activity Log
              </h3>

              {application.statusHistory && application.statusHistory.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
                  {application.statusHistory.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                      <div
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)',
                          marginTop: '6px',
                          flexShrink: 0,
                          boxShadow: '0 0 0 3px var(--primary-light)',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <StatusBadge status={item.status} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(item.changedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {item.note && (
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No status changes recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <ApplicationModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        application={application}
        onSaved={() => {
          setIsEditModalOpen(false);
          fetchApplicationDetails();
        }}
      />

      {/* Add Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        preselectedAppId={application._id}
        onSaved={() => {
          setIsEventModalOpen(false);
          fetchApplicationDetails();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteApplication}
        title="Delete Application"
        message={`Are you sure you want to delete this application for ${application.company}? This cannot be undone.`}
        confirmText="Yes, Delete Application"
        isLoading={isDeleting}
      />
    </div>
  );
};
