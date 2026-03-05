"use client";

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES, getCoursesByCompany } from '@/data/mockDb';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { Plus, Wand2, X } from 'lucide-react';

export default function CourseManagement() {
    const params = useParams();
    const domain = params.domain as string;
    const company = MOCK_COMPANIES.find(c => c.subdomain === domain);
    const courses = company ? getCoursesByCompany(company.id) : [];
    const [showModal, setShowModal] = useState(false);

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
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--tenant-primary, var(--primary))' }} onClick={() => setShowModal(true)}>
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

            {/* Create Course Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px'
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '600px',
                        maxHeight: '80vh', overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '1.3rem' }}>Create New Course</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                <X size={24} color="var(--text-muted)" />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Course Title *</label>
                                <input type="text" placeholder="e.g. Advanced React Patterns" style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                                    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
                                }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Description *</label>
                                <textarea placeholder="Describe the course..." rows={3} style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                                    fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit', resize: 'vertical'
                                }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Category</label>
                                    <select style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                                        fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
                                    }}>
                                        <option>Technology</option>
                                        <option>Sales & Marketing</option>
                                        <option>Compliance</option>
                                        <option>Leadership</option>
                                        <option>Onboarding</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '6px', color: 'var(--text-muted)' }}>Difficulty</label>
                                    <select style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)',
                                        fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
                                    }}>
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button className="btn-secondary" style={{ flex: 1, padding: '12px' }} onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn-primary" style={{ flex: 1, padding: '12px', background: 'var(--tenant-primary, var(--primary))' }} onClick={() => setShowModal(false)}>Create Course</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
