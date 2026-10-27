import React from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseBusiness,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Sparkles,
  CalendarDays,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Top Navigation */}
      <nav
        style={{
          height: '72px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          maxWidth: '1280px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <BriefcaseBusiness size={22} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            ApplyTrack
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-primary">
              <span>Go to Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: '5rem 1.5rem 4rem 1.5rem',
          maxWidth: '960px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={14} />
          <span>Built for College Students & Career Starters</span>
        </div>

        <h1
          style={{
            fontSize: '3.25rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'var(--text-main)',
            marginBottom: '1.5rem',
          }}
        >
          Track internship & job applications.{' '}
          <span style={{ color: 'var(--primary)' }}>Never miss an interview.</span>
        </h1>

        <p
          style={{
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
          }}
        >
          Organize your complete hiring pipeline from first discovery to final offer.
          Calculate genuine conversion metrics and compare your resume against real job descriptions
          using an explainable, deterministic skill matcher.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={isAuthenticated ? '/dashboard' : '/register'} className="btn btn-primary btn-lg">
            <span>{isAuthenticated ? 'Open My Pipeline' : 'Start Tracking For Free'}</span>
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In to Existing Account
          </Link>
        </div>
      </section>

      {/* Core Highlights */}
      <section style={{ backgroundColor: '#f8fafc', padding: '4.5rem 1.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Engineered with Integrity
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
              Every calculation reflects actual saved database records. No fabricated statistics or fake AI scores.
            </p>
          </div>

          <div className="grid-3">
            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#eef2ff',
                  color: 'var(--primary)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <BriefcaseBusiness size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Full Pipeline Lifecycle
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Switch effortlessly between a visual Kanban board and a filterable table. Track statuses from
                SAVED, APPLIED, ASSESSMENT, INTERVIEW to OFFER with automated duplicate checks.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ecfdf5',
                  color: 'var(--success)',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <BarChart3 size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Authentic Analytics
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Calculate genuine interview conversion rates, offer ratios, timeline velocity, and
                work mode preferences directly from your logged submissions without double-counting.
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={22} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Explainable Skill Gap Engine
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                A transparent, deterministic skill extractor and comparator covering 150+ technical skills.
                Identifies matched keywords, missing requirements, and targeted learning resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '2rem 1.5rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>ApplyTrack — Smart Internship & Job Application Tracker. Designed for college students and job seekers.</p>
      </footer>
    </div>
  );
};
