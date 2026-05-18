import React, { useState, useEffect } from 'react';
import { UserPlus, Save, Sparkles, X, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

const EmployeeForm = ({ employeeToEdit, onFormSubmit, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [performanceScore, setPerformanceScore] = useState(85);
  const [experience, setExperience] = useState(3);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync edits
  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name || '');
      setEmail(employeeToEdit.email || '');
      setDepartment(employeeToEdit.department || '');
      setSkills(employeeToEdit.skills || []);
      setPerformanceScore(employeeToEdit.performanceScore || 80);
      setExperience(employeeToEdit.experience || 0);
      setError('');
    } else {
      resetForm();
    }
  }, [employeeToEdit]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setDepartment('');
    setSkills([]);
    setSkillInput('');
    setPerformanceScore(85);
    setExperience(3);
    setError('');
  };

  // Add skill to tag array
  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = skillInput.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      setSkills([...skills, cleanSkill]);
      setSkillInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddSkill(e);
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations (Q3 test cases coverage)
    if (!name || !email || !department || performanceScore === undefined || experience === undefined) {
      setError('Please fill in all required employee fields.');
      return;
    }

    if (performanceScore < 0 || performanceScore > 100) {
      setError('Performance score must be between 0 and 100.');
      return;
    }

    if (experience < 0) {
      setError('Years of experience cannot be negative.');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    const method = employeeToEdit ? 'PUT' : 'POST';
    const endpoint = employeeToEdit ? `/api/employees/${employeeToEdit._id}` : '/api/employees';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          email,
          department,
          skills,
          performanceScore: Number(performanceScore),
          experience: Number(experience)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server validation error occurred.');
      }

      setSuccess(employeeToEdit ? 'Employee updated successfully!' : 'Employee registered successfully!');
      
      // Celebrate new add with confetti! (WOW design element)
      if (!employeeToEdit) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      resetForm();
      if (onFormSubmit) {
        onFormSubmit(data);
      }
    } catch (err) {
      console.error('Employee Form Submission Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={styles.container}>
      <div style={styles.formHeader}>
        <UserPlus size={20} color="var(--primary)" />
        <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', fontWeight: '700' }}>
          {employeeToEdit ? 'Edit Employee Details' : 'Register New Employee'}
        </h3>
      </div>

      {error && (
        <div style={styles.errorAlert}>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={styles.successAlert}>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div className="form-group">
          <label className="form-label" htmlFor="emp-name">Employee Full Name *</label>
          <input
            id="emp-name"
            type="text"
            className="form-input"
            placeholder="Aman Verma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="emp-email">Corporate Email Address *</label>
          <input
            id="emp-email"
            type="email"
            className="form-input"
            placeholder="aman@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!employeeToEdit} // Disable email edit to maintain DB reference integrity
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="emp-dept">Core Business Department *</label>
          <select
            id="emp-dept"
            className="form-input"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          >
            <option value="">Select Department...</option>
            <option value="Development">Development</option>
            <option value="Research & AI">Research & AI</option>
            <option value="Design">Design</option>
            <option value="Operations">Operations</option>
            <option value="Product Management">Product Management</option>
            <option value="Human Resources">Human Resources</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="emp-skills">Skills Matrix (Press Enter/Comma) *</label>
          <div className="tags-input-container">
            {skills.map((skill, idx) => (
              <span key={idx} className="tag-badge">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)}>
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              id="emp-skills"
              type="text"
              placeholder={skills.length === 0 ? "e.g., React, Node.js" : ""}
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div style={styles.gridRow}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label" htmlFor="emp-score">Performance Index (0-100) *</label>
            <div style={styles.scoreRow}>
              <input
                id="emp-score"
                type="range"
                min="0"
                max="100"
                style={{ flex: 1, accentColor: 'var(--primary)' }}
                value={performanceScore}
                onChange={(e) => setPerformanceScore(e.target.value)}
              />
              <span style={{
                ...styles.scoreDisplay,
                color: performanceScore >= 80 ? 'var(--success)' : performanceScore >= 50 ? 'var(--warning)' : 'var(--danger)'
              }}>
                {performanceScore}
              </span>
            </div>
          </div>

          <div className="form-group" style={{ width: '100px' }}>
            <label className="form-label" htmlFor="emp-exp">Exp (Yrs) *</label>
            <input
              id="emp-exp"
              type="number"
              min="0"
              className="form-input"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={styles.btnRow}>
          {employeeToEdit && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 2 }}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Processing...' : employeeToEdit ? 'Save Changes' : 'Register Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '1.5rem',
    alignSelf: 'start'
  },
  formHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1rem',
    marginBottom: '1.25rem'
  },
  errorAlert: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: 'var(--danger)',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    textAlign: 'left'
  },
  successAlert: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    color: 'var(--success)',
    fontSize: '0.85rem',
    marginBottom: '1rem',
    textAlign: 'left'
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  gridRow: {
    display: 'flex',
    gap: '1rem'
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  scoreDisplay: {
    fontFamily: 'Outfit',
    fontWeight: '800',
    fontSize: '1.1rem',
    width: '32px',
    textAlign: 'right'
  },
  btnRow: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem'
  }
};

export default EmployeeForm;
