import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { EventModal } from '../components/EventModal.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { eventApi } from '../api/eventApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';

export const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('upcoming'); // 'upcoming' | 'all' | 'overdue' | 'completed'

  // Modals
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEventForDelete, setSelectedEventForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getEvents();
      if (res.success) {
        setEvents(res.data);
      }
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleToggleComplete = async (eventId) => {
    try {
      await eventApi.toggleEventCompletion(eventId);
      toast.success('Event status updated');
      fetchEvents();
    } catch (err) {
      toast.error('Failed to update event');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEventForDelete) return;
    setIsDeleting(true);
    try {
      await eventApi.deleteEvent(selectedEventForDelete._id);
      toast.success('Event deleted');
      setSelectedEventForDelete(null);
      fetchEvents();
    } catch (err) {
      toast.error('Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  const now = new Date();

  // Filter events based on active tab
  const filteredEvents = events.filter((evt) => {
    const evtDate = new Date(evt.dateTime);
    if (filterMode === 'upcoming') {
      return !evt.isCompleted && evtDate >= now;
    }
    if (filterMode === 'overdue') {
      return !evt.isCompleted && evtDate < now;
    }
    if (filterMode === 'completed') {
      return evt.isCompleted;
    }
    return true; // 'all'
  });

  const overdueCount = events.filter((e) => !e.isCompleted && new Date(e.dateTime) < now).length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Events & Deadlines" subtitle="Interviews, assessments, deadlines & reminders" />

      <div className="page-wrapper">
        {/* Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-title">Search Action Agenda</h2>
            <p className="page-subtitle">Track important dates to stay on top of your recruiting schedule</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Filter Tabs */}
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
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filterMode === 'upcoming' ? '#ffffff' : 'transparent',
                  fontWeight: filterMode === 'upcoming' ? 600 : 500,
                  color: filterMode === 'upcoming' ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: filterMode === 'upcoming' ? 'var(--shadow-sm)' : 'none',
                }}
                onClick={() => setFilterMode('upcoming')}
              >
                Upcoming
              </button>
              <button
                className="btn-ghost"
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filterMode === 'overdue' ? '#ffffff' : 'transparent',
                  fontWeight: filterMode === 'overdue' ? 600 : 500,
                  color: filterMode === 'overdue' ? 'var(--danger)' : 'var(--text-secondary)',
                  boxShadow: filterMode === 'overdue' ? 'var(--shadow-sm)' : 'none',
                }}
                onClick={() => setFilterMode('overdue')}
              >
                Overdue ({overdueCount})
              </button>
              <button
                className="btn-ghost"
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filterMode === 'all' ? '#ffffff' : 'transparent',
                  fontWeight: filterMode === 'all' ? 600 : 500,
                  color: filterMode === 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                  boxShadow: filterMode === 'all' ? 'var(--shadow-sm)' : 'none',
                }}
                onClick={() => setFilterMode('all')}
              >
                All
              </button>
              <button
                className="btn-ghost"
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: filterMode === 'completed' ? '#ffffff' : 'transparent',
                  fontWeight: filterMode === 'completed' ? 600 : 500,
                  color: filterMode === 'completed' ? 'var(--success)' : 'var(--text-secondary)',
                  boxShadow: filterMode === 'completed' ? 'var(--shadow-sm)' : 'none',
                }}
                onClick={() => setFilterMode('completed')}
              >
                Completed
              </button>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedEventForEdit(null);
                setIsEventModalOpen(true);
              }}
            >
              <Plus size={18} />
              <span>Schedule Event</span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading events..." />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title={
              filterMode === 'overdue'
                ? 'No overdue events! You are all caught up.'
                : 'No events found for this filter'
            }
            description="Schedule interview dates, assessment deadlines, or follow-ups to keep your pipeline moving."
            actionLabel="Schedule Event"
            onAction={() => {
              setSelectedEventForEdit(null);
              setIsEventModalOpen(true);
            }}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEvents.map((evt) => {
              const isPast = new Date(evt.dateTime) < now && !evt.isCompleted;
              return (
                <div
                  key={evt._id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderLeft: isPast ? '4px solid var(--danger)' : evt.isCompleted ? '4px solid var(--success)' : '4px solid var(--primary)',
                    backgroundColor: evt.isCompleted ? '#f8fafc' : '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                    <button
                      onClick={() => handleToggleComplete(evt._id)}
                      className="btn-ghost"
                      style={{
                        padding: '0.25rem',
                        color: evt.isCompleted ? 'var(--success)' : isPast ? 'var(--danger)' : '#94a3b8',
                        marginTop: '2px',
                      }}
                      title={evt.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <CheckCircle2 size={24} />
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <h4
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            textDecoration: evt.isCompleted ? 'line-through' : 'none',
                          }}
                        >
                          {evt.title}
                        </h4>
                        <span className={`badge badge-${evt.eventType === 'interview' ? 'INTERVIEW' : 'SAVED'}`}>
                          {evt.eventType}
                        </span>
                        {isPast && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--danger)',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                            }}
                          >
                            <AlertCircle size={14} />
                            Overdue
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.375rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        {evt.application && (
                          <Link
                            to={`/applications/${evt.application._id}`}
                            style={{ fontWeight: 600, color: 'var(--primary)' }}
                          >
                            {evt.application.company} — {evt.application.jobTitle}
                          </Link>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                          <Clock size={14} />
                          {new Date(evt.dateTime).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
                        </span>
                      </div>

                      {evt.locationOrLink && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                          {evt.locationOrLink.startsWith('http') ? (
                            <a
                              href={evt.locationOrLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontWeight: 500 }}
                            >
                              <span>Open Meeting Link</span>
                              <ExternalLink size={14} />
                            </a>
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Location: {evt.locationOrLink}
                            </span>
                          )}
                        </div>
                      )}

                      {evt.notes && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)', backgroundColor: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', maxWidth: '640px' }}>
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => {
                        setSelectedEventForEdit(evt);
                        setIsEventModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                      title="Edit Event"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => setSelectedEventForDelete(evt)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)' }}
                      title="Delete Event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit / Create Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setSelectedEventForEdit(null);
        }}
        event={selectedEventForEdit}
        onSaved={() => {
          setIsEventModalOpen(false);
          setSelectedEventForEdit(null);
          fetchEvents();
        }}
      />

      {/* Delete Event Dialog */}
      <ConfirmDialog
        isOpen={!!selectedEventForDelete}
        onClose={() => setSelectedEventForDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEventForDelete?.title}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};
