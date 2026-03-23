"use client";

import { KanbanBoard } from '@/components/ui/KanbanBoard';

export default function FeatureManagement() {
    const allFeatures = {
        f1: { id: 'f1', content: 'Courses' },
        f2: { id: 'f2', content: 'Video Learning' },
        f3: { id: 'f3', content: 'Inline Quizzes' },
        f4: { id: 'f4', content: 'Assignments' },
        f5: { id: 'f5', content: 'Certificates' },
        f6: { id: 'f6', content: 'Analytics' },
        f7: { id: 'f7', content: 'Reports' },
        f8: { id: 'f8', content: 'Teams / Departments' },
        f9: { id: 'f9', content: 'Leaderboards' },
        f10: { id: 'f10', content: 'Gamification' },
        f11: { id: 'f11', content: 'Surveys' },
        f12: { id: 'f12', content: 'Discussion Forums' },
        f13: { id: 'f13', content: 'Notifications' },
        f14: { id: 'f14', content: 'AI Tools' },
    };

    const columns = {
        available: {
            id: 'available',
            title: '🟡 Available Features',
            itemIds: ['f9', 'f10', 'f11', 'f12', 'f14'],
        },
        enabled: {
            id: 'enabled',
            title: '🟢 Enabled Features',
            itemIds: ['f1', 'f2', 'f3', 'f5', 'f6', 'f13'],
        },
        disabled: {
            id: 'disabled',
            title: '🔴 Disabled Features',
            itemIds: ['f4', 'f7', 'f8'],
        },
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Feature Management</h1>
                <p style={{ color: 'var(--text-muted)' }}>Drag and drop features to enable or disable them platform-wide. Each company can have different feature sets.</p>
            </div>

            {/* Info cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div className="card" style={{ borderLeft: '4px solid #f59e0b', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Available</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>5</div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Ready to enable</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Enabled</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>6</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Active on platform</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #ef4444', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Disabled</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>3</div>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Turned off</div>
                </div>
            </div>

            <div className="card">
                <KanbanBoard initialColumns={columns} items={allFeatures} />
            </div>
        </div>
    );
}
