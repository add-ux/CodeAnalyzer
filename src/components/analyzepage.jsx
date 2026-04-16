import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./analyzepage.css";

function AnalyzePage() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);
  const [codeText, setCodeText] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const fileInputRef = useRef(null);
  const username = localStorage.getItem("auth_username") || "Profile";

  // Load usage count, dark mode preference, and add mouse move listener
  useEffect(() => {
    const storedUsage = localStorage.getItem('codeAnalyzerUsage');
    if (storedUsage) {
      setUsageCount(parseInt(storedUsage));
    } else {
      setUsageCount(0);
    }

    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }

    // Global mouse move listener for gradient effect
    const handleGlobalMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const hasFreeTrials = () => {
    if (localStorage.getItem("auth_username")) {
      return true;
    }
    return usageCount < 2;
  };

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('codeAnalyzerUsage', newCount);
    return newCount;
  };

  const handleLogout = () => {
    setProfileOpen(false);
    localStorage.removeItem("auth_username");
    navigate("/login");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // File size validation
  const isValidFileSize = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File too large! Maximum size is 5MB. Your file is ${sizeInMB}MB`);
      return false;
    }
    return true;
  };

  const isValidFileType = (filename) => {
    const validExtensions = ['.py', '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp'];
    return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFileType(file.name)) {
      if (isValidFileSize(file)) {
        setSelectedFile(file);
        setError(null);
      }
    } else if (file) {
      setError("Invalid file type. Please upload .py, .c, .cpp files");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && isValidFileType(file.name)) {
      if (isValidFileSize(file)) {
        setSelectedFile(file);
        setError(null);
      }
    } else if (file) {
      setError("Invalid file type. Please upload .py, .c, .cpp files");
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyzeFile = async () => {
    if (!hasFreeTrials()) {
      setShowLimitModal(true);
      return;
    }

    if (!selectedFile) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        if (!localStorage.getItem("auth_username")) {
          const newCount = incrementUsage();
          if (newCount >= 2) {
            setTimeout(() => {
              setShowLimitModal(true);
            }, 1500);
          }
        }
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePaste = async () => {
    if (!hasFreeTrials()) {
      setShowLimitModal(true);
      return;
    }

    if (!codeText.trim()) {
      setError("Please paste some code to analyze");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeText,
          language: language,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.results);
        if (!localStorage.getItem("auth_username")) {
          const newCount = incrementUsage();
          if (newCount >= 2) {
            setTimeout(() => {
              setShowLimitModal(true);
            }, 1500);
          }
        }
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearResults = () => {
    setResults(null);
    setError(null);
  };

  // Copy results to clipboard
  const copyResultsToClipboard = async () => {
    if (!results) return;

    const report = `
╔══════════════════════════════════════════════════════════════╗
║              CODE QUALITY ANALYSIS REPORT                    ║
╚══════════════════════════════════════════════════════════════╝

📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:              ${results.summary?.status || 'N/A'}
Readability Score:   ${results.readability?.score || 0}/100 (Grade: ${results.readability?.grade || 'N/A'})
Total Issues:        ${results.summary?.total_issues || 0}
Critical Issues:     ${results.summary?.critical_issues || 0}

📈 CODE METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Lines:         ${results.metrics?.total_lines || 0}
Code Lines:          ${results.metrics?.code_lines || 0}
Comment Lines:       ${results.metrics?.comment_lines || 0}
Comment Ratio:       ${results.metrics?.comment_ratio ? (results.metrics.comment_ratio * 100).toFixed(1) : 0}%

🔍 READABILITY ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cyclomatic Complexity: ${results.readability?.cyclomatic_complexity || 'N/A'}
Max Nesting Depth:     ${results.readability?.max_nesting_depth || 'N/A'}

${results.memory_issues && results.memory_issues.length > 0 ? `
💾 MEMORY SAFETY ISSUES (${results.memory_issues.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${results.memory_issues.map((issue, i) => 
  `  ${i+1}. [${issue.severity}] ${issue.type}${issue.line ? ` (Line ${issue.line})` : ''}
     ${issue.message}`
).join('\n')}
` : ''}

${results.security_issues && results.security_issues.length > 0 ? `
🔒 SECURITY ISSUES (${results.security_issues.length})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${results.security_issues.map((issue, i) => 
  `  ${i+1}. [${issue.severity}] ${issue.type}${issue.line ? ` (Line ${issue.line})` : ''}
     ${issue.message}`
).join('\n')}
` : ''}

${(!results.memory_issues || results.memory_issues.length === 0) && 
  (!results.security_issues || results.security_issues.length === 0) ? `
✅ NO ISSUES FOUND!
   Your code looks clean and secure. Great job! 🎉
` : ''}

💡 RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${results.summary?.status === "FAIL" ? 
  `  • Fix all CRITICAL security issues immediately
  • Address memory safety issues to prevent crashes` :
 results.summary?.status === "CAUTION" ? 
  `  • Review security issues - they could lead to vulnerabilities
  • Consider refactoring to improve maintainability` :
  `  • Great job! Your code meets quality standards!`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Code Quality Analyzer
Report generated on: ${new Date().toLocaleString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError("Failed to copy report to clipboard");
    }
  };

  const getSeverityClass = (severity) => {
    switch(severity?.toUpperCase()) {
      case "CRITICAL": return "critical";
      case "HIGH": return "high";
      case "MEDIUM": return "medium";
      default: return "low";
    }
  };

  const getRemainingTrials = () => {
    if (localStorage.getItem("auth_username")) return "Unlimited";
    return Math.max(0, 2 - usageCount);
  };

  // Check if there's code to analyze
  const hasCodeToAnalyze = () => {
    if (activeTab === "upload") {
      return selectedFile !== null;
    } else {
      return codeText.trim().length > 0;
    }
  };

  // Get graph data from results
  const getGraphData = () => {
    if (!results) return null;

    return {
      readabilityScore: results.readability?.score || 0,
      totalIssues: results.summary?.total_issues || 0,
      criticalIssues: results.summary?.critical_issues || 0,
      complexity: results.readability?.cyclomatic_complexity || 0,
      memoryIssues: results.memory_issues?.length || 0,
      securityIssues: results.security_issues?.length || 0,
      grade: results.readability?.grade || "N/A",
      status: results.summary?.status || "N/A"
    };
  };

  return (
    <div className="analyze-page">
      {/* Navigation Bar */}
      <nav className="analyze-nav">
        <Link to="/" className="analyze-nav-logo">
          <span className="brand-name">Code<span>Analyzer</span></span>
        </Link>

        <div className="analyze-nav-right">
          <div className="nav-controls">
            <button className="theme-toggle" onClick={toggleDarkMode}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            {!localStorage.getItem("auth_username") && (
              <div className="usage-badge-nav">
                <i className="fa fa-chart-simple"></i>
                <span>{getRemainingTrials()}/2 Free Uses</span>
              </div>
            )}
            {localStorage.getItem("auth_username") && (
              <div className="usage-badge-nav premium">
                <i className="fa fa-crown"></i>
                <span>Premium</span>
              </div>
            )}

            <button
              type="button"
              className="analyze-profile-trigger"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <span className="analyze-profile-icon">
                <i className="fa fa-user-circle"></i>
              </span>
              <span className="analyze-profile-label">{username}</span>
              <i className={`fa fa-chevron-${profileOpen ? "up" : "down"} analyze-profile-chevron`}></i>
            </button>
          </div>

          {profileOpen && (
            <>
              <div className="analyze-profile-backdrop" onClick={() => setProfileOpen(false)} />
              <div className="analyze-profile-dropdown">
                <Link to="/analyze" className="analyze-dropdown-item" onClick={() => setProfileOpen(false)}>
                  <i className="fa fa-user"></i> {username}
                </Link>
                {!localStorage.getItem("auth_username") && (
                  <div className="analyze-dropdown-item trial-info">
                    <i className="fa fa-gift"></i> Free Trials Left: {getRemainingTrials()}
                  </div>
                )}
                <button className="analyze-dropdown-item analyze-dropdown-logout" onClick={handleLogout}>
                  <i className="fa fa-sign-out"></i> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="analyze-main">
        <div 
          className="analyze-container"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'} 0%, transparent 70%)`
          }}
        >
          {/* Header */}
          <div className="analyze-header">
            <h1>Code Quality Analyzer</h1>
            <p>Check your code for readability issues, memory safety, and security vulnerabilities</p>
            {!localStorage.getItem("auth_username") && (
              <div className="free-trial-banner">
                <i className="fa fa-info-circle"></i>
                You have {getRemainingTrials()} free {getRemainingTrials() === 1 ? 'analysis' : 'analyses'} remaining.
                <Link to="/signup" className="signup-link"> Sign up</Link> for unlimited access!
              </div>
            )}
          </div>

          {/* Two Column Layout */}
          <div className="two-column-layout">
            {/* Left Column - Upload/Paste Section */}
            <div className="left-column">
              <div className="analyze-tabs">
                <button 
                  className={`analyze-tab ${activeTab === "upload" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("upload");
                    setResults(null);
                    setError(null);
                  }}
                >
                  <i className="fa fa-cloud-upload"></i> Upload File
                </button>
                <button 
                  className={`analyze-tab ${activeTab === "paste" ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab("paste");
                    setResults(null);
                    setError(null);
                  }}
                >
                  <i className="fa fa-code"></i> Paste Code
                </button>
              </div>

              {/* Upload Tab Content */}
              {activeTab === "upload" && (
                <div className="analyze-upload-section">
                  {!selectedFile ? (
                    <div 
                      className={`upload-area ${isDragging ? "dragging" : ""}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fa fa-file-code-o"></i>
                      <h3>Drag & Drop Your Code File</h3>
                      <p>or click to browse</p>
                      <p className="file-hint">
                        <i className="fa fa-check-circle"></i> Supported: .py, .c, .cpp, .cc, .h, .hpp
                      </p>
                      <p className="file-hint">
                        <i className="fa fa-info-circle"></i> Max file size: 5MB
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".py,.c,.cpp,.cc,.cxx,.h,.hpp"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                      <button className="btn-browse" onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}>
                        <i className="fa fa-folder-open"></i> Browse Files
                      </button>
                    </div>
                  ) : (
                    <div className="selected-file-card">
                      <div className="file-info">
                        <i className="fa fa-file-code"></i>
                        <div className="file-details">
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-size">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      </div>
                      <div className="file-actions">
                        <button className="btn-cancel" onClick={handleCancelFile}>
                          <i className="fa fa-times"></i> Cancel
                        </button>
                        <button className="btn-analyze" onClick={handleAnalyzeFile}>
                          <i className="fa fa-chart-line"></i> Analyze
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Paste Tab Content */}
              {activeTab === "paste" && (
                <div className="analyze-paste-section">
                  <div className="language-selector">
                    <label>
                      <i className="fa fa-code"></i> Programming Language:
                    </label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="python"> Python</option>
                      <option value="c"> C</option>
                      <option value="cpp"> C++</option>
                    </select>
                  </div>
                  <textarea
                    className="code-input"
                    placeholder="Paste your code here..."
                    value={codeText}
                    onChange={(e) => setCodeText(e.target.value)}
                  ></textarea>
                  <button className="btn-analyze-paste" onClick={handleAnalyzePaste}>
                    <i className="fa fa-chart-line"></i> Analyze Code
                  </button>
                </div>
              )}
            </div>

            {/* Right Column - Graph Section */}
            <div className="right-column">
              <div className="graph-section">
                <h3 className="graph-title">
                  <i className="fa fa-chart-line"></i> Analysis Dashboard
                </h3>

                {!hasCodeToAnalyze() ? (
                  <div className="graph-placeholder">
                    <div className="empty-circle">
                      <div className="circle">
                        <i className="fa fa-code"></i>
                        <span>No Data</span>
                      </div>
                    </div>
                    <p className="placeholder-text">
                      <i className="fa fa-info-circle"></i>
                      Upload a file or paste code to see analysis
                    </p>
                  </div>
                ) : !results ? (
                  <div className="graph-placeholder">
                    <div className="empty-circle">
                      <div className="circle">
                        <i className="fa fa-chart-line"></i>
                        <span>Awaiting Analysis</span>
                      </div>
                    </div>
                    <p className="placeholder-text">
                      <i className="fa fa-info-circle"></i>
                      Click "Analyze" to generate insights
                    </p>
                  </div>
                ) : (
                  <div className="graph-content">
                    {/* Readability Score Card */}
                    <div className="graph-card readability-card">
                      <div className="card-header">
                        <i className="fa fa-book-open"></i>
                        <h4>Readability Score</h4>
                      </div>
                      <div className="score-container">
                        <div className="circular-progress">
                          <svg viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10"/>
                            <circle 
                              cx="60" cy="60" r="54" fill="none" 
                              stroke={getGraphData()?.readabilityScore >= 70 ? '#10b981' : getGraphData()?.readabilityScore >= 50 ? '#f59e0b' : '#ef4444'} 
                              strokeWidth="10"
                              strokeDasharray={`${(getGraphData()?.readabilityScore / 100) * 339.3} 339.3`}
                              strokeLinecap="round"
                              transform="rotate(-90 60 60)"
                            />
                            <text x="60" y="70" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#1f2937">
                              {getGraphData()?.readabilityScore}
                            </text>
                            <text x="60" y="85" textAnchor="middle" fontSize="10" fill="#6b7280">/100</text>
                          </svg>
                        </div>
                        <div className="score-info">
                          <div className={`grade-badge ${getGraphData()?.grade?.toLowerCase()}`}>
                            Grade: {getGraphData()?.grade}
                          </div>
                          <div className="score-description">
                            {getGraphData()?.readabilityScore >= 70 ? "Good readability" : 
                             getGraphData()?.readabilityScore >= 50 ? "Fair readability" : 
                             "Poor readability"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Issues Distribution Card */}
                    <div className="graph-card issues-card">
                      <div className="card-header">
                        <i className="fa fa-chart-pie"></i>
                        <h4>Issues Breakdown</h4>
                      </div>

                      <div className="issues-visualization">
                        <div className="issues-donut">
                          <svg viewBox="0 0 100 100" className="donut-svg">
                            {(() => {
                              const total = getGraphData()?.totalIssues || 0;
                              if (total === 0) {
                                return <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="15" />;
                              }

                              const memoryCount = getGraphData()?.memoryIssues || 0;
                              const securityCount = getGraphData()?.securityIssues || 0;
                              const criticalCount = getGraphData()?.criticalIssues || 0;

                              let currentAngle = 0;
                              const segments = [];

                              if (criticalCount > 0) {
                                const angle = (criticalCount / total) * 360;
                                segments.push({
                                  value: criticalCount,
                                  label: 'Critical',
                                  color: '#dc2626',
                                  angle: angle,
                                  startAngle: currentAngle,
                                  endAngle: currentAngle + angle
                                });
                                currentAngle += angle;
                              }

                              if (memoryCount > 0) {
                                const angle = (memoryCount / total) * 360;
                                segments.push({
                                  value: memoryCount,
                                  label: 'Memory',
                                  color: '#374151',
                                  angle: angle,
                                  startAngle: currentAngle,
                                  endAngle: currentAngle + angle
                                });
                                currentAngle += angle;
                              }

                              if (securityCount > 0) {
                                const angle = (securityCount / total) * 360;
                                segments.push({
                                  value: securityCount,
                                  label: 'Security',
                                  color: '#ea580c',
                                  angle: angle,
                                  startAngle: currentAngle,
                                  endAngle: currentAngle + angle
                                });
                              }

                              return segments.map((segment, idx) => {
                                const startRad = (segment.startAngle * Math.PI) / 180;
                                const endRad = (segment.endAngle * Math.PI) / 180;
                                const x1 = 50 + 40 * Math.cos(startRad);
                                const y1 = 50 + 40 * Math.sin(startRad);
                                const x2 = 50 + 40 * Math.cos(endRad);
                                const y2 = 50 + 40 * Math.sin(endRad);
                                const largeArc = segment.angle > 180 ? 1 : 0;

                                return (
                                  <path
                                    key={idx}
                                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                    fill={segment.color}
                                  />
                                );
                              });
                            })()}
                            <circle cx="50" cy="50" r="25" fill="white" />
                            <text x="50" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1f2937">
                              {getGraphData()?.totalIssues || 0}
                            </text>
                            <text x="50" y="65" textAnchor="middle" fontSize="8" fill="#6b7280">Total</text>
                          </svg>
                        </div>

                        <div className="issues-legend">
                          {getGraphData()?.criticalIssues > 0 && (
                            <div className="legend-item">
                              <span className="legend-color critical"></span>
                              <span className="legend-label">Critical</span>
                              <span className="legend-value">{getGraphData()?.criticalIssues}</span>
                            </div>
                          )}
                          {getGraphData()?.memoryIssues > 0 && (
                            <div className="legend-item">
                              <span className="legend-color memory"></span>
                              <span className="legend-label">Memory</span>
                              <span className="legend-value">{getGraphData()?.memoryIssues}</span>
                            </div>
                          )}
                          {getGraphData()?.securityIssues > 0 && (
                            <div className="legend-item">
                              <span className="legend-color security"></span>
                              <span className="legend-label">Security</span>
                              <span className="legend-value">{getGraphData()?.securityIssues}</span>
                            </div>
                          )}
                          {getGraphData()?.totalIssues === 0 && (
                            <div className="legend-item">
                              <span className="legend-color none"></span>
                              <span className="legend-label">No Issues</span>
                              <span className="legend-value">✨</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Complexity Meter Card */}
                    <div className="graph-card complexity-card">
                      <div className="card-header">
                        <i className="fa fa-code-branch"></i>
                        <h4>Cyclomatic Complexity</h4>
                      </div>
                      <div className="complexity-container">
                        <div className="complexity-gauge">
                          <div className="gauge-track">
                            <div 
                              className="gauge-fill" 
                              style={{ 
                                width: `${Math.min(100, (getGraphData()?.complexity / 30) * 100)}%`,
                                background: getGraphData()?.complexity > 20 ? '#ef4444' : 
                                           getGraphData()?.complexity > 10 ? '#f59e0b' : '#10b981'
                              }}
                            />
                          </div>
                          <div className="complexity-markers">
                            <span>Low (1-10)</span>
                            <span>Medium (11-20)</span>
                            <span>High (21+)</span>
                          </div>
                        </div>
                        <div className="complexity-value-box">
                          <span className="complexity-number">{getGraphData()?.complexity}</span>
                          <span className="complexity-label">Complexity Score</span>
                          <div className={`complexity-status ${getGraphData()?.complexity > 20 ? 'high' : getGraphData()?.complexity > 10 ? 'medium' : 'low'}`}>
                            {getGraphData()?.complexity > 20 ? '⚠️ Too Complex' : 
                             getGraphData()?.complexity > 10 ? '📊 Moderate' : 
                             '✅ Well Structured'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overall Status Card */}
                    <div className={`status-card-modern ${getGraphData()?.status?.toLowerCase()}`}>
                      <div className="status-icon">
                        <i className={`fa ${getGraphData()?.status === 'PASS' ? 'fa-check-circle' : 
                                           getGraphData()?.status === 'CAUTION' ? 'fa-exclamation-triangle' : 
                                           'fa-times-circle'}`}></i>
                      </div>
                      <div className="status-info">
                        <div className="status-label">Overall Code Quality</div>
                        <div className="status-value">{getGraphData()?.status || "N/A"}</div>
                        <div className="status-message">
                          {getGraphData()?.status === 'PASS' ? "Your code meets quality standards" :
                           getGraphData()?.status === 'CAUTION' ? "Some issues need attention" :
                           "Critical issues require immediate action"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-overlay">
              <div className="loading-card">
                <div className="spinner"></div>
                <h3>Analyzing Your Code</h3>
                <p>Checking for issues...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !loading && (
            <div className="error-message">
              <i className="fa fa-exclamation-circle"></i>
              <div>
                <h4>Error</h4>
                <p>{error}</p>
              </div>
              <button onClick={() => setError(null)} className="close-error">
                <i className="fa fa-times"></i>
              </button>
            </div>
          )}

          {/* Results Section */}
          {results && !loading && (
            <div className="results-section">
              <div className="results-header">
                <h2><i className="fa fa-chart-bar"></i> Detailed Analysis Results</h2>
                <div>
                  <button 
                    className={`btn-copy-results ${copied ? 'copied' : ''}`} 
                    onClick={copyResultsToClipboard}
                  >
                    <i className={`fa fa-${copied ? 'check' : 'copy'}`}></i> 
                    {copied ? 'Copied!' : 'Copy Report'}
                  </button>
                  <button className="btn-clear-results" onClick={handleClearResults}>
                    <i className="fa fa-times"></i> Clear
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="summary-grid">
                <div className="summary-card status">
                  <div className="card-icon"><i className="fa fa-clipboard-check"></i></div>
                  <div className="card-content">
                    <span className="card-label">Status</span>
                    <span className={`card-value ${results.summary?.status?.toLowerCase()}`}>
                      {results.summary?.status || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="summary-card issues">
                  <div className="card-icon"><i className="fa fa-exclamation-triangle"></i></div>
                  <div className="card-content">
                    <span className="card-label">Total Issues</span>
                    <span className="card-value">{results.summary?.total_issues || 0}</span>
                  </div>
                </div>
                <div className="summary-card readability">
                  <div className="card-icon"><i className="fa fa-book-open"></i></div>
                  <div className="card-content">
                    <span className="card-label">Readability Score</span>
                    <span className="card-value">{results.readability?.score || "N/A"}/100</span>
                  </div>
                </div>
                <div className="summary-card security">
                  <div className="card-icon"><i className="fa fa-shield-alt"></i></div>
                  <div className="card-content">
                    <span className="card-label">Critical Issues</span>
                    <span className="card-value">{results.summary?.critical_issues || 0}</span>
                  </div>
                </div>
              </div>

              {/* Code Metrics */}
              {results.metrics && (
                <div className="detail-card">
                  <h3><i className="fa fa-chart-line"></i> Code Metrics</h3>
                  <div className="metrics-grid">
                    <div className="metric">
                      <span className="metric-label">Total Lines</span>
                      <span className="metric-value">{results.metrics.total_lines}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Code Lines</span>
                      <span className="metric-value">{results.metrics.code_lines}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Comment Lines</span>
                      <span className="metric-value">{results.metrics.comment_lines}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Comment Ratio</span>
                      <span className="metric-value">{(results.metrics.comment_ratio * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Readability */}
              {results.readability && (
                <div className="detail-card">
                  <h3><i className="fa fa-book"></i> Readability Analysis</h3>
                  <div className="readability-details">
                    <div className="readability-item">
                      <span>Cyclomatic Complexity:</span>
                      <strong>{results.readability.cyclomatic_complexity || "N/A"}</strong>
                    </div>
                    <div className="readability-item">
                      <span>Max Nesting Depth:</span>
                      <strong>{results.readability.max_nesting_depth || "N/A"}</strong>
                    </div>
                    <div className="readability-item">
                      <span>Grade:</span>
                      <strong className="grade">{results.readability.grade || "N/A"}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Memory Issues */}
              {results.memory_issues && results.memory_issues.length > 0 && (
                <div className="detail-card">
                  <h3><i className="fa fa-memory"></i> Memory Safety Issues</h3>
                  <div className="issues-list">
                    {results.memory_issues.map((issue, idx) => (
                      <div key={idx} className={`issue ${getSeverityClass(issue.severity)}`}>
                        <div className="issue-header">
                          <span className="issue-type">{issue.type}</span>
                          <span className={`severity ${getSeverityClass(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </div>
                        {issue.line && <div className="issue-line">Line {issue.line}</div>}
                        <div className="issue-message">{issue.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security Issues */}
              {results.security_issues && results.security_issues.length > 0 && (
                <div className="detail-card">
                  <h3><i className="fa fa-lock"></i> Security Issues</h3>
                  <div className="issues-list">
                    {results.security_issues.map((issue, idx) => (
                      <div key={idx} className={`issue ${getSeverityClass(issue.severity)}`}>
                        <div className="issue-header">
                          <span className="issue-type">{issue.type}</span>
                          <span className={`severity ${getSeverityClass(issue.severity)}`}>
                            {issue.severity}
                          </span>
                        </div>
                        {issue.line && <div className="issue-line">Line {issue.line}</div>}
                        <div className="issue-message">{issue.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Issues Found */}
              {(!results.memory_issues || results.memory_issues.length === 0) && 
               (!results.security_issues || results.security_issues.length === 0) && (
                <div className="success-message">
                  <i className="fa fa-check-circle"></i>
                  <h3>No Issues Found!</h3>
                  <p>Your code looks clean and secure. Great job! 🎉</p>
                </div>
              )}

              {/* Recommendations */}
              <div className="detail-card recommendations">
                <h3><i className="fa fa-lightbulb"></i> Recommendations</h3>
                <ul>
                  {results.summary?.status === "FAIL" && (
                    <>
                      <li>🔴 Fix all CRITICAL security issues immediately</li>
                      <li>🟡 Address memory safety issues to prevent crashes</li>
                      {results.readability?.score < 50 && <li>📖 Improve code readability by reducing complexity</li>}
                    </>
                  )}
                  {results.summary?.status === "CAUTION" && (
                    <>
                      <li>🟠 Review security issues - they could lead to vulnerabilities</li>
                      {results.readability?.score < 70 && <li>📖 Consider refactoring to improve maintainability</li>}
                    </>
                  )}
                  {results.summary?.status === "PASS" && (
                    <li>✅ Great job! Your code is clean, readable, and secure! 🎉</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Limit Modal */}
     {showLimitModal && (
  <div className="modal-overlay" onClick={() => setShowLimitModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowLimitModal(false)}>✕</button>
      <div className="modal-icon">
        <img src="/icons/lock.png" alt="" className="modal-custom-icon" />
      </div>
      <h2>Out of free trials</h2>
      <p>You’ve used both free analyses.<br />Create an account to continue:</p>
      <ul className="modal-benefits">
        <li>✓ Unlimited analyses</li>
        <li>✓ Save & export reports</li>
        <li>✓ Personalised recommendations</li>
      </ul>
      <div className="modal-buttons">
        <button className="modal-btn-secondary" onClick={() => setShowLimitModal(false)}>
          Maybe later
        </button>
        <button className="modal-btn-primary" onClick={() => navigate("/signup")}>
          Sign up free
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default AnalyzePage;