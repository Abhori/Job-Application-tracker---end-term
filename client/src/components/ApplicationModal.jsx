import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { applicationApi } from '../api/applicationApi.js';
import { useToast } from '../context/ToastContext.jsx';
import { AlertTriangle } from 'lucide-react';

const INITIAL_STATE = {
  company: '',
  jobTitle: '',
  location: 'Remote',
  workMode: 'remote',
  employmentType: 'full-time',
  status: 'SAVED',
  salary: '',
  jobUrl: '',
  dateApplied: '',
  deadline: '',
  resumeVersion: '',
  contactName: '',
  contactEmail: '',
  contactRole: '',
  contactPhone: '',
  notes: '',
  tagsInput: '',
};

export const ApplicationModal = ({ isOpen, onClose, application = null, onSaved }) => {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        jobTitle: application.jobTitle || '',
        location: application.location || 'Remote',
        workMode: application.workMode || 'remote',
        employmentType: application.employmentType || 'full-time',
        status: application.status || 'SAVED',
        salary: application.salary || '',
        jobUrl: application.jobUrl || '',
        dateApplied: application.dateApplied ? application.dateApplied.split('T')[0] : '',
        deadline: application.deadline ? application.deadline.split('T')[0] : '',
        resumeVersion: application.resumeVersion || '',
        contactName: application.contact?.name || '',
        contactEmail: application.contact?.email || '',
        contactRole: application.contact?.role || '',
        contactPhone: application.contact?.phone || '',
        notes: application.notes || '',
        tagsInput: application.tags?.join(', ') || '',
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
    setDuplicateWarning(null);
  }, [application, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    if (duplicateWarning) {
      setDuplicateWarning(null);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }
    if (formData.jobUrl && formData.jobUrl.trim()) {
      try {
        new URL(formData.jobUrl.trim());
      } catch (err) {
        newErrors.jobUrl = 'Please provide a valid URL (e.g. https://...)';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, forceDuplicate = false) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setDuplicateWarning(null);

    const payload = {
      company: formData.company.trim(),
      jobTitle: formData.jobTitle.trim(),
      location: formData.location.trim() || 'Remote',
      workMode: formData.workMode,
      employmentType: formData.employmentType,
      status: formData.status,
      salary: formData.salary.trim(),
      jobUrl: formData.jobUrl.trim(),
      dateApplied: formData.dateApplied ? new Date(formData.dateApplied).toISOString() : null,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
      resumeVersion: formData.resumeVersion.trim(),
      contact: {
        name: formData.contactName.trim(),
        email: formData.contactEmail.trim(),
        role: formData.contactRole.trim(),
        phone: formData.contactPhone.trim(),
      },
      notes: formData.notes.trim(),
      tags: formData.tagsInput
        ? formData.tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      forceDuplicate,
    };

    try {
      if (application) {
        await applicationApi.updateApplication(application._id, payload);
        toast.success('Application updated successfully');
      } else {
        await applicationApi.createApplication(payload);
        toast.success('Application tracked successfully');
      }
      onSaved();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.isDuplicate) {
        setDuplicateWarning(err.response.data);
      } else {
        const errorMsg =
          err.response?.data?.details?.[0]?.message ||
          err.response?.data?.error ||
          'Failed to save application';
        toast.error(errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={application ? 'Edit Application' : 'Track New Application'}
      maxWidth="720px"
    >
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Duplicate warning notification */}
          {duplicateWarning && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: '#92400e', fontSize: '0.875rem' }}>
                  Duplicate Opportunity Warning
                </strong>
                <p style={{ color: '#b45309', fontSize: '0.8125rem', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {duplicateWarning.message}
                </p>
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSubmit(null, true)}
                    disabled={submitting}
                  >
                    Proceed & Save Anyway
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDuplicateWarning(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                name="company"
                className="form-input"
                placeholder="e.g. Google, Microsoft, Stripe"
                value={formData.company}
                onChange={handleChange}
              />
              {errors.company && <div className="form-error">{errors.company}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Job Title / Role *</label>
              <input
                type="text"
                name="jobTitle"
                className="form-input"
                placeholder="e.g. Frontend Engineer Intern"
                value={formData.jobTitle}
                onChange={handleChange}
              />
              {errors.jobTitle && <div className="form-error">{errors.jobTitle}</div>}
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="SAVED">Saved</option>
                <option value="APPLIED">Applied</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="INTERVIEW">Interview</option>
                <option value="OFFER">Offer</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Work Mode</label>
              <select name="workMode" className="form-select" value={formData.workMode} onChange={handleChange}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                name="employmentType"
                className="form-select"
                value={formData.employmentType}
                onChange={handleChange}
              >
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. San Francisco, CA / Remote"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary / Stipend</label>
              <input
                type="text"
                name="salary"
                className="form-input"
                placeholder="e.g. $45/hr or $110,000/yr"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Date Applied</label>
              <input
                type="date"
                name="dateApplied"
                className="form-input"
                value={formData.dateApplied}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Job Posting URL</label>
              <input
                type="url"
                name="jobUrl"
                className="form-input"
                placeholder="https://careers.company.com/job/..."
                value={formData.jobUrl}
                onChange={handleChange}
              />
              {errors.jobUrl && <div className="form-error">{errors.jobUrl}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Resume Version Used</label>
              <input
                type="text"
                name="resumeVersion"
                className="form-input"
                placeholder="e.g. Resume_SWE_v3.pdf"
                value={formData.resumeVersion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Recruiter / Contact Name</label>
              <input
                type="text"
                name="contactName"
                className="form-input"
                placeholder="e.g. Sarah Miller"
                value={formData.contactName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recruiter Email</label>
              <input
                type="email"
                name="contactEmail"
                className="form-input"
                placeholder="sarah@company.com"
                value={formData.contactEmail}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Recruiter Role</label>
              <input
                type="text"
                name="contactRole"
                className="form-input"
                placeholder="Technical Recruiter"
                value={formData.contactRole}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              name="tagsInput"
              className="form-input"
              placeholder="e.g. High Priority, Referral, FAANG, YCombinator"
              value={formData.tagsInput}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Personal Notes & Research</label>
            <textarea
              name="notes"
              className="form-textarea"
              rows="3"
              placeholder="Notes on the hiring team, tech stack, referral details, or talking points..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : application ? 'Save Changes' : 'Track Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
