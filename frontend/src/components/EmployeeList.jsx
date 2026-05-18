import React, { useState } from 'react';
import { Search, Filter, Trash2, Edit2, BrainCircuit, Users } from 'lucide-react';

const EmployeeList = ({ employees, onEditTrigger, onDeleteTrigger, onAnalyzeTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // Client filtering
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === '' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  return (
    <div className="glass-card" style={styles.container}>
      {/* Search & Filter Bar */}
      <div style={styles.filterSection}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            className="form-input"
            style={styles.paddedInput}
            placeholder="Search by employee name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.deptFilterWrapper}>
          <Filter size={16} style={styles.filterIcon} />
          <select
            className="form-input"
            style={styles.selectInput}
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Development">Development</option>
            <option value="Research & AI">Research & AI</option>
            <option value="Design">Design</option>
            <option value="Operations">Operations</option>
            <option value="Product Management">Product Management</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="employee-table-container">
        {filteredEmployees.length === 0 ? (
          <div style={styles.emptyState}>
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontFamily: 'Outfit', color: 'var(--text-secondary)' }}>No Employees Registered</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Add a new employee using the registration form or adjust your search filters.
            </p>
          </div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Skills Matrix</th>
                <th>Perf. Score</th>
                <th>Experience</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp._id}>
                  <td style={{ fontWeight: '600', fontFamily: 'Outfit' }}>{emp.name}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{emp.email}</td>
                  <td>
                    <span style={styles.deptBadge}>{emp.department}</span>
                  </td>
                  <td>
                    <div style={styles.skillsContainer}>
                      {emp.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} style={styles.skillPill}>
                          {skill}
                        </span>
                      ))}
                      {emp.skills.length > 3 && (
                        <span style={styles.skillPlus}>+{emp.skills.length - 3} more</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`score-badge ${getScoreClass(emp.performanceScore)}`}>
                      {emp.performanceScore}%
                    </span>
                  </td>
                  <td style={{ fontWeight: '500' }}>{emp.experience} yrs</td>
                  <td>
                    <div style={styles.actionsContainer}>
                      <button
                        onClick={() => onAnalyzeTrigger(emp._id)}
                        style={styles.aiActionBtn}
                        title="AI Analysis & Recommendations"
                      >
                        <BrainCircuit size={14} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>AI</span>
                      </button>
                      <button
                        onClick={() => onEditTrigger(emp)}
                        style={styles.editActionBtn}
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDeleteTrigger(emp._id)}
                        style={styles.deleteActionBtn}
                        title="Delete Profile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    minHeight: '400px'
  },
  filterSection: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  searchWrapper: {
    position: 'relative',
    flex: '2 1 300px',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)'
  },
  paddedInput: {
    paddingLeft: '38px'
  },
  deptFilterWrapper: {
    position: 'relative',
    flex: '1 1 200px',
    display: 'flex',
    alignItems: 'center'
  },
  filterIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)',
    pointerEvents: 'none'
  },
  selectInput: {
    paddingLeft: '38px',
    cursor: 'pointer'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 1.5rem',
    textAlign: 'center'
  },
  deptBadge: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  skillsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.35rem',
    maxWidth: '220px'
  },
  skillPill: {
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.15)',
    color: 'hsl(245, 100%, 85%)',
    padding: '0.15rem 0.4rem',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '500'
  },
  skillPlus: {
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    alignSelf: 'center',
    marginLeft: '0.25rem'
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem'
  },
  aiActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
    border: '1px solid rgba(6, 182, 212, 0.3)',
    color: 'var(--secondary)',
    padding: '0.35rem 0.65rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  editActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-secondary)',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  },
  deleteActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(239, 68, 68, 0.05)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    color: 'var(--danger)',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'var(--transition-fast)'
  }
};

export default EmployeeList;
