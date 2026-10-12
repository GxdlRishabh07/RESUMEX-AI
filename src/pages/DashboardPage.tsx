/**
 * DashboardPage — RESUMEX // AI
 * ChatGPT-inspired history dashboard with strict per-user isolation and guest mode gating.
 *
 * Rules:
 * 1. Guest Mode: When unauthenticated (!user), strictly NO history is shown.
 *    Renders the exact text: "Login to see your analysis history" with login CTA.
 * 2. Strict User Isolation: User 1 sees ONLY analyses created by User 1.
 *    User 2 sees ONLY analyses created by User 2.
 * 3. Database Visibility: Syncs user_email so project owner can see user emails in Supabase.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ResumeAnalysis } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { fetchAllAnalyses, removeAnalysis, saveAnalysis } from '../services/historyService';
import { SAMPLE_DATASETS } from '../data/samples';
import { ResumeDocumentView } from '../components/ResumeDocumentView';
import { normalizeResumeMarkdown } from '../utils/resumeFormatter';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRelativeDate = (iso: string): string => {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFullDate = (iso: string): string =>
  new Date(iso).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

const groupByDate = (analyses: ResumeAnalysis[]) => {
  const groups: { label: string; items: ResumeAnalysis[] }[] = [];
  const today = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const week = new Date(today); week.setDate(week.getDate() - 7);
  const month = new Date(today); month.setDate(month.getDate() - 30);

  const todayItems = analyses.filter(a => new Date(a.created_at) >= today);
  const yesterdayItems = analyses.filter(a => { const d = new Date(a.created_at); return d >= yesterday && d < today; });
  const weekItems = analyses.filter(a => { const d = new Date(a.created_at); return d >= week && d < yesterday; });
  const monthItems = analyses.filter(a => { const d = new Date(a.created_at); return d >= month && d < week; });
  const olderItems = analyses.filter(a => new Date(a.created_at) < month);

  if (todayItems.length) groups.push({ label: 'Today', items: todayItems });
  if (yesterdayItems.length) groups.push({ label: 'Yesterday', items: yesterdayItems });
  if (weekItems.length) groups.push({ label: 'Previous 7 days', items: weekItems });
  if (monthItems.length) groups.push({ label: 'This month', items: monthItems });
  if (olderItems.length) groups.push({ label: 'Older', items: olderItems });
  return groups;
};

const ScoreBadge: React.FC<{ score: number | null; small?: boolean }> = ({ score, small }) => {
  if (score === null) return null;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#eab308' : '#ef4444';
  const bg = score >= 80 ? 'rgba(16,185,129,0.12)' : score >= 60 ? 'rgba(234,179,8,0.12)' : 'rgba(239,68,68,0.12)';
  return (
    <span style={{ padding: small ? '2px 6px' : '3px 8px', borderRadius: '6px', fontSize: small ? '11px' : '12px', fontWeight: 700, color, background: bg, whiteSpace: 'nowrap' }}>
      {score}
    </span>
  );
};

// ─── Sidebar History Item ─────────────────────────────────────────────────────

const HistoryItem: React.FC<{
  analysis: ResumeAnalysis;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}> = ({ analysis, isSelected, onSelect, onDelete }) => {
  const [showDelete, setShowDelete] = useState(false);

  const name = analysis.resume_name || `Analysis #${analysis.id.slice(-4).toUpperCase()}`;
  const score = analysis.analysis_type === 'full' ? analysis.optimized_score : analysis.initial_score;

  return (
    <div
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
        background: isSelected ? 'var(--color-surface-high)' : 'transparent',
        border: `1px solid ${isSelected ? 'var(--border-ghost-hover)' : 'transparent'}`,
        transition: 'all 150ms ease', userSelect: 'none',
      }}
      onClick={onSelect}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-text-subtle)', flexShrink: 0 }}>
        {analysis.analysis_type === 'full' ? 'auto_awesome' : 'analytics'}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {score !== null && <ScoreBadge score={score} small />}
          <span>{formatRelativeDate(analysis.created_at)}</span>
        </div>
      </div>
      {showDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          title="Delete analysis"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: '2px', display: 'flex', borderRadius: '4px', flexShrink: 0 }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-error)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
        </button>
      )}
    </div>
  );
};

// ─── Skeletons ───────────────────────────────────────────────────────────────

const SkeletonRow: React.FC = () => (
  <div style={{ padding: '8px 10px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: 'var(--color-surface-high)', animation: 'shimmer 1.5s infinite' }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: '12px', borderRadius: '4px', background: 'var(--color-surface-high)', marginBottom: '4px', width: '80%' }} />
      <div style={{ height: '10px', borderRadius: '4px', background: 'var(--color-surface)', width: '50%' }} />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────

export const DashboardPage: React.FC = () => {
  const { user, signOut, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<ResumeAnalysis | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'resume'>('overview');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<{ synced: boolean; error: string | null }>({ synced: false, error: null });
  const [requiresEmailMigration, setRequiresEmailMigration] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    if (!user) {
      setAnalyses([]);
      setSelected(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await fetchAllAnalyses(user);
    setAnalyses(res.analyses);
    setCloudStatus({ synced: res.isCloudSynced, error: res.cloudError || null });
    setRequiresEmailMigration(!!res.requiresEmailMigration);

    if (res.analyses.length > 0) {
      setSelected(prev => (prev ? res.analyses.find(a => a.id === prev.id) || res.analyses[0] : res.analyses[0]));
    } else {
      setSelected(null);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAnalyses();
    const handleHistoryChanged = () => { fetchAnalyses(); };
    window.addEventListener('resumex:history_changed', handleHistoryChanged);
    return () => window.removeEventListener('resumex:history_changed', handleHistoryChanged);
  }, [fetchAnalyses]);

  const handleDelete = async (id: string) => {
    await removeAnalysis(id, user);
    setAnalyses(prev => prev.filter(a => a.id !== id));
    if (selected?.id === id) setSelected(null);
    setDeleteConfirm(null);
  };

  const handleOpenInOptimizer = (analysis: ResumeAnalysis) => {
    navigate('/', { state: { analysis } });
  };

  const handleLoadDemoAnalysis = async () => {
    if (!user) return;
    setIsLoading(true);
    const sample = SAMPLE_DATASETS[0];
    await saveAnalysis({
      type: 'full',
      resumeText: sample.resume,
      jobDescription: sample.jobDescription,
      experienceLevel: 'Mid-Level',
      scoreData: {
        success: true,
        initialScore: 68,
        matchedKeywords: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'RESTful APIs'],
        missingKeywords: ['Kubernetes', 'CI/CD Pipelines', 'Distributed Systems', 'System Design'],
        criticalGaps: ['Missing production Kubernetes orchestration experience', 'Needs measurable latency reduction metrics'],
        formattingIssues: ['Add clearer section dividers for technical proficiencies'],
        recommendations: ['Quantify project impact with percentages and dollar values', 'Add Kubernetes certification or hands-on cluster projects'],
        summary: 'Solid full-stack engineering profile with strong core web foundation, but missing cloud orchestration keywords needed for senior roles.',
      },
      optimizeData: {
        success: true,
        initialScore: 68,
        optimizedScore: 92,
        matchScore: 92,
        scoreBoost: 24,
        keyKeywordsMatched: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'CI/CD Pipelines', 'System Design', 'Microservices'],
        missingKeywordsAdded: ['Kubernetes', 'CI/CD Pipelines', 'System Design'],
        improvementsSummary: [
          'Rewrote experience bullet points into high-impact STAR framework with quantified metrics',
          'Integrated missing high-demand keywords: Kubernetes, CI/CD, and distributed caching',
          'Enhanced technical competencies section for ATS keyword density and scanner compatibility',
        ],
        atsFormattingTips: [
          'Single-column layout with clean standard markdown heading hierarchy',
          'Standard chronological date formatting (MM/YYYY - MM/YYYY)',
          'High machine-parseability with no text columns, tables, or complex glyphs',
        ],
        optimizedResume: sample.resume + '\n\n### Key Additions\n- Led migration to Kubernetes clusters, improving deployment frequency by 40%.\n- Designed distributed CI/CD pipeline reducing build times by 35%.',
      },
    }, user);
    await fetchAnalyses();
  };

  const groups = groupByDate(analyses);
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-canvas)', fontFamily: 'var(--font-sans)', overflow: 'hidden' }}>
      {/* Top bar */}
      <header style={{ height: '52px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderBottom: '1px solid var(--border-ghost)', backgroundColor: 'rgba(9,13,22,0.9)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex', borderRadius: '6px' }}
            title="Toggle sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', color: 'var(--color-on-surface)', letterSpacing: '-0.01em' }}>
              RESUMEX <span style={{ color: 'var(--color-tertiary)' }}>//</span> AI
            </span>
          </Link>
          <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(0,120,140,0.25)', color: 'var(--color-tertiary)', borderRadius: '99px' }}>
            History Vault
          </span>
          {!user && (
            <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em', background: 'rgba(234,179,8,0.15)', color: '#eab308', borderRadius: '99px', border: '1px solid rgba(234,179,8,0.3)' }}>
              Guest Mode
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add_circle</span>
            New Analysis
          </Link>
          <div style={{ width: '1px', height: '20px', background: 'var(--border-ghost)' }} />

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {initials}
              </div>
              <div className="hidden sm:flex" style={{ flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-on-surface)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.email}
                </span>
              </div>
              <button
                id="btn-logout"
                onClick={signOut}
                title="Sign out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: '6px', display: 'flex', borderRadius: '6px', transition: 'color 150ms ease' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-error)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                to="/login"
                id="btn-nav-login"
                className="btn btn-secondary btn-sm"
                style={{ textDecoration: 'none', fontSize: '12px', padding: '6px 14px' }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                id="btn-nav-signup"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none', fontSize: '12px', padding: '6px 14px' }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? '260px' : '0',
          flexShrink: 0,
          transition: 'width 250ms cubic-bezier(0.4,0,0.2,1)',
          overflow: 'hidden',
          borderRight: '1px solid var(--border-ghost)',
          backgroundColor: 'var(--color-surface-low)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ width: '260px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* New analysis CTA */}
            <div style={{ padding: '12px' }}>
              <Link
                to="/"
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 12px', borderRadius: '8px',
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
                  color: 'var(--color-primary-dim)', fontSize: '13px', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.18)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.1)'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                New Analysis
              </Link>
            </div>

            <div style={{ height: '1px', background: 'var(--border-ghost)', margin: '0 12px' }} />

            {/* History list or Guest lock state in Sidebar */}
            <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
              {!user ? (
                /* GUEST SIDEBAR: Strict gating */
                <div id="sidebar-guest-lock" style={{ padding: '24px 12px', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#eab308' }}>lock</span>
                  </div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: '4px' }}>
                    History Locked
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-subtle)', lineHeight: '1.4', marginBottom: '14px' }}>
                    Login to see your analysis history
                  </p>
                  <Link
                    to="/login"
                    id="btn-sidebar-login"
                    className="btn btn-primary btn-sm"
                    style={{ textDecoration: 'none', width: '100%', justifyContent: 'center', fontSize: '12px' }}
                  >
                    Sign In
                  </Link>
                </div>
              ) : isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '8px' }}>
                  {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                </div>
              ) : analyses.length === 0 ? (
                <div style={{ padding: '32px 12px', textAlign: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-text-subtle)', display: 'block', marginBottom: '8px' }}>history</span>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)', lineHeight: '1.5' }}>
                    No analyses saved yet. Analyze a resume to see it here!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {groups.map(group => (
                    <div key={group.label}>
                      <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-subtle)', padding: '10px 10px 4px', margin: 0 }}>
                        {group.label}
                      </p>
                      {group.items.map(analysis => (
                        <HistoryItem
                          key={analysis.id}
                          analysis={analysis}
                          isSelected={selected?.id === analysis.id}
                          onSelect={() => { setSelected(analysis); setActiveTab('overview'); }}
                          onDelete={() => setDeleteConfirm(analysis.id)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar Footer */}
            {user && (
              <div style={{ borderTop: '1px solid var(--border-ghost)', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-subtle)', padding: '0 4px' }}>
                  <span>{analyses.length} total {analyses.length === 1 ? 'analysis' : 'analyses'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: cloudStatus.synced ? '#10b981' : 'var(--color-tertiary)' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cloudStatus.synced ? '#10b981' : 'var(--color-tertiary)' }} />
                    {cloudStatus.synced ? 'Cloud Synced' : 'Local Storage'}
                  </span>
                </div>
                {requiresEmailMigration && (
                  <button
                    onClick={() => setShowSqlModal(true)}
                    style={{
                      background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.25)',
                      borderRadius: '6px', padding: '6px 8px', fontSize: '11px', color: '#eab308',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mail</span>
                    Supabase: Sync User Gmail
                  </button>
                )}
                {!cloudStatus.synced && !requiresEmailMigration && (
                  <button
                    onClick={() => setShowSqlModal(true)}
                    style={{
                      background: 'rgba(0,120,140,0.12)', border: '1px solid rgba(0,120,140,0.25)',
                      borderRadius: '6px', padding: '6px 8px', fontSize: '11px', color: 'var(--color-tertiary)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>database</span>
                    Enable Supabase Cloud Sync
                  </button>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main style={{ flex: 1, overflow: 'auto', backgroundColor: 'var(--color-canvas)' }}>
          {!user ? (
            /* ══════════════════════════════════════════════════════════════════
               GUEST MODE SCREEN: STRICT ACCESS CONTROL
               Exact requirement: Show "Login to see your analysis history"
               ══════════════════════════════════════════════════════════════════ */
            <div id="guest-history-gate" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100%', padding: '40px 20px' }}>
              <div style={{
                maxWidth: '540px', width: '100%', textAlign: 'center',
                background: 'var(--color-surface)',
                border: '1px solid var(--border-ghost)',
                borderRadius: '20px',
                padding: '48px 36px',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Background glow decoration */}
                <div style={{
                  position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
                  width: '260px', height: '160px',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.25) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                {/* Lock Shield Icon */}
                <div style={{
                  width: '72px', height: '72px', borderRadius: '22px',
                  background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(56,189,248,0.15))',
                  border: '1px solid rgba(56,189,248,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 8px 32px rgba(37,99,235,0.2)',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '36px', color: 'var(--color-secondary)' }}>
                    lock_person
                  </span>
                </div>

                {/* Badge */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    padding: '3px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', background: 'rgba(37,99,235,0.15)',
                    color: 'var(--color-secondary)', borderRadius: '99px',
                    border: '1px solid rgba(37,99,235,0.3)',
                  }}>
                    User History Vault
                  </span>
                </div>

                {/* Exact Text Required by User */}
                <h1 id="guest-gate-title" style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '26px',
                  color: 'var(--color-on-surface)',
                  letterSpacing: '-0.02em',
                  marginBottom: '12px',
                  lineHeight: '1.3',
                }}>
                  Login to see your analysis history
                </h1>

                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: '1.6',
                  marginBottom: '28px',
                  maxWidth: '440px',
                  margin: '0 auto 28px',
                }}>
                  Your resume optimizations, ATS scores, and keyword match breakdowns are strictly isolated to your account. Sign in to view and manage your analyses.
                </p>

                {/* CTA Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
                  <Link
                    to="/login"
                    id="btn-gate-login"
                    className="btn btn-primary btn-lg"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>login</span>
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    id="btn-gate-signup"
                    className="btn btn-secondary btn-lg"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                    Create Account
                  </Link>
                </div>

                {/* Security and Isolation Highlights */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '12px', textAlign: 'left',
                  borderTop: '1px solid var(--border-ghost)', paddingTop: '24px',
                }}>
                  <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: '10px', border: '1px solid var(--border-ghost)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>verified_user</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface)' }}>Private to You</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-subtle)', margin: 0, lineHeight: 1.4 }}>
                      Only you can see your analyses.
                    </p>
                  </div>

                  <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: '10px', border: '1px solid var(--border-ghost)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10b981' }}>cloud_sync</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface)' }}>Supabase Cloud</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-subtle)', margin: 0, lineHeight: 1.4 }}>
                      Synced safely to your Gmail account.
                    </p>
                  </div>

                  <div style={{ padding: '10px 12px', background: 'var(--color-surface-container)', borderRadius: '10px', border: '1px solid var(--border-ghost)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-tertiary)' }}>compare_arrows</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-on-surface)' }}>ATS Tracking</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-subtle)', margin: 0, lineHeight: 1.4 }}>
                      Compare scores across revisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : !selected ? (
            /* Logged-in user with no selected analysis (Empty state) */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '16px', padding: '40px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--color-surface)', border: '1px solid var(--border-ghost)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--color-text-subtle)' }}>
                  {isLoading ? 'hourglass_empty' : analyses.length === 0 ? 'rocket_launch' : 'history'}
                </span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '20px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                  {isLoading ? 'Loading your history…' : analyses.length === 0 ? 'No analyses saved yet' : 'Select an analysis'}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '400px', lineHeight: '1.6' }}>
                  {isLoading
                    ? 'Fetching your previous analyses.'
                    : analyses.length === 0
                    ? `Welcome, ${displayName}! Upload your first resume to calculate an ATS score and see it recorded in your private history.`
                    : 'Click any item in the sidebar to view the full analysis.'}
                </p>
                {!isLoading && analyses.length === 0 && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                    <Link to="/" className="btn btn-primary btn-md" style={{ textDecoration: 'none', display: 'inline-flex' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                      Start Analyzing
                    </Link>
                    <button
                      onClick={handleLoadDemoAnalysis}
                      className="btn btn-secondary btn-md"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>science</span>
                      Load Sample into My Account
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Logged-in user with active analysis selected */
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>
              {/* Header */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '22px', color: 'var(--color-text-primary)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                      {selected.resume_name || `Analysis #${selected.id.slice(-4).toUpperCase()}`}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>
                        {formatFullDate(selected.created_at)}
                      </span>
                      {selected.experience_level && (
                        <span className="chip chip-neutral">{selected.experience_level}</span>
                      )}
                      <span className={`chip ${selected.analysis_type === 'full' ? 'chip-secondary' : 'chip-primary'}`}>
                        {selected.analysis_type === 'full' ? 'Full Optimization' : 'Score Audit'}
                      </span>
                      <button
                        onClick={() => handleOpenInOptimizer(selected)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', fontSize: '12px' }}
                        title="Load this resume and JD into Optimizer Studio"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>open_in_new</span>
                        Open in Optimizer Studio
                      </button>
                    </div>
                  </div>

                  {/* Score Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {selected.initial_score !== null && (
                      <div style={{ textAlign: 'center', padding: '8px 14px', borderRadius: '10px', background: 'var(--color-surface)', border: '1px solid var(--border-ghost)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', marginBottom: '2px' }}>Initial ATS</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: selected.initial_score >= 80 ? '#10b981' : selected.initial_score >= 60 ? '#eab308' : '#ef4444' }}>
                          {selected.initial_score}
                        </div>
                      </div>
                    )}
                    {selected.optimized_score !== null && (
                      <div style={{ textAlign: 'center', padding: '8px 14px', borderRadius: '10px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-secondary)', marginBottom: '2px' }}>Optimized</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-secondary)' }}>
                          {selected.optimized_score}
                        </div>
                      </div>
                    )}
                    {selected.score_boost !== null && selected.score_boost > 0 && (
                      <div style={{ textAlign: 'center', padding: '8px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                        <div style={{ fontSize: '11px', color: '#10b981', marginBottom: '2px' }}>Boost</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
                          +{selected.score_boost}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-ghost)', marginTop: '20px' }}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    style={{
                      padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600,
                      color: activeTab === 'overview' ? 'var(--color-primary-dim)' : 'var(--color-text-subtle)',
                      borderBottom: `2px solid ${activeTab === 'overview' ? 'var(--color-primary)' : 'transparent'}`,
                      marginBottom: '-1px', transition: 'all 150ms ease',
                    }}
                  >
                    Overview & Insights
                  </button>
                  <button
                    onClick={() => setActiveTab('resume')}
                    style={{
                      padding: '8px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600,
                      color: activeTab === 'resume' ? 'var(--color-primary-dim)' : 'var(--color-text-subtle)',
                      borderBottom: `2px solid ${activeTab === 'resume' ? 'var(--color-primary)' : 'transparent'}`,
                      marginBottom: '-1px', transition: 'all 150ms ease',
                    }}
                  >
                    Resume & Job Description
                  </button>
                </div>
              </div>

              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Summary */}
                  {selected.summary && (
                    <div className="card-glass" style={{ padding: '18px 20px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-tertiary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>summarize</span>
                        Executive ATS Summary
                      </h4>
                      <p style={{ fontSize: '14px', color: 'var(--color-on-surface)', lineHeight: '1.6', margin: 0 }}>
                        {selected.summary}
                      </p>
                    </div>
                  )}

                  {/* Keywords Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Matched Keywords */}
                    <div className="card-glass" style={{ padding: '16px 18px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#10b981', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                        Matched Keywords ({selected.matched_keywords?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selected.matched_keywords && selected.matched_keywords.length > 0 ? (
                          selected.matched_keywords.map(kw => (
                            <span key={kw} style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>None detected</span>
                        )}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="card-glass" style={{ padding: '16px 18px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f59e0b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                        Missing High-Impact Keywords ({selected.missing_keywords?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selected.missing_keywords && selected.missing_keywords.length > 0 ? (
                          selected.missing_keywords.map(kw => (
                            <span key={kw} style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '13px', color: '#10b981' }}>✓ All target keywords matched!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {selected.recommendations && selected.recommendations.length > 0 && (
                    <div className="card-glass" style={{ padding: '18px 20px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-primary-dim)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lightbulb</span>
                        Optimization Recommendations
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selected.recommendations.map((rec, i) => (
                          <li key={i} style={{ fontSize: '13px', color: 'var(--color-on-surface)', lineHeight: '1.5' }}>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Critical Gaps & Formatting Issues */}
                  {((selected.critical_gaps && selected.critical_gaps.length > 0) || (selected.formatting_issues && selected.formatting_issues.length > 0)) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {selected.critical_gaps && selected.critical_gaps.length > 0 && (
                        <div className="card-glass" style={{ padding: '16px 18px' }}>
                          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-error)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
                            Critical Gaps
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {selected.critical_gaps.map((gap, i) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--color-on-surface)', lineHeight: '1.4' }}>{gap}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selected.formatting_issues && selected.formatting_issues.length > 0 && (
                        <div className="card-glass" style={{ padding: '16px 18px' }}>
                          <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#eab308', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>format_align_left</span>
                            Formatting Issues
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {selected.formatting_issues.map((issue, i) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--color-on-surface)', lineHeight: '1.4' }}>{issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Optimized Resume Preview (if full optimization) */}
                  {selected.optimized_resume && (
                    <div style={{ marginTop: '12px' }}>
                      <ResumeDocumentView
                        markdown={selected.optimized_resume}
                        defaultTheme="paper"
                        showControls={true}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Resume & Job Description */}
              {activeTab === 'resume' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* Original Resume */}
                  <div className="card-glass" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>description</span>
                      Original Resume Input
                    </h4>
                    <pre style={{ flex: 1, margin: 0, padding: '12px', background: 'var(--color-canvas)', borderRadius: '8px', border: '1px solid var(--border-ghost)', fontSize: '12px', fontFamily: 'var(--font-mono)', overflow: 'auto', maxHeight: '450px', whiteSpace: 'pre-wrap', color: 'var(--color-on-surface-variant)', lineHeight: '1.5' }}>
                      {selected.resume_text}
                    </pre>
                  </div>

                  {/* Target Job Description */}
                  <div className="card-glass" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>work</span>
                      Target Job Description
                    </h4>
                    <pre style={{ flex: 1, margin: 0, padding: '12px', background: 'var(--color-canvas)', borderRadius: '8px', border: '1px solid var(--border-ghost)', fontSize: '12px', fontFamily: 'var(--font-mono)', overflow: 'auto', maxHeight: '450px', whiteSpace: 'pre-wrap', color: 'var(--color-on-surface-variant)', lineHeight: '1.5' }}>
                      {selected.job_description}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card-glass" style={{ maxWidth: '400px', width: '100%', padding: '24px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--border-ghost)' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Delete Analysis?
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
              This will permanently delete this analysis from your personal history and cloud storage. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-secondary btn-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn btn-danger btn-sm">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* SQL Migration Modal for Admin / Supabase */}
      {showSqlModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          <div className="card-glass" style={{ maxWidth: '580px', width: '100%', padding: '28px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--border-ghost)', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-tertiary)' }}>database</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Supabase Database Sync — Admin Notice
                </h3>
              </div>
              <button onClick={() => setShowSqlModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-subtle)', padding: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
              To ensure all analyses show the user's Gmail/email directly in the Supabase Table Editor, run this 1-line SQL migration in your Supabase Dashboard:
            </p>

            <div style={{ background: 'var(--color-canvas)', borderRadius: '8px', border: '1px solid var(--border-ghost)', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid var(--border-ghost)', background: 'var(--color-surface-container)' }}>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}>
                  Supabase Dashboard → SQL Editor
                </span>
                <button
                  onClick={() => {
                    const sql = `ALTER TABLE public.resume_analyses ADD COLUMN IF NOT EXISTS user_email TEXT;\nCOMMENT ON COLUMN public.resume_analyses.user_email IS 'Email / Gmail of the user who performed the analysis';`;
                    navigator.clipboard.writeText(sql);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '3px 10px', fontSize: '11px', gap: '4px' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                    {copiedSql ? 'check' : 'content_copy'}
                  </span>
                  {copiedSql ? 'Copied!' : 'Copy SQL'}
                </button>
              </div>
              <pre style={{ margin: 0, padding: '12px', fontSize: '12px', fontFamily: 'var(--font-mono)', overflow: 'auto', color: 'var(--color-tertiary)', lineHeight: '1.5' }}>
{`-- Add user_email so you see user emails in Supabase Table Editor:
ALTER TABLE public.resume_analyses
  ADD COLUMN IF NOT EXISTS user_email TEXT;`}
              </pre>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowSqlModal(false)} className="btn btn-primary btn-sm">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @media (max-width: 640px) { aside { display: none; } }
      `}</style>
    </div>
  );
};
