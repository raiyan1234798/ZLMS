"use client";

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Video, FileQuestion, PlayCircle, Link as LinkIcon, UploadCloud, List, Type, Check, FileCheck, MonitorPlay, LayoutGrid } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Question = {
    id: number;
    type: "typable" | "multichoice";
    text: string;
    options?: string[];
    correctAnswer?: string;
};

type Lesson = {
    id: number;
    title: string;
    type: "video" | "quiz";
    videoSource?: string;
    videoUrl?: string;
    questions?: Question[];
};

function extractYouTubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return m[1];
    }
    return null;
}

export default function CourseStudioPage() {
    const params = useParams();
    const router = useRouter();
    const domain = params.domain as string;
    const videoUploadRef = useRef<HTMLInputElement>(null);

    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [lessons, setLessons] = useState<Lesson[]>([
        { id: 1, title: 'Introduction', type: 'video', videoSource: 'youtube', videoUrl: '' },
    ]);
    const [selectedLessonId, setSelectedLessonId] = useState<number>(1);

    const activeLesson = lessons.find(l => l.id === selectedLessonId);

    const addLesson = (type: "video" | "quiz") => {
        const nl: Lesson = {
            id: Date.now(),
            title: `New ${type === 'video' ? 'Lesson' : 'Quiz'}`,
            type,
            ...(type === 'quiz' ? { questions: [] } : { videoSource: 'youtube', videoUrl: '' })
        };
        setLessons([...lessons, nl]);
        setSelectedLessonId(nl.id);
    };

    const updateActiveLesson = (u: Partial<Lesson>) =>
        setLessons(lessons.map(l => l.id === selectedLessonId ? { ...l, ...u } : l));

    const deleteLessonItem = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const remaining = lessons.filter(l => l.id !== id);
        setLessons(remaining);
        if (selectedLessonId === id) setSelectedLessonId(remaining[0]?.id || 0);
    };

    // Quiz helpers
    const addQuestion = (type: "typable" | "multichoice") => {
        if (activeLesson?.type !== 'quiz') return;
        const nq: Question = {
            id: Date.now(), type, text: '',
            options: type === 'multichoice' ? ['Option 1', 'Option 2', 'Option 3', 'Option 4'] : undefined
        };
        updateActiveLesson({ questions: [...(activeLesson.questions || []), nq] });
    };

    const updateQuestion = (qId: number, u: Partial<Question>) => {
        if (activeLesson?.type !== 'quiz' || !activeLesson.questions) return;
        updateActiveLesson({ questions: activeLesson.questions.map(q => q.id === qId ? { ...q, ...u } : q) });
    };

    const deleteQuestion = (qId: number) => {
        if (activeLesson?.type !== 'quiz' || !activeLesson.questions) return;
        updateActiveLesson({ questions: activeLesson.questions.filter(q => q.id !== qId) });
    };

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) updateActiveLesson({ videoUrl: URL.createObjectURL(e.target.files[0]) });
    };

    const handleSave = async () => {
        if (!courseTitle.trim()) { alert("Course title is required."); return; }
        setSaving(true);
        try {
            await addDoc(collection(db, 'courses'), {
                title: courseTitle,
                description: courseDescription,
                domain,
                lessons: lessons.map(l => ({
                    title: l.title,
                    type: l.type,
                    videoSource: l.videoSource || null,
                    videoUrl: l.videoUrl || null,
                    questions: l.questions?.map(q => ({
                        type: q.type,
                        text: q.text,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer || ''
                    })) || []
                })),
                status: 'AVAILABLE',
                createdAt: serverTimestamp()
            });
            setSaved(true);
            setTimeout(() => { setSaved(false); router.push(`/company/${domain}/admin/courses`); }, 1500);
        } catch (err) {
            console.error(err);
            alert('Failed to save course. Check console for details.');
        }
        setSaving(false);
    };

    const ytId = activeLesson?.type === 'video' && activeLesson.videoSource !== 'local' ? extractYouTubeId(activeLesson.videoUrl || '') : null;

    // Styles
    const cardS: React.CSSProperties = { background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
    const tabBtnS = (active: boolean): React.CSSProperties => ({
        padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        background: active ? 'var(--tenant-primary, #7c3aed)' : 'var(--surface)',
        color: active ? 'white' : 'var(--text-muted)',
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', backgroundColor: 'var(--surface)' }} title="Go back">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Course Studio</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Record, edit, assemble training materials, and build quizzes.</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', background: saved ? '#10b981' : 'var(--tenant-primary, #7c3aed)', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}>
                    {saved ? <><FileCheck size={18} /> Saved!</> : <><Save size={18} /> {saving ? 'Saving...' : 'Save Draft'}</>}
                </button>
            </div>

            {/* Course Info */}
            <div style={{ ...cardS, marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Course Title *</label>
                        <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Introduction to Luxury Closing" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600, background: 'var(--surface)', outline: 'none' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                        <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder="Describe what students will learn..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', background: 'var(--surface)', resize: 'vertical', outline: 'none' }} />
                    </div>
                </div>
            </div>

            {/* Main Grid: Editor + Module Structure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>

                {/* Left: Lesson Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {activeLesson ? (
                        <>
                            {/* Title Card */}
                            <div style={cardS}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {activeLesson.type === 'video' ? <Video size={20} color="var(--tenant-primary, #7c3aed)" /> : <FileQuestion size={20} color="#10b981" />}
                                    <input type="text" value={activeLesson.title} onChange={e => updateActiveLesson({ title: e.target.value })} placeholder="Enter lesson title..." style={{ flex: 1, fontSize: '1.2rem', fontWeight: 700, border: 'none', background: 'transparent', outline: 'none', color: 'var(--foreground)' }} />
                                </div>
                            </div>

                            {activeLesson.type === 'video' ? (
                                /* Video Editor */
                                <div style={cardS}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <MonitorPlay size={20} color="var(--tenant-primary, #7c3aed)" />
                                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Video Source</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            {['local', 'youtube', 'drive', 'github'].map(src => (
                                                <button key={src} onClick={() => updateActiveLesson({ videoSource: src })} style={tabBtnS(activeLesson.videoSource === src)}>
                                                    {src.charAt(0).toUpperCase() + src.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {activeLesson.videoSource === 'local' ? (
                                        <div onClick={() => !activeLesson.videoUrl && videoUploadRef.current?.click()} style={{ width: '100%', aspectRatio: '16/9', background: 'var(--surface)', borderRadius: '12px', border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative', overflow: 'hidden' }}>
                                            <input type="file" accept="video/*" ref={videoUploadRef} onChange={handleVideoUpload} style={{ display: 'none' }} />
                                            {activeLesson.videoUrl ? (
                                                <>
                                                    <video src={activeLesson.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', background: 'black' }} controls />
                                                    <button onClick={(e) => { e.stopPropagation(); updateActiveLesson({ videoUrl: '' }); }} title="Remove video" style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(239,68,68,0.8)', color: 'white', padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <UploadCloud size={28} color="var(--text-muted)" />
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <p style={{ fontWeight: 600 }}>Click to upload or drag files</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MP4, WebM up to 2GB</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <LinkIcon size={18} color="var(--text-muted)" />
                                                <input type="text" value={activeLesson.videoUrl || ''} onChange={e => updateActiveLesson({ videoUrl: e.target.value })} placeholder={`Paste ${activeLesson.videoSource} video link here...`} style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem', outline: 'none' }} />
                                            </div>
                                            {ytId ? (
                                                <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                                                    <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${ytId}?rel=0`} title={activeLesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ background: 'black' }} />
                                                </div>
                                            ) : activeLesson.videoUrl ? (
                                                <div style={{ padding: '12px 16px', background: '#fef3c7', color: '#92400e', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <LinkIcon size={16} /> Link saved. Paste a valid YouTube URL to see preview.
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Quiz Editor */
                                <div style={cardS}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <FileQuestion size={20} color="#10b981" />
                                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Questions Manager</h3>
                                        </div>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button onClick={() => addQuestion('multichoice')} style={{ ...tabBtnS(false), display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <List size={14} /> Multi-Choice
                                            </button>
                                            <button onClick={() => addQuestion('typable')} style={{ ...tabBtnS(false), display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Type size={14} /> Typable
                                            </button>
                                        </div>
                                    </div>

                                    {!activeLesson.questions?.length && (
                                        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', borderRadius: '12px', border: '2px dashed var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>
                                            No questions added yet. Click Multi-Choice or Typable to begin.
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {activeLesson.questions?.map((q, idx) => (
                                            <div key={q.id} style={{ padding: '20px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)' }}>
                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
                                                    <span style={{ background: 'var(--tenant-primary, #7c3aed)', color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{idx + 1}</span>
                                                    <input type="text" placeholder="Enter question text..." value={q.text} onChange={e => updateQuestion(q.id, { text: e.target.value })} style={{ flex: 1, border: 'none', borderBottom: '2px solid var(--border)', background: 'transparent', paddingBottom: '6px', fontWeight: 600, fontSize: '0.95rem', outline: 'none' }} />
                                                    <button onClick={() => deleteQuestion(q.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} title="Delete question">
                                                        <Trash2 size={16} color="#ef4444" />
                                                    </button>
                                                </div>

                                                <div style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {q.type === 'multichoice' ? (
                                                        <>
                                                            {q.options?.map((opt, oIdx) => (
                                                                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${q.correctAnswer === opt ? '#10b981' : 'var(--border)'}`, background: q.correctAnswer === opt ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                        {q.correctAnswer === opt && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                                                                    </div>
                                                                    <input type="text" value={opt} onChange={e => { const no = [...(q.options || [])]; no[oIdx] = e.target.value; updateQuestion(q.id, { options: no }); }} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.85rem', outline: 'none' }} />
                                                                    <button onClick={() => updateQuestion(q.id, { correctAnswer: opt })} style={{ fontSize: '0.75rem', fontWeight: 600, color: q.correctAnswer === opt ? '#10b981' : 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                                                        {q.correctAnswer === opt ? '✓ Correct' : 'Mark Correct'}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button onClick={() => updateQuestion(q.id, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })} style={{ fontSize: '0.8rem', color: 'var(--tenant-primary, #7c3aed)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                                <Plus size={14} /> Add Option
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <textarea placeholder="Exact typable answer to validate against..." value={q.correctAnswer || ''} onChange={e => updateQuestion(q.id, { correctAnswer: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.85rem', resize: 'vertical', outline: 'none', minHeight: '60px' }} />
                                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>Users will type their answer. It will be verified against what you enter above.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ ...cardS, height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Select a lesson or quiz from the structure panel to edit.
                        </div>
                    )}
                </div>

                {/* Right: Module Structure */}
                <div>
                    <div style={cardS}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <LayoutGrid size={20} color="var(--tenant-primary, #7c3aed)" />
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Module Structure</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {lessons.map(item => (
                                <div key={item.id} onClick={() => setSelectedLessonId(item.id)} style={{
                                    padding: '12px', borderRadius: '12px', border: `1px solid ${selectedLessonId === item.id ? 'var(--tenant-primary, #7c3aed)' : 'var(--border)'}`,
                                    background: selectedLessonId === item.id ? 'var(--tenant-primary, #7c3aed)08' : 'var(--surface)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            background: selectedLessonId === item.id ? 'var(--tenant-primary, #7c3aed)' : 'var(--background)',
                                            color: selectedLessonId === item.id ? 'white' : 'var(--text-muted)'
                                        }}>
                                            {item.type === 'video' ? <PlayCircle size={16} /> : <FileQuestion size={16} />}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.type === 'video' ? 'Video Lesson' : 'Interactive Quiz'}</div>
                                        </div>
                                    </div>
                                    <button onClick={e => deleteLessonItem(e, item.id)} title="Delete lesson" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#ef4444', opacity: 0.6, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <button onClick={() => addLesson('video')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, transition: 'background 0.2s' }}>
                                <Video size={14} /> Add Video
                            </button>
                            <button onClick={() => addLesson('quiz')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, transition: 'background 0.2s' }}>
                                <FileQuestion size={14} /> Add Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
