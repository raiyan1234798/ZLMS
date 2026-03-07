
"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_COMPANIES, getCoursesByCompany } from '@/data/mockDb';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { Plus, Wand2, X } from 'lucide-react';

export default function CourseManagement() {
    const params = useParams();
    const router = useRouter();
    const domain = params.domain as string;
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const courses = company ? getCoursesByCompany(company.id) : [];

    // Build Kanban data dynamically
    const items: Record<string, { id: string; content: string }> = {};
    const columnAvailable: string[] = [];
    const columnAssigned: string[] = [];
    const columnArchived: string[] = [];

    courses.forEach(course => {
        items[course.id] = { id: course.id, content: course.title };
        if (course.status === 'AVAILABLE') columnAvailable.push(course.id);
        else if (course.status === 'ASSIGNED') columnAssigned.push(course.id);
        else columnArchived.push(course.id);
    });

    const columns = {
        available: { id: 'available', title: '📂 Available Courses', itemIds: columnAvailable },
        assigned: { id: 'assigned', title: '✅ Assigned Courses', itemIds: columnAssigned },
        archived: { id: 'archived', title: '📁 Archived Courses', itemIds: columnArchived },
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Course Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Drag courses between columns to assign or archive them.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}>
                        <Wand2 size={16} /> AI Course Builder
                    </button>
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--tenant-primary, var(--primary))' }} onClick={() => router.push(`/company/${domain}/admin/courses/create`)}>
                        <Plus size={16} /> Create Course
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="card" style={{ borderLeft: `4px solid var(--tenant-primary, var(--primary))`, padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Available</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{columnAvailable.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Assigned</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{columnAssigned.length}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #94a3b8', padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Archived</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{columnArchived.length}</div>
                </div>
            </div>

            {/* Kanban */}
            <div className="card">
                <KanbanBoard initialColumns={columns} items={items} />
            </div>
        </div>
    );
}
