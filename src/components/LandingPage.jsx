import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [usageCount, setUsageCount] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('codeAnalyzerUsage');
    if (stored) setUsageCount(parseInt(stored));
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
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

  const getRemaining = () => {
    if (localStorage.getItem('auth_username')) return 'unlimited';
    const left = 2 - usageCount;
    return left > 0 ? `${left} free` : '0';
  };

  const gradientStyle = {
    backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,0.07) 0%, rgba(0,0,0,0) 70%)`
  };
  const darkGradientStyle = {
    backgroundImage: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 70%)`
  };

  return (
    <div className="landing">
      {/* Header with Login/Signup buttons */}
      <header className="analyze-nav">
        <div className="analyze-nav-logo">
          <span className="brand-name">Code<span>Analyzer</span></span>
        </div>
        <div className="analyze-nav-right">
          <div className="nav-controls">
            <button className="theme-toggle" onClick={toggleDarkMode} title="Switch to dark/light mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="nav-login-btn" onClick={() => navigate('/login')} title="Log in to your account">
              Log in
            </button>
            <button className="nav-signup-btn" onClick={() => navigate('/signup')} title="Create a new account">
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section with simple terminal */}
        <section className="hero" style={darkMode ? darkGradientStyle : gradientStyle}>
          <div className="container hero-grid">
            <div>
              <h1>Code quality reports<br />that make sense.</h1>
              <p className="lead">
                Readability, memory safety, security – in one clear report. No account needed for your first 2 checks.
              </p>
              <div className="cta-row">
                <button className="btn-large" onClick={() => navigate('/analyze')} title="Start analyzing your code">
                  Analyze code →
                </button>
                <span className="remaining-badge">{getRemaining()} analyses left</span>
              </div>
              <div className="trust-badge">✓ Used by small teams & solo devs</div>
            </div>

            {/* Simple terminal: just code and output */}
            <div className="hero-terminal">
              <pre className="terminal-code">
{`$ ./codeanalyzer check sample.py

Readability:   78/100
Memory safety: 2 issues
Security:      1 issue
Time:          1.8s

$`}
              </pre>
            </div>
          </div>
        </section>

        {/* Stats row */}
        <div className="stats-row" style={darkMode ? darkGradientStyle : gradientStyle}>
          <div className="container stats-grid">
            <div className="stat-item">
              <span className="stat-number">10k+</span>
              <span className="stat-label">analyses run</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Python, C, C++</span>
              <span className="stat-label">languages supported</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2s</span>
              <span className="stat-label">average analysis time</span>
            </div>
          </div>
        </div>

        {/* Features – with animated MP4 icons */}
        <section className="features" style={darkMode ? darkGradientStyle : gradientStyle}>
          <div className="container">
            <h2>What we check</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feat-icon animated-icon readability-icon">
                  <img 
                    src="/icons/book.gif" 
                    alt="Readability icon" 
                    className="custom-icon-gif"
                  />
                </div>
                <h3>Readability</h3>
                <p>Cyclomatic complexity, nesting depth, long functions, unclear naming.</p>
                <div className="feat-example">Example: “function with complexity 15 → split into smaller pieces”</div>
              </div>
              <div className="feature-card">
                <div className="feat-icon animated-icon memory-icon">
                  <img 
                    src="/icons/cpu.gif" 
                    alt="Memory safety" 
                    className="custom-icon-gif"
                  />
                </div>
                <h3>Memory safety</h3>
                <p>Leaks, double frees, uninitialized usage (C/C++), dangling pointers.</p>
                <div className="feat-example">Example: “malloc without free → potential leak”</div>
              </div>
              <div className="feature-card">
                <div className="feat-icon animated-icon security-icon">
                  <img 
                    src="/icons/shield.gif" 
                    alt="Security" 
                    className="custom-icon-gif"
                  />
                </div>
                <h3>Security</h3>
                <p>Hardcoded secrets, SQL/command injection, unsafe functions.</p>
                <div className="feat-example">Example: “eval() on user input → high risk”</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how-it-works" style={darkMode ? darkGradientStyle : gradientStyle}>
          <div className="container">
            <h2>How it works</h2>
            <div className="steps">
              <div className="step">
                <span className="step-num">1</span>
                <div><strong>Paste or upload</strong><br />.py, .c, .cpp files or paste directly</div>
              </div>
              <div className="step">
                <span className="step-num">2</span>
                <div><strong>Click analyze</strong><br />takes ~2 seconds</div>
              </div>
              <div className="step">
                <span className="step-num">3</span>
                <div><strong>Read report</strong><br />scores + specific line‑by‑line issues</div>
              </div>
            </div>
          </div>
        </section>

        {/* Example output */}
        <section className="example" style={darkMode ? darkGradientStyle : gradientStyle}>
          <div className="container">
            <h2>What you get</h2>
            <div className="example-box">
              <div className="example-metric">
                <span>Readability score</span>
                <strong>78/100</strong>
                <span className="example-sub">Grade C – fair</span>
              </div>
              <div className="example-metric">
                <span>Cyclomatic complexity</span>
                <strong>12 → moderate</strong>
              </div>
              <div className="example-metric">
                <span>Issues found</span>
                <strong>2 memory, 1 security</strong>
              </div>
            </div>
            <div className="sample-issue">
              <div className="issue-line">
                <span className="issue-badge memory">memory</span>
                <code>line 23: malloc() without free()</code>
                <span className="issue-suggestion">→ add free()</span>
              </div>
              <div className="issue-line">
                <span className="issue-badge security">security</span>
                <code>line 41: uses eval() on user input</code>
                <span className="issue-suggestion">→ avoid eval</span>
              </div>
            </div>
            <p className="example-note">Each issue includes the exact line number and a fix suggestion.</p>
          </div>
        </section>

        {/* Supported languages */}
        <section className="lang-section" style={darkMode ? darkGradientStyle : gradientStyle}>
          <div className="container">
            <div className="lang-card">
              <h3>Supported languages</h3>
              <div className="lang-badges">
                <span>Python 3.8+</span>
                <span>C11</span>
                <span>C++17</span>
                <span>more coming</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" style={darkMode ? darkGradientStyle : gradientStyle}>
        <div className="container">
          <div className="footer-grid">
            <div>
              <strong>CodeAnalyzer</strong>
              <p>Honest code quality tool</p>
            </div>
            <div>
              <span>Product</span>
              <button onClick={() => navigate('/analyze')}>Analyze</button>
              <button onClick={() => navigate('/signup')}>Sign up</button>
            </div>
            <div>
              <span>Legal</span>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 CodeAnalyzer – no AI fluff, just code.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;