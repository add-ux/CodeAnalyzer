import './Header.css'
import { Link, useNavigate } from "react-router-dom";


function Headers() {
  const navigate = useNavigate();
  

  return (
    <>
   <div className='header'>
        <nav className='navbar '>
          <img  src="log.png"className="logo"></img>
          <ul className='nav-items'>
                <li><a href="#" >Home</a></li>
                 <li><a href="">About</a></li>
                 <li><Link to="/signup">Sign up</Link></li>
            </ul>
        </nav>
        
      </div>
    <main className="page-content">
            <h2>Code <span >Reuseability</span> and Memory  <span>Safety</span> analyzer </h2>
            <p>( Analyze how easy is to reuse the code and how safe is the memory usage in your code )</p>
            <button className='btn' onClick={() => navigate("/analyze")}>Get Started</button>

      
            <section id="about" className="about-section">
      <div className="about-container">
        
        <div className="about-header">
          <span className="about-badge">How It Works</span>
          <h2>AI-Powered Code Reusability & Memory Analyzer</h2>
          <p className="about-mission">
            Our platform uses machine learning and static code analysis to
            evaluate code reusability and memory safety, helping developers
            write cleaner, efficient, and more reliable software.
          </p>
        </div>

        <div className="about-steps">

          <div className="about-step">
            <div className="about-img-circle">
              <img
                src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&w=100&h=100&fit=crop"
                alt="Upload Code"
              />
            </div>
            <div className="about-step-title">STEP—01</div>
            <h3>Upload Your Code</h3>
            <p>
              Upload your source code or repository so the system can analyze
              its structure, patterns, and memory usage.
            </p>
            <a href="#" className="about-learn">
              Learn More →
            </a>
          </div>

          <div className="about-step">
            <div className="about-img-circle">
              <img
                src="https://images.pexels.com/photos/1181355/pexels-photo-1181355.jpeg?auto=compress&w=100&h=100&fit=crop"
                alt="AI Analysis"
              />
            </div>
            <div className="about-step-title">STEP—02</div>
            <h3>AI Code Analysis</h3>
            <p>
              Our machine learning model evaluates code reusability and detects
              potential memory issues using advanced algorithms.
            </p>
            <a href="#" className="about-learn">
              Learn More →
            </a>
          </div>

          <div className="about-step">
            <div className="about-img-circle">
              <img
                src="https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&w=100&h=100&fit=crop"
                alt="Get Insights"
              />
            </div>
            <div className="about-step-title">STEP—03</div>
            <h3>Get Insights & Improve</h3>
            <p>
              Receive detailed insights and recommendations to improve code
              quality, reduce duplication, and optimize memory usage.
            </p>
            <a href="#" className="about-learn">
              Learn More →
            </a>
          </div>

        </div>
      </div>
    </section>

    </main>
    </>
  )
}

export default Headers
