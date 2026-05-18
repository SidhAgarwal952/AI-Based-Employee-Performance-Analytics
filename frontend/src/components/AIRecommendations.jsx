import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, TrendingUp, BookOpen, UserCheck, AlertOctagon, HelpCircle, Loader2 } from 'lucide-react';

const AIRecommendations = ({ employees, selectedEmployeeId, clearSelectedEmployee }) => {
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Auto-fetch when employee list loads or a specific employee is targeted
  useEffect(() => {
    fetchRecommendations();
  }, [selectedEmployeeId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');

    try {
      const body = {};
      if (selectedEmployeeId) {
        body.employeeId = selectedEmployeeId;
      } else if (filterDept && filterDept !== '') {
        body.department = filterDept;
      }

      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to retrieve AI analysis.');
      }

      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching AI analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTierClass = (tier) => {
    if (tier === 'Star Performer') return 'score-high';
    if (tier === 'Strong Performer') return 'score-medium';
    return 'score-low';
  };

  const promotions = analytics?.recommendations?.filter(r => r.type === 'promotion') || [];
  const training = analytics?.recommendations?.filter(r => r.type === 'training') || [];
  const feedback = analytics?.recommendations?.filter(r => r.type === 'feedback') || [];

  return (
    <div style={styles.container}>
      {/* Configuration Header Card */}
      <div className="glass-card" style={styles.configHeader}>
        <div style={styles.headerTitleRow}>
          <div style={styles.iconCircle}>
            <BrainCircuit size={20} color="var(--secondary)" />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: '700', fontSize: '1.25rem' }}>
              AI Recruiter & Performance Analytics
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Powered by OpenRouter Gemini LLM reasoning models.
            </p>
          </div>
        </div>

        <div style={styles.controlsRow}>
          {selectedEmployeeId ? (
            <div style={styles.focusIndicator}>
              <span style={styles.focusText}>
                Focus: <strong>Single Employee</strong>
              </span>
              <button onClick={clearSelectedEmployee} style={styles.clearBtn}>
                Evaluate Full Cohort
              </button>
            </div>
          ) : (
            <div style={styles.deptSelectorGroup}>
              <label htmlFor="ai-dept-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cohort Scope:</label>
              <select
                id="ai-dept-select"
                className="form-input"
                style={styles.selectSmall}
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="">All Company Employees</option>
                <option value="Development">Development</option>
                <option value="Research & AI">Research & AI</option>
                <option value="Design">Design</option>
                <option value="Operations">Operations</option>
                <option value="Product Management">Product Management</option>
              </select>
              <button onClick={fetchRecommendations} className="btn btn-accent" style={styles.triggerBtn}>
                Re-Analyze Cohort
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="glass-card ai-loading-pulse" style={styles.loadingContainer}>
          <Loader2 size={36} color="var(--secondary)" style={styles.spin} />
          <h4 style={{ fontFamily: 'Outfit', color: 'var(--text-primary)', marginTop: '1rem' }}>
            Harnessing AI Cognitive Core...
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Analyzing performance matrices, skillsets, and computing corporate ranks.
          </p>
        </div>
      ) : error ? (
        <div className="glass-card" style={styles.errorContainer}>
          <AlertOctagon size={32} color="var(--danger)" />
          <h4 style={{ color: 'var(--text-primary)', marginTop: '0.5rem' }}>Analysis Blocked</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{error}</p>
        </div>
      ) : analytics ? (
        <div style={styles.resultsWrapper}>
          {/* Executive Summary Statement */}
          <div className="glass-card" style={styles.summaryCard}>
            <div style={styles.badgeWrapper}>
              <span className="ai-badge">AI EXECUTIVES STATEMENT</span>
            </div>
            <p style={styles.summaryText}>{analytics.summary}</p>
          </div>

          {/* Core Analytics Sections */}
          <div style={styles.twoColumnLayout}>
            {/* Recommendations Panels */}
            <div style={styles.recsColumn}>
              {/* Promotions Block */}
              {promotions.length > 0 && (
                <div className="glass-card" style={styles.panelCard}>
                  <div style={styles.panelHeader}>
                    <UserCheck size={18} color="var(--success)" />
                    <h4 style={styles.panelTitle}>Promotion & Career Trajectories</h4>
                  </div>
                  {promotions.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      <div className="rec-type-border border-promotion"></div>
                      <div style={styles.recMeta}>
                        <span style={styles.recTargetName}>{rec.employeeName}</span>
                        <span style={styles.recTargetEmail}>{rec.employeeEmail}</span>
                      </div>
                      <h5 style={styles.recSubject}>{rec.recommendationText}</h5>
                      <p style={styles.recBody}>{rec.details}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Training / Upskilling Block */}
              {training.length > 0 && (
                <div className="glass-card" style={styles.panelCard}>
                  <div style={styles.panelHeader}>
                    <BookOpen size={18} color="var(--info)" />
                    <h4 style={styles.panelTitle}>Skill Gaps & Training Assignments</h4>
                  </div>
                  {training.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      <div className="rec-type-border border-training"></div>
                      <div style={styles.recMeta}>
                        <span style={styles.recTargetName}>{rec.employeeName}</span>
                        <span style={styles.recTargetEmail}>{rec.employeeEmail}</span>
                      </div>
                      <h5 style={styles.recSubject}>{rec.recommendationText}</h5>
                      <p style={styles.recBody}>{rec.details}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* PIP / Rehab Block */}
              {feedback.length > 0 && (
                <div className="glass-card" style={styles.panelCard}>
                  <div style={styles.panelHeader}>
                    <AlertOctagon size={18} color="var(--danger)" />
                    <h4 style={styles.panelTitle}>Performance Restoration & PIPs</h4>
                  </div>
                  {feedback.map((rec, idx) => (
                    <div key={idx} className="recommendation-item">
                      <div className="rec-type-border border-feedback"></div>
                      <div style={styles.recMeta}>
                        <span style={styles.recTargetName}>{rec.employeeName}</span>
                        <span style={styles.recTargetEmail}>{rec.employeeEmail}</span>
                      </div>
                      <h5 style={styles.recSubject}>{rec.recommendationText}</h5>
                      <p style={styles.recBody}>{rec.details}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Ranking Cohort Table */}
            <div style={styles.rankingColumn}>
              <div className="glass-card" style={styles.panelCard}>
                <div style={styles.panelHeader}>
                  <TrendingUp size={18} color="var(--secondary)" />
                  <h4 style={styles.panelTitle}>Corporate Competency Rankings</h4>
                </div>

                <div className="employee-table-container">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Employee</th>
                        <th>Dept</th>
                        <th>AI Score</th>
                        <th>Tier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.rankedList.map((item, idx) => (
                        <React.Fragment key={idx}>
                          <tr>
                            <td style={styles.rankNum}>{idx + 1}</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.email}</span>
                              </div>
                            </td>
                            <td>
                              <span style={styles.deptMiniBadge}>{item.department}</span>
                            </td>
                            <td>
                              <span style={styles.scoreText}>{item.aiScore}/100</span>
                            </td>
                            <td>
                              <span className={`score-badge ${getTierClass(item.tier)}`} style={{ fontSize: '0.75rem' }}>
                                {item.tier}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="5" style={styles.feedbackRow}>
                              <p style={styles.feedbackText}>
                                <strong>AI Commentary:</strong> {item.feedback}
                              </p>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card" style={styles.loadingContainer}>
          <HelpCircle size={48} color="var(--text-muted)" />
          <h4 style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>No AI Analysis Available</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Ensure employees are registered and click analyze!
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    width: '100%'
  },
  configHeader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    gap: '1rem'
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  iconCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(6, 182, 212, 0.12)',
    border: '1px solid rgba(6, 182, 212, 0.2)'
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center'
  },
  focusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-glass)',
    padding: '0.4rem 0.85rem',
    borderRadius: '8px'
  },
  focusText: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  },
  clearBtn: {
    background: 'var(--primary-glow)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
    color: 'var(--text-primary)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  deptSelectorGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  selectSmall: {
    padding: '0.4rem 0.75rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    width: '180px'
  },
  triggerBtn: {
    padding: '0.45rem 1rem',
    fontSize: '0.85rem'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '5rem 2rem',
    textAlign: 'center'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem 2rem',
    textAlign: 'center'
  },
  resultsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  summaryCard: {
    borderLeft: '4px solid var(--secondary)',
    padding: '1.5rem'
  },
  badgeWrapper: {
    marginBottom: '0.5rem'
  },
  summaryText: {
    fontFamily: 'Outfit',
    fontSize: '1.1rem',
    fontWeight: '400',
    color: 'var(--text-primary)',
    lineHeight: '1.6',
    textAlign: 'left'
  },
  twoColumnLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem'
  },
  recsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  rankingColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  panelCard: {
    padding: '1.5rem'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '0.75rem',
    marginBottom: '1.25rem'
  },
  panelTitle: {
    fontFamily: 'Outfit',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  recMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '0.35rem'
  },
  recTargetName: {
    fontWeight: '700',
    color: 'var(--text-secondary)'
  },
  recTargetEmail: {
    color: 'var(--text-muted)'
  },
  recSubject: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginBottom: '0.25rem',
    textAlign: 'left'
  },
  recBody: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    textAlign: 'left'
  },
  rankNum: {
    fontFamily: 'Outfit',
    fontWeight: '800',
    fontSize: '1.1rem',
    color: 'var(--secondary)'
  },
  deptMiniBadge: {
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'var(--text-secondary)',
    padding: '0.15rem 0.35rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  scoreText: {
    fontFamily: 'Outfit',
    fontWeight: '700',
    fontSize: '0.9rem',
    color: 'var(--text-primary)'
  },
  feedbackRow: {
    paddingTop: '0.25rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)'
  },
  feedbackText: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    background: 'rgba(0, 0, 0, 0.15)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    borderLeft: '2px solid rgba(255, 255, 255, 0.08)',
    textAlign: 'left'
  },
  spin: {
    animation: 'spin 1.5s linear infinite'
  }
};

// Add standard responsive Media Query for wider viewports
if (typeof window !== 'undefined' && window.matchMedia) {
  const mediaQuery = window.matchMedia('(min-width: 992px)');
  const updateLayout = (mq) => {
    if (mq.matches) {
      styles.twoColumnLayout.gridTemplateColumns = '1.1fr 1fr';
    } else {
      styles.twoColumnLayout.gridTemplateColumns = '1fr';
    }
  };
  updateLayout(mediaQuery);
  mediaQuery.addListener(updateLayout);
}

export default AIRecommendations;
