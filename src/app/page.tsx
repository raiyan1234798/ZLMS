'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/authContext';

export default function RootPage() {
  const { user, loading } = useAuth();
  const isSuperAdmin = user?.email === 'abubackerraiyan@gmail.com';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <header className="glass-panel" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <h2 style={{ color: 'var(--primary)', fontWeight: 700 }}>Z LMS</h2>
        <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="#features" style={{ fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ fontWeight: 500 }}>Pricing</a>
          {!loading ? (
            isSuperAdmin ? (
              <Link href="/admin" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Dashboard</Link>
            ) : (
              <Link href="/admin/login" className="btn-secondary" style={{ padding: '8px 20px', fontSize: '14px' }}>Platform Login</Link>
            )
          ) : null}
        </nav>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '120px 20px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '24px' }}>
          🚀 Enterprise SaaS LMS Platform
        </div>
        <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '24px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Launch Your Own Branded Learning Platform
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px' }}>
          White-label LMS with strict multi-tenant isolation. Each company gets its own branded environment, courses, analytics, and users.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>Request Access</button>
          <button className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '12px' }}>View Demo</button>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '60px', maxWidth: '500px', margin: '0 auto 60px' }}>Built for scale. Designed for enterprise.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {[
            { icon: '🏢', title: 'Multi-Tenant', desc: 'Complete data isolation per company with subdomain routing.' },
            { icon: '🎨', title: 'White-Label Branding', desc: 'Custom logos, colors, and dashboard titles per tenant.' },
            { icon: '📚', title: 'Course Builder', desc: 'Modules, lessons, video learning, and inline quizzes.' },
            { icon: '🤖', title: 'AI Course Builder', desc: 'Generate course outlines and quiz questions with AI.' },
            { icon: '📊', title: 'Enterprise Analytics', desc: 'Track completion rates, progress, and engagement.' },
            { icon: '🏆', title: 'Certificates', desc: 'Auto-generate branded certificates on course completion.' },
            { icon: '🔐', title: 'Role-Based Access', desc: 'Super Admin, Company Admin, Trainer, and User roles.' },
            { icon: '📱', title: 'Mobile Responsive', desc: 'Full mobile support for dashboards and course player.' },
            { icon: '⚡', title: 'Feature Control', desc: 'Kanban-based feature toggling per company.' },
          ].map((f, i) => (
            <div key={i} className="card" style={{ padding: '32px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 24px', background: 'linear-gradient(180deg, var(--background), #eef2ff)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '16px' }}>Subscription Plans</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '60px', maxWidth: '500px', margin: '0 auto 60px' }}>Choose the plan that fits your company.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
          {[
            { name: 'Basic', price: '$49', features: ['Up to 50 users', '5 courses', 'Email support', 'Basic analytics'] },
            { name: 'Professional', price: '$149', features: ['Up to 500 users', 'Unlimited courses', 'Video learning', 'Certificates', 'Priority support'], popular: true },
            { name: 'Enterprise', price: '$499', features: ['Unlimited users', 'Unlimited courses', 'AI Course Builder', 'Custom branding', 'Dedicated support', 'SSO Integration'] },
          ].map((plan, i) => (
            <div key={i} className="card" style={{
              padding: '40px 32px',
              textAlign: 'center',
              position: 'relative',
              border: plan.popular ? '2px solid var(--primary)' : '1px solid var(--border)',
              transform: plan.popular ? 'scale(1.05)' : 'none',
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 16px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600 }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{plan.name}</h3>
              <p style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '8px' }}>{plan.price}</p>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>per month</p>
              <ul style={{ listStyle: 'none', textAlign: 'left', marginBottom: '32px' }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    ✓ {f}
                  </li>
                ))}
              </ul>
              <button className={plan.popular ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%', padding: '12px' }}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Links */}
      <section style={{ padding: '80px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ marginBottom: '12px' }}>Try Live Demo Tenants</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto' }}>Experience the multi-tenant isolation. Each company has its own branding, users, and courses.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            { name: 'Global IT Academy', subdomain: 'globalit', color: '#3b82f6', icon: '💻', desc: '6 users · 3 courses · Tech training' },
            { name: 'Acme Corp Sales', subdomain: 'acme', color: '#ef4444', icon: '📈', desc: '5 users · 3 courses · Sales enablement' },
            { name: 'Skyline Real Estate', subdomain: 'skyline', color: '#10b981', icon: '🏢', desc: '5 users · 2 courses · Real estate licensing' },
            { name: 'TravelPro Agency', subdomain: 'travelpro', color: '#8b5cf6', icon: '✈️', desc: '4 users · 2 courses · Travel certifications' },
            { name: 'MedLearn Health', subdomain: 'medlearn', color: '#06b6d4', icon: '🏥', desc: '5 users · 3 courses · Healthcare compliance' },
            { name: 'NovaTech Solutions', subdomain: 'novatech', color: '#f59e0b', icon: '⚡', desc: '2 users · Suspended account', suspended: true },
          ].map((company, i) => (
            <Link key={i} href={`/company/${company.subdomain}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ padding: '24px', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'pointer', opacity: company.suspended ? 0.6 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: company.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    {company.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{company.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{company.subdomain}.zlms.com</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{company.desc}</p>
                {company.suspended && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>⚠ Account Suspended</span>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          {!loading && isSuperAdmin && (
            <Link href="/admin" className="btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Open Super Admin Dashboard →
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>© 2026 Z LMS — Multi-Tenant SaaS Learning Management System</p>
      </footer>
    </div>
  );
}
