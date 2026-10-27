import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { eventApi } from '../api/eventApi.js';
import { applicationApi } from '../api/applicationApi.js';
import { useToast } from '../context/ToastContext.jsx';

export const EventModal = ({
  isOpen,
  onClose,
  event = null,
  preselectedAppId = null,
  onSaved,
}) => {
  const [applications, setApplications] = useState([]);
  const [applicationId, setApplicationId] = useState(preselectedAppId || '');
  const [eventType, setEventType] = useState('interview');
  const [title, setTitle] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      // Load applications for selection dropdown if not preselected
      const loadApps = async () => {
        try {
          const res = await applicationApi.getApplications({ limit: 100 });
          if (res.success) {
            setApplications(res.data);
            if (!preselectedAppId && res.data.length > 0 && !applicationId) {
              setApplicationId(res.data[0]._id);
            }
          }
        } catch (err) {
          console.warn('Could not load applications for event selector', err);
        }
      };
      loadApps();
    }
  }, [isOpen, preselectedAppId]);

  useEffect(() => {
    if (event) {
      setApplicationId(event.application?._id || event.application || '');
      setEventType(event.eventType || 'interview');
      setTitle(event.title || '');
      // Format to YYYY-MM-DDTHH:mm
      if (event.dateTime) {
        const d = new Date(event.dateTime);
        const formatted = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setDateTime(formatted);
      } else {
        setDateTime('');
      }
      setLocationOrLink(event.locationOrLink || '');
      setNotes(event.notes || '');
    } else {
      setApplicationId(preselectedAppId || '');
      setEventType('interview');
      setTitle('');
      // Default to tomorrow 10:00 AM
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      tmrw.setHours(10, 0, 0, 0);
      const formatted = new Date(tmrw.getTime() - tmrw.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setDateTime(formatted);
      setLocationOrLink('');
      setNotes('');
    }
    setError('');
  }, [event, isOpen, preselectedAppId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicationId) {
      setError('Please select an application');
      return;
    }
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!dateTime) {
      setError('Date and time is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      applicationId,
      eventType,
      title: title.trim(),
      dateTime: new Date(dateTime).toISOString(),
      locationOrLink: locationOrLink.trim(),
      notes: notes.trim(),
    };

    try {
      if (event) {
        await eventApi.updateEvent(event._id, payload);
        toast.success('Event updated successfully');
      } else {
        await eventApi.createEvent(payload);
        toast.success('Event scheduled successfully');
      }
      onSaved();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save event';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={event ? 'Edit Event / Reminder' : 'Add Interview or Reminder'}
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          {!preselectedAppId && (
            <div className="form-group">
              <label className="form-label">Related Application *</label>
              <select
                className="form-select"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                required
              >
                <option value="">Select an application...</option>
                {applications.map((app) => (
                  <option key={app._id} value={app._id}>
                    {app.company} — {app.jobTitle} ({app.status})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Event Type *</label>
              <select
                className="form-select"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
              >
                <option value="interview">Interview</option>
                <option value="assessment">Assessment / Test</option>
                <option value="deadline">Application Deadline</option>
                <option value="follow-up">Follow-up Reminder</option>
                <option value="reminder">Custom Reminder</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date & Time *</label>
              <input
                type="datetime-local"
                className="form-input"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Title / Stage *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Technical Round 1: React & System Design"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Meeting Link or Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. https://meet.google.com/xyz or Building 4, Floor 2"
              value={locationOrLink}
              onChange={(e) => setLocationOrLink(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Preparation Notes</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Key concepts to review, interviewers' names, questions to ask..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : event ? 'Update Event' : 'Schedule Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
