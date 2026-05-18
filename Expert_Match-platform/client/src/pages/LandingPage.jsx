import React from 'react';
import '../styles/landing.css';

export default function LandingPage({ onGetStarted, theme, toggleTheme }) {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="landing-logo">ExpertMatch</div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#integration">Integration</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              padding: '0.5rem',
              transition: 'transform 0.3s ease'
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button type="button" className="landing-btn-login" onClick={onGetStarted}>
            Login
          </button>
        </div>
      </header>
      
      <section className="landing-hero">
        <div className="features-badge">✨ Features</div>
        <h1 className="landing-title">
          Powerful Features to<br />Simplify Your Scheduling
        </h1>
        <p className="landing-subtitle">
          Discover how our AI-driven tools can transform your<br />productivity and streamline your day
        </p>
        <div className="hero-actions" style={{ marginTop: '2.5rem' }}>
          <button type="button" className="landing-btn-primary hero-btn" onClick={onGetStarted}>
            Get Started
          </button>
        </div>
      </section>

      <section className="landing-features">
        {/* Feature 1 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="feature-tag">📅 EFFORTLESS SCHEDULING</div>
            <h2>Automate <span className="highlight-purple">Meeting</span><br />Scheduling</h2>
            <p>Our solution reduces manual effort, minimizes errors, and ensures seamless coordination, allowing you to focus on what truly matters.</p>
          </div>
          <div className="feature-visual visual-1">
            <div className="mockup-chat">
              <div className="mockup-header">Meeting with Andrew</div>
              <div className="mockup-bubble bot">Sure, I can help you schedule these tasks. Here is a potential schedule for your week.</div>
              <div className="mockup-bubble-action">
                 <div className="mockup-event">
                   <div className="event-title">Meeting with Andrew</div>
                   <div className="event-time">14:00 - 15:30</div>
                 </div>
              </div>
            </div>
            <div className="mockup-card">
              <div className="card-header">Meeting with the Candidate</div>
              <div className="card-row"><span>Time & Date</span><span>27th May, 14:00</span></div>
              <div className="card-row"><span>Guests</span><span>Andrew</span></div>
              <div className="card-row"><span>Location</span><span>Remote</span></div>
              <div className="card-row"><span>Platform</span><span>Zoom Meeting</span></div>
              <div className="card-actions">
                 <button type="button" className="btn-secondary">Reschedule</button>
                 <button type="button" className="btn-primary">Join Meeting</button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="feature-row reverse">
          <div className="feature-text">
            <div className="feature-tag">🔔 SMART REMINDERS</div>
            <h2>Get Smart <span className="highlight-purple">Alerts</span> to<br />Stay on Track</h2>
            <p>Our system ensures your tasks with intelligent notifications that alert you to important updates and deadlines.</p>
          </div>
          <div className="feature-visual visual-2">
            <div className="mockup-calendar-alerts">
              <div className="cal-alert">
                 <div className="alert-time">13:55</div>
                 <div className="alert-box">
                    <div className="alert-title">Meeting with Andrew</div>
                    <div className="alert-subtitle">14:00 - 15:30</div>
                    <div className="alert-tag">✨ AI Suggestion</div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="feature-tag">📁 TASK MANAGEMENT</div>
            <h2>Organize Your<br /><span className="highlight-purple">Tasks</span> Easily</h2>
            <p>Keep your tasks in order with minimal effort. Our tools help you quickly organize and prioritize your workload, so you can stay focused and get more done.</p>
          </div>
          <div className="feature-visual visual-3">
             <div className="mockup-kanban">
                <div className="k-col">
                   <div className="k-header">Mon 24</div>
                   <div className="k-card green">Daily Standup<br/>09:00 - 09:30</div>
                   <div className="k-card yellow">Revision UI Deal<br/>Landing Page<br/>09:30 - 10:00</div>
                   <div className="k-card blue">Duplicate Task<br/>10:00 - 11:30</div>
                </div>
                <div className="k-col">
                   <div className="k-header">Tue 25</div>
                   <div className="k-card green">Daily Standup<br/>09:00 - 09:30</div>
                   <div className="k-card red">Collect Moodboard<br/>09:30 - 11:15</div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature 4 */}
        <div className="feature-row reverse">
          <div className="feature-text">
            <div className="feature-tag">✨ PERSONALIZED EXPERIENCE</div>
            <h2>Get Personalized<br /><span className="highlight-purple">Suggestions</span></h2>
            <p>Receive customized suggestions that adapt to your behavior, optimizing your workflow and enhancing your productivity.</p>
          </div>
          <div className="feature-visual visual-4">
             <div className="mockup-timeline">
                <div className="timeline-grid">
                   <div className="t-event blue">Break & Lunch<br/>12:00 - 13:00<br/><span>✨ AI Suggestion</span></div>
                   <div className="t-event purple">Meeting with Andrew<br/>14:00 - 15:30<br/><span>✨ AI Suggestion</span></div>
                   <div className="t-event pink">Daily Report to UI D...<br/>16:00 - 16:30</div>
                </div>
             </div>
          </div>
        </div>

        {/* Feature 5 */}
        <div className="feature-row">
          <div className="feature-text">
            <div className="feature-tag">🔗 SEAMLESS INTEGRATION</div>
            <h2>Integrate with<br />Popular Apps</h2>
            <p>Connect your favorite tools and platforms to our system, ensuring a smooth and uninterrupted workflow across all your applications.</p>
          </div>
          <div className="feature-visual visual-5">
             <div className="mockup-apps">
                <div className="app-icon">📅</div>
                <div className="app-icon">☁️</div>
                <div className="app-icon">📧</div>
                <div className="app-icon">🗂️</div>
             </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="landing-pricing">
        <div className="feature-row reverse">
          <div className="feature-text">
            <h2>Simple, Transparent Pricing</h2>
            <p>No subscriptions. No hidden fees. Just pay for what you use.</p>
          </div>

          <div className="feature-visual">
            <div className="pricing-card">
              <div className="pricing-card-bg"></div>
              <div className="pricing-type">Pay As You Go</div>
              <div className="pricing-amount">
                <span className="price-currency">$</span>
                <span className="price-value">0</span>
                <span className="price-period">/base</span>
              </div>
              <p className="pricing-desc">Pay a small platform fee only when you successfully book or complete a session.</p>
              
              <ul className="pricing-list">
                <li><span className="check">✓</span> Unlimited Expert Searches</li>
                <li><span className="check">✓</span> Full Access to AI Scheduling</li>
                <li><span className="check">✓</span> Smart Alerts & Notifications</li>
                <li><span className="check">✓</span> Secure Session Chat</li>
                <li><span className="check">✓</span> Zero Monthly Commitments</li>
              </ul>
              
              <button type="button" className="landing-btn-primary stretch-btn pricing-btn" onClick={onGetStarted}>
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>
      
      <footer className="landing-footer">
        <p>© 2026 ExpertMatch. All rights reserved.</p>
      </footer>
    </div>
  );
}
