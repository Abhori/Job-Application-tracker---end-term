import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { LoadingSpinner } from '../components/LoadingSpinner.jsx';
import { skillApi } from '../api/skillApi.js';
import { useToast } from '../context/ToastContext.jsx';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Upload,
  Info,
  Lightbulb,
  FileText,
  RotateCcw,
} from 'lucide-react';

const SAMPLE_JD = `Job Title: Full Stack Software Engineer (Intern / Early Career)
Company: NextGen Cloud Solutions
Location: San Francisco, CA (Hybrid)

Responsibilities:
- Build responsive, accessible user interfaces using React, JavaScript (ES6+), and Tailwind CSS.
- Develop robust, scalable REST APIs using Node.js, Express, and PostgreSQL.
- Write automated tests using Jest and maintain high code quality with Git workflows.
- Experience with Docker, Kubernetes, and AWS cloud deployment is strongly desired.
- Strong foundational knowledge in Data Structures & Algorithms and System Design.`;

const SAMPLE_RESUME = `Ameey Raj
Email: ameey@example.com | Portfolio: https://github.com/ameeyraj

SUMMARY
Enthusiastic Computer Science student passionate about full-stack web development and distributed systems.

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, C++, HTML, CSS, SQL
- Frameworks & Libraries: React, Node.js, Express, Redux
- Databases: MongoDB, PostgreSQL
- Tools: Git, GitHub, Linux, Docker

PROJECTS
1. E-Commerce Platform
- Built scalable frontend using React, Tailwind CSS, and Redux Toolkit.
- Developed backend REST APIs with Express and Node.js.
- Deployed Docker containers onto AWS EC2 with continuous integration.`;

export const SkillAnalyzer = () => {
  const location = useLocation();
  const [jobDescription, setJobDescription] = useState(location.state?.prefillJd || '');
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleLoadSample = () => {
    setJobDescription(SAMPLE_JD);
    setResumeText(SAMPLE_RESUME);
    setResult(null);
    toast.info('Sample Job Description & Resume loaded.');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size exceeds 2MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setResumeText(text);
        toast.success(`Loaded "${file.name}" successfully!`);
      }
    };
    reader.onerror = () => {
      toast.error('Could not read the uploaded text file.');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim() || !resumeText.trim()) {
      toast.warning('Please provide both the Job Description and your Resume text.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await skillApi.compareJobAndResume(jobDescription, resumeText);
      if (res.success) {
        setResult(res.data);
        toast.success('Skill gap analysis completed!');
      }
    } catch (err) {
      toast.error('Failed to analyze skills. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setJobDescription('');
    setResumeText('');
    setResult(null);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Navbar title="Resume-to-Job Skill Gap Analyzer" subtitle="Deterministic keyword matching & personalized learning roadmaps" />

      <div className="page-wrapper">
        {/* Header Intro */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="page-title">Explainable Skill Matcher</h2>
            <p className="page-subtitle">
              Transparent, deterministic keyword extraction against an editable dictionary of 150+ technical skills.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={handleLoadSample}>
              <Lightbulb size={16} />
              <span>Load Sample Inputs</span>
            </button>
            <button className="btn btn-ghost" onClick={handleReset} title="Clear inputs">
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Input Form Section */}
        <form onSubmit={handleAnalyze} style={{ marginBottom: '2rem' }}>
          <div className="grid-2" style={{ marginBottom: '1.25rem' }}>
            {/* Job Description Area */}
            <div className="card">
              <div className="card-header">
                <label className="card-title" htmlFor="jdInput">
                  Job Description Text *
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Paste full job posting or requirements
                </span>
              </div>
              <textarea
                id="jdInput"
                className="form-textarea"
                rows="11"
                placeholder="Paste the target job description, responsibilities, and required qualifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                required
              />
            </div>

            {/* Resume Text Area */}
            <div className="card">
              <div className="card-header">
                <label className="card-title" htmlFor="resumeInput">
                  Resume Text or Upload *
                </label>
                <label
                  className="btn btn-ghost btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.5rem' }}
                >
                  <Upload size={14} />
                  <span>Upload .txt / .md</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              <textarea
                id="resumeInput"
                className="form-textarea"
                rows="11"
                placeholder="Paste your raw resume text (Skills, Experience, Projects sections)..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={analyzing}
              style={{ minWidth: '240px' }}
            >
              <Sparkles size={18} />
              <span>{analyzing ? 'Analyzing Keywords...' : 'Run Skill Gap Analysis'}</span>
            </button>
          </div>
        </form>

        {/* Analysis Results View */}
        {analyzing && <LoadingSpinner text="Extracting and normalizing technical skills..." />}

        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Score Banner */}
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div
                    style={{
                      width: '88px',
                      height: '88px',
                      borderRadius: '50%',
                      backgroundColor:
                        result.matchPercentage >= 75
                          ? '#ecfdf5'
                          : result.matchPercentage >= 50
                          ? '#fffbeb'
                          : '#eff6ff',
                      color:
                        result.matchPercentage >= 75
                          ? '#065f46'
                          : result.matchPercentage >= 50
                          ? '#92400e'
                          : 'var(--primary)',
                      border: `3px solid ${
                        result.matchPercentage >= 75
                          ? '#10b981'
                          : result.matchPercentage >= 50
                          ? '#f59e0b'
                          : 'var(--primary)'
                      }`,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {result.matchPercentage}%
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      Match Score: {result.matchedCount} of {result.totalJdSkillsDetected} Detected Skills
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {result.matchPercentage >= 80
                        ? 'Strong alignment! Your resume clearly reflects most of the technical skills requested.'
                        : result.matchPercentage >= 50
                        ? 'Solid baseline. Consider highlighting experience with missing core skills if you possess them.'
                        : 'Identified key skill gaps. Review the study recommendations below to target your prep.'}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', backgroundColor: '#ecfdf5', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>{result.matchedCount}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#065f46' }}>Matched</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', backgroundColor: '#fffbeb', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e' }}>{result.missingCount}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#92400e' }}>Missing in Resume</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-sm)', border: '1px solid #bfdbfe' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e40af' }}>{result.additionalResumeSkills.length}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af' }}>Extra Candidate Skills</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Categorized Skills Breakdown */}
            <div className="grid-2">
              {/* Matched Skills */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46' }}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <span>Matched Skills ({result.matchedCount})</span>
                  </h3>
                </div>

                {result.matchedSkills.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    No direct skill matches found between the JD and your resume text.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {result.matchedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#ecfdf5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <CheckCircle2 size={14} color="#10b981" />
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills in Resume */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#92400e' }}>
                    <AlertTriangle size={20} color="#f59e0b" />
                    <span>Skills in JD Not Detected in Resume ({result.missingCount})</span>
                  </h3>
                </div>

                {result.missingSkills.length === 0 ? (
                  <p style={{ fontSize: '0.875rem', color: '#065f46', fontWeight: 500 }}>
                    Great job! All skills detected in this job description were found in your resume text.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {result.missingSkills.map((s, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          padding: '0.375rem 0.75rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: '#fffbeb',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        {s.name}
                        <span style={{ fontSize: '0.6875rem', opacity: 0.8, textTransform: 'uppercase' }}>
                          ({s.priorityLevel})
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Learning Roadmap for Missing Skills */}
            {result.missingSkills.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={20} color="var(--primary)" />
                    <span>Suggested Learning & Interview Prep Priorities</span>
                  </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {result.missingSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.375rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                            {skill.name}
                          </strong>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.125rem 0.5rem',
                              borderRadius: 'var(--radius-full)',
                              backgroundColor: '#f1f5f9',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {skill.category}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color:
                              skill.priorityLevel === 'High'
                                ? '#dc2626'
                                : skill.priorityLevel === 'Medium'
                                ? '#b45309'
                                : 'var(--text-muted)',
                          }}
                        >
                          {skill.priorityLevel} Priority
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        <strong>Interview Focus:</strong> {skill.learningTip}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer Callout */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
              }}
            >
              <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Important Integrity & Privacy Note
                </strong>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {result.disclaimer}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
