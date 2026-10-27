import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { applicationApi } from '../api/applicationApi.js';
import {
  User,
  Settings,
  Download,
  CheckCircle2,
  Bell,
  Kanban,
  Save,
} from 'lucide-react';

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [targetRolesInput, setTargetRolesInput] = useState(user?.targetRoles?.join(', ') || '');
  const [defaultView, setDefaultView] = useState(user?.preferences?.defaultView || 'kanban');
  const [inAppReminders, setInAppReminders] = useState(user?.preferences?.inAppReminders !== false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setTargetRolesInput(user.targetRoles?.join(', ') || '');
      setDefaultView(user.preferences?.defaultView || 'kanban');
      setInAppReminders(user.preferences?.inAppReminders !== false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setSaving(true);
    const targetRoles = targetRolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const res = await updateProfile({
      name: name.trim(),
      headline: headline.trim(),
      targetRoles,
      preferences: {
        defaultView,
        inAppReminders,
      },
    });

    if (res.success) {
      toast.success('Profile and preferences updated successfully');
    } else {
      toast.error(res.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await applicationApi.getApplications({ limit: 1000 });
      if (res.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `applytrack_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success(`Exported ${res.data.length} applications to JSON!`);
      }
    } catch (err) {
      toast.error('Failed to export applications data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Profile & Preferences" subtitle="Manage your account settings and personal workspace" />

      <div className="page-wrapper" style={{ maxWidth: '840px' }}>
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <User size={20} color="var(--primary)" />
              <span>Personal Workspace Profile</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Email Address</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
              <span className="form-hint">Email address cannot be changed directly</span>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science Student | Aspiring Backend Developer"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Roles (comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer Intern, Frontend Engineer, Data Engineer"
                value={targetRolesInput}
                onChange={(e) => setTargetRolesInput(e.target.value)}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Settings size={20} color="var(--primary)" />
              <span>Workspace Preferences</span>
            </h3>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Default Applications View</label>
                <select
                  className="form-select"
                  value={defaultView}
                  onChange={(e) => setDefaultView(e.target.value)}
                >
                  <option value="kanban">Kanban Pipeline Board</option>
                  <option value="list">Detailed Table View</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">In-App Notifications & Reminders</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="reminderCheck"
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    checked={inAppReminders}
                    onChange={(e) => setInAppReminders(e.target.checked)}
                  />
                  <label htmlFor="reminderCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                    Show in-app deadline and interview alerts
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

        {/* Data Backup & Portability */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Download size={20} color="var(--primary)" />
            <span>Data Ownership & Portability</span>
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            You maintain full ownership of your job search data. Export all your application records, notes, and status timelines into an offline JSON backup at any time.
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExportData}
            disabled={exporting}
          >
            <Download size={16} />
            <span>{exporting ? 'Generating Backup...' : 'Export Applications to JSON'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
