'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/authContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MOCK_COMPANIES } from '@/data/mockDb';
import {
  ArrowRight, Lock, Code, LayoutDashboard, Globe, Zap, Settings,
  Shield, BookOpen, Users, Play, ExternalLink, Palette, ArrowUpRight,
  BarChart3, Target, Award, Infinity as InfinityIcon
} from 'lucide-react';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import { GradientDots } from '@/components/ui/gradient-dots';

export default function RootPage() {
  const { user, loading } = useAuth();
  const isSuperAdmin = user?.email === 'abubackerraiyan@gmail.com';
  const [companies, setCompanies] = useState<any[]>([]);
  const [hoveredCompanyCard, setHoveredCompanyCard] = useState<number | null>(null);

  useEffect(() => {
    // Subdomain routing
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Check if there is a subdomain
    // Allowed cases: localhost, zlms.com, www.zlms.com, zlms.pages.dev
    // Subdomain cases: company.zlms.com, company.localhost, company.zlms.pages.dev
    if (parts.length >= 2) {
      if (parts[0] !== 'www' && parts[0] !== 'zlms' && parts[0] !== '127') {
        // Exclude specific domains if necessary
        window.location.href = `/company/${parts[0]}/login`;
      }
    }
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snap = await getDocs(collection(db, 'companies'));
        const fbCompanies = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const activeIds = fbCompanies.map(c => c.id);
        const combined = [
          ...fbCompanies,
          ...MOCK_COMPANIES.filter(c => !activeIds.includes(c.id))
        ];
        // Show up to 6 custom or mock companies
        setCompanies(combined.slice(0, 6));
      } catch (err) {
        console.error(err);
        setCompanies(MOCK_COMPANIES.slice(0, 6));
      }
    };
    fetchCompanies();
  }, []);

  const features = [
    { icon: <Globe size={32} />, title: "Domain Separation", desc: "Each tenant gets their own unique subdomain environment.", actionText: "View Live Companies", link: "#tenants" },
    { icon: <Zap size={32} />, title: "Live Feature Sync", desc: "Drag and drop Kanban board instantly turns platform features on/off.", actionText: "Try Admin Panel", link: "/admin" },
    { icon: <Palette size={32} />, title: "Custom Branding", desc: "Tenants can customize theme colors, landing text, and dashboard aesthetics.", actionText: "See Branding", link: "#tenants" },
    { icon: <BookOpen size={32} />, title: "Course Engine", desc: "Advanced video learning, inline quizzes, and persistent course tracking.", actionText: "Explore Courses", link: "/company/globalit/login" },
    { icon: <Shield size={32} />, title: "Access Control", desc: "Granular roles: Super Admin, Company Admin, Trainers, and Learners.", actionText: "View Users", link: "/admin/users" },
    { icon: <LayoutDashboard size={32} />, title: "Bespoke Dashboards", desc: "Responsive, tailored analytics dashboards for administrators and learners.", actionText: "View Dashboards", link: "/company/acme/login" },
  ];

  const heroVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 50, damping: 15 } }
  };

  return (
    <div className="landing-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#020617', color: '#f8fafc', overflowX: 'hidden' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .landing-root .card, .landing-root .glass-panel {
          background: rgba(15, 23, 42, 0.6) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          backdrop-filter: blur(16px);
          color: #f8fafc;
        }
        .landing-root .text-muted {
          color: #94a3b8;
        }
        .landing-root .btn-secondary {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #f8fafc;
          transition: all 0.2s ease;
        }
        .landing-root .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }
        .landing-root .feature-card { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .landing-root .feature-card:hover { transform: translateY(-10px); }
        .landing-root .feature-card:hover .card-bg-gradient { opacity: 1 !important; }
        .landing-root .feature-link { transition: all 0.3s ease; }
        .landing-root .feature-card:hover .feature-link { color: #a5b4fc !important; opacity: 1 !important; transform: translateX(5px); }
        
        .animated-bg-shape {
          position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; z-index: 0;
        }
      `}} />

      {/* Features Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <GradientDots duration={20} dotSize={6} spacing={20} colorCycleDuration={15} />
      </div>

      {/* Nav */}
      <header className="glass-panel" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, background: 'rgba(2, 6, 23, 0.7) !important', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InfinityIcon color="white" size={20} />
          </div>
          <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>Z LMS</h2>
        </div>
        <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <a href="#features" style={{ fontWeight: 500, color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Features</a>
          <a href="#tenants" style={{ fontWeight: 500, color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>Tenants</a>
          <Link href="/admin/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'white'} onMouseOut={e => e.currentTarget.style.color = '#cbd5e1'}>
            <Lock size={14} /> Login
          </Link>
        </nav>
      </header>

      {/* Hero via Shape Landing */}
      <HeroGeometric
        badge="✨ The Next Generation of E-Learning"
        title1="Launch Your Ultra Premium"
        title2="Learning Platform"
        description="The definitive white-label LMS with absolute multi-tenant architecture. Instantly provision branded environments, course workflows, and powerful analytics isolated per company."
        action={
          <Link href="#tenants" className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px -5px rgba(79, 70, 229, 0.6)', cursor: 'pointer', pointerEvents: 'auto' }}>
            Explore Live Tenants <ArrowRight size={20} />
          </Link>
        }
      />

      {/* Features */}
      <section id="features" style={{ position: 'relative', zIndex: 10, padding: '100px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 700 }}>Engineered for Scale</h2>
          <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>A unified platform delivering complete isolation and robust tools crafted precisely for the modern enterprise.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              className="card feature-card"
              style={{ position: 'relative', padding: '40px 32px', overflow: 'hidden', borderRadius: '24px' }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={itemVariants}
            >
              <div className="card-bg-gradient" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(79,70,229,0.1), transparent)', opacity: 0, transition: 'opacity 0.4s ease', pointerEvents: 'none' }} />
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '12px', color: 'white' }}>{f.title}</h3>
              <p className="text-muted" style={{ lineHeight: 1.6, marginBottom: '32px' }}>{f.desc}</p>

              <Link href={f.link} className="feature-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', fontWeight: 600, opacity: 0.9 }}>
                {f.actionText} <ArrowUpRight size={16} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Tenants Matrix */}
      <section id="tenants" style={{ position: 'relative', zIndex: 10, padding: '100px 24px', maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ padding: '60px 40px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '16px', fontWeight: 700 }}>Interactive Tenant Matrix</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto' }}>Interact directly with our dynamically provisioned sub-companies. Hover over any tenant to reveal isolated dashboards and authentication gateways.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {companies.map((company, i) => {
              const theme = company.themeColor || company.color || '#4f46e5';
              return (
                <motion.div
                  key={company.id || company.subdomain}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredCompanyCard(i)}
                  onMouseLeave={() => setHoveredCompanyCard(null)}
                  style={{
                    padding: '32px',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${hoveredCompanyCard === i ? theme + '80' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: hoveredCompanyCard === i ? `0 20px 50px -15px ${theme}40` : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: hoveredCompanyCard === i ? 'translateY(-8px)' : 'none',
                    opacity: company.status === 'SUSPENDED' ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '16px' }}>
                    <div style={{
                      width: '60px', height: '60px', borderRadius: '16px', flexShrink: 0,
                      background: `linear-gradient(135deg, ${theme}, ${theme}99)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.6rem', fontWeight: 'bold',
                      boxShadow: `0 8px 20px -5px ${theme}80`
                    }}>
                      {company.icon || company.name.charAt(0)}
                    </div>
                    <div style={{ paddingTop: '4px' }}>
                      <h3 style={{ fontSize: '1.3rem', marginBottom: '4px', color: 'white' }}>{company.name}</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Globe size={14} color={theme} /> {company.subdomain}.zlms.com
                      </p>
                    </div>
                  </div>

                  <div style={{ minHeight: '30px' }}>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, opacity: hoveredCompanyCard === i ? 0 : 1, transition: 'opacity 0.2s', position: hoveredCompanyCard === i ? 'absolute' : 'relative', visibility: hoveredCompanyCard === i ? 'hidden' : 'visible' }}>
                      {company.desc || `Access the isolated environment for ${company.name} featuring bespoke configurations.`}
                    </p>
                  </div>

                  <AnimatePresence>
                    {hoveredCompanyCard === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: 10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}
                      >
                        <Link href={`/company/${company.subdomain}/login`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: theme, color: 'white', padding: '14px', borderRadius: '12px', fontWeight: 600, textDecoration: 'none', transition: 'filter 0.2s', fontSize: '1rem' }} onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={e => e.currentTarget.style.filter = 'none'}>
                          <Users size={18} /> Login to {company.name}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {company.status === 'SUSPENDED' && (
                    <div style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#fca5a5', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                      Suspended
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '60px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.95rem', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
          <InfinityIcon size={24} color="#4f46e5" />
          <span style={{ fontWeight: 600, color: 'white', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>Z LMS</span>
        </div>
        <p>© 2026 Z LMS Architecture. Built for Multi-Tenant Enterprise Scale.</p>
      </footer>
    </div>
  );
}
