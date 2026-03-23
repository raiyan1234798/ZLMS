
"use client";
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getLearnersForCompany, getCoursesByCompany } from '@/data/mockDb';
import { Award, Download, Search } from 'lucide-react';

export default function CertificatesPage() {
    const { domain } = useParams() as { domain: string };
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const learners = company ? getLearnersForCompany(company.id) : [];
    const courses = company ? getCoursesByCompany(company.id) : [];

    const certificates = learners.flatMap(user =>
        courses.filter(c => c.status === 'ASSIGNED').map((course, i) => ({
            id: `cert-${user.id}-${course.id}`,
            userName: user.name,
            courseName: course.title,
            issuedDate: `Feb ${10 + i}, 2026`,
            score: 75 + ((i * 13 + 5) % 25),
        }))
    ).slice(0, 8);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Certificates</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{certificates.length} certificates issued at {company?.name}.</p>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={22} color="#f59e0b" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{certificates.length}</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certificates Issued</div></div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={22} color="#10b981" /></div>
                    <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{Math.round(certificates.reduce((a, c) => a + c.score, 0) / (certificates.length || 1))}%</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Score</div></div>
                </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr style={{ background: 'var(--background)' }}>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Learner</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Course</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Score</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Issued</th>
                        <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Action</th>
                    </tr></thead>
                    <tbody>
                        {certificates.map(cert => (
                            <tr key={cert.id} style={{ borderTop: '1px solid var(--border)' }}>
                                <td style={{ padding: '14px 24px', fontWeight: 500 }}>{cert.userName}</td>
                                <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cert.courseName}</td>
                                <td style={{ padding: '14px 24px' }}><span style={{ fontWeight: 600, color: cert.score >= 80 ? '#10b981' : '#f59e0b' }}>{cert.score}%</span></td>
                                <td style={{ padding: '14px 24px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{cert.issuedDate}</td>
                                <td style={{ padding: '14px 24px' }}><button className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}><Download size={12} /> PDF</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
