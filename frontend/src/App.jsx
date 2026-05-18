import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import AIRecommendations from './components/AIRecommendations';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { LayoutDashboard, Users, UserCheck, GraduationCap } from 'lucide-react';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentHash, setCurrentHash] = useState(window.location.hash || '#/login');
  const [employees, setEmployees] = useState([]);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'ai'

  // Hash-based router listener
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/login');
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Auth redirect rules
    if (token) {
      if (window.location.hash === '#/login' || window.location.hash === '#/signup' || !window.location.hash) {
        window.location.hash = '#/dashboard';
      }
    } else {
      if (window.location.hash !== '#/signup') {
        window.location.hash = '#/login';
      }
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [token]);

  // Sync employees on login or database actions
  useEffect(() => {
    if (token) {
      fetchEmployees();
    }
  }, [token]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data);
      } else {
        console.error('Failed to retrieve catalog:', data.error);
        if (response.status === 401) {
          handleAuthExpiry();
        }
      }
    } catch (err) {
      console.error('Network error during catalog fetch:', err);
    }
  };

  const handleAuthExpiry = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    window.location.hash = '#/login';
  };

  const handleLoginSuccess = (newToken) => {
    setToken(newToken);
    window.location.hash = '#/dashboard';
  };

  const handleSignupSuccess = (newToken) => {
    setToken(newToken);
    window.location.hash = '#/dashboard';
  };

  // CRUD Trigger: Delete
  const handleDeleteTrigger = async (id) => {
    if (!window.confirm('Are you sure you want to remove this employee profile permanently?')) {
      return;
    }

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Redraw list immediately
        setEmployees(employees.filter(emp => emp._id !== id));
        if (selectedEmployeeId === id) {
          setSelectedEmployeeId(null);
        }
      } else {
        alert(data.error || 'Failed to remove employee.');
      }
    } catch (err) {
      console.error('Deletion failure:', err);
    }
  };

  // CRUD Trigger: Edit
  const handleEditTrigger = (employee) => {
    setEmployeeToEdit(employee);
    // Smooth scroll back to form for nice visual UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmitted = () => {
    fetchEmployees();
    setEmployeeToEdit(null);
  };

  // AI Trigger: Analyze specific employee
  const handleAnalyzeTrigger = (id) => {
    setSelectedEmployeeId(id);
    setActiveTab('ai'); // Switch viewport to AI panel
  };

  // Dashboard Stats Calculations
  const totalEmployees = employees.length;
  const avgScore = totalEmployees > 0 
    ? Math.round(employees.reduce((acc, curr) => acc + curr.performanceScore, 0) / totalEmployees) 
    : 0;
  const highPerformers = employees.filter(e => e.performanceScore >= 80).length;
  const avgExperience = totalEmployees > 0
    ? (employees.reduce((acc, curr) => acc + curr.experience, 0) / totalEmployees).toFixed(1)
    : 0;

  // Simple reactive view router
  const renderView = () => {
    if (currentHash === '#/signup') {
      return <Signup onSignupSuccess={handleSignupSuccess} />;
    }
    if (currentHash === '#/login') {
      return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    // Default Protected Dashboard/AI Workspace
    return (
      <ProtectedRoute>
        <div className="app-container">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {activeTab === 'dashboard' ? (
            <div>
              {/* Analytics Summary Cards (Q1 design requirements) */}
              <div className="analytics-cards-grid">
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <span className="form-label" style={{ margin: 0, display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <Users size={14} color="var(--primary)" />
                    Total Employees
                  </span>
                  <div className="stat-number gradient-text-primary">{totalEmployees}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Corporate directory headcount</p>
                </div>
                
                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                  <span className="form-label" style={{ margin: 0, display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <GraduationCap size={14} color="var(--secondary)" />
                    Average Contribution
                  </span>
                  <div className="stat-number gradient-text">{avgScore}%</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Average performance score</p>
                </div>

                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
                  <span className="form-label" style={{ margin: 0, display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <UserCheck size={14} color="var(--success)" />
                    High Performers
                  </span>
                  <div className="stat-number" style={{ color: 'var(--success)' }}>{highPerformers}</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score threshold above 80%</p>
                </div>

                <div className="glass-card stat-card" style={{ borderLeft: '4px solid var(--info)' }}>
                  <span className="form-label" style={{ margin: 0, display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <LayoutDashboard size={14} color="var(--info)" />
                    Average Seniority
                  </span>
                  <div className="stat-number" style={{ color: 'var(--info)' }}>{avgExperience} yrs</div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Average years of experience</p>
                </div>
              </div>

              {/* Main Workspace Grid */}
              <div className="dashboard-grid">
                <EmployeeForm
                  employeeToEdit={employeeToEdit}
                  onFormSubmit={handleFormSubmitted}
                  onCancelEdit={() => setEmployeeToEdit(null)}
                />
                
                <EmployeeList
                  employees={employees}
                  onEditTrigger={handleEditTrigger}
                  onDeleteTrigger={handleDeleteTrigger}
                  onAnalyzeTrigger={handleAnalyzeTrigger}
                />
              </div>
            </div>
          ) : (
            <AIRecommendations
              employees={employees}
              selectedEmployeeId={selectedEmployeeId}
              clearSelectedEmployee={() => setSelectedEmployeeId(null)}
            />
          )}
        </div>
      </ProtectedRoute>
    );
  };

  return <div style={{ minHeight: '100vh' }}>{renderView()}</div>;
};

export default App;
