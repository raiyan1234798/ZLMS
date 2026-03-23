"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Video, FileQuestion, PlayCircle, Link as LinkIcon, UploadCloud, List, Type, Check, FileCheck, MonitorPlay, LayoutGrid, Building2, Layers } from 'lucide-react';
import { addDoc, collection, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationService } from '@/lib/notificationService';

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
    type: "video" | "quiz" | "module";
    videoSource?: string;
    videoUrl?: string;
    description?: string;
    resourceLinks?: string;
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

export default function GlobalCourseStudioPage() {
    const router = useRouter();
    const videoUploadRef = useRef<HTMLInputElement>(null);
    const resourceUploadRef = useRef<HTMLInputElement>(null);

    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploadingResource, setUploadingResource] = useState(false);

    const [lessons, setLessons] = useState<Lesson[]>([
        { id: 1, title: 'Introduction', type: 'video', videoSource: 'youtube', videoUrl: '' },
    ]);
    const [selectedLessonId, setSelectedLessonId] = useState<number>(1);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const q = query(collection(db, 'companies'));
                const snap = await getDocs(q);
                const comps: any[] = [];
                snap.forEach(doc => comps.push({ id: doc.id, ...doc.data() }));
                setCompanies(comps);
            } catch (err) {
                console.warn("Error fetching companies:", err);
            }
        };
        fetchCompanies();
    }, []);

    const activeLesson = lessons.find(l => l.id === selectedLessonId);

    const addLesson = (type: "video" | "quiz" | "module") => {
        const nl: Lesson = {
            id: Date.now(),
            title: type === 'module' ? 'New Module' : `New ${type === 'video' ? 'Lesson' : 'Quiz'}`,
            type,
            ...(type === 'module' ? {} : type === 'quiz' ? { questions: [] } : { videoSource: 'youtube', videoUrl: '', description: '', resourceLinks: '' })
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

    const handleResourceUpload = async (files: File[]) => {
        if (files.length === 0 || !activeLesson) return;
        setUploadingResource(true);
        try {
            const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
            const { storage } = await import('@/lib/firebase');
            
            let newLinks = activeLesson.resourceLinks || '';
            for (const file of files) {
                const storageRef = ref(storage, `course_resources/${Date.now()}_${file.name}`);
                const uploadTask = uploadBytesResumable(storageRef, file);
                
                await new Promise((resolve, reject) => {
                    uploadTask.on('state_changed', 
                        null, 
                        (error) => reject(error), 
                        () => resolve(uploadTask.snapshot.ref)
                    );
                });
                
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                newLinks += `${newLinks ? '\n' : ''}${downloadURL}`;
            }
            updateActiveLesson({ resourceLinks: newLinks });
        } catch (err) {
            console.error("Resource upload error:", err);
            alert("Failed to upload resource. Ensure you have the proper permissions.");
        } finally {
            setUploadingResource(false);
        }
    };

    const handleSave = async () => {
        if (!courseTitle.trim()) { alert("Course title is required."); return; }
        if (!selectedCompanyId) { alert("Please select a target company."); return; }
        
        setSaving(true);
        try {
            const company = companies.find(c => c.id === selectedCompanyId);

            const modulesToSave: any[] = [];
            let currentModule: any = { id: `m_${Date.now()}`, title: 'Course Content', lessons: [] };

            lessons.forEach((l) => {
                if (l.type === 'module') {
                    if (currentModule.lessons.length > 0) modulesToSave.push(currentModule);
                    currentModule = { id: `m_${l.id}`, title: l.title, lessons: [] };
                } else {
                    currentModule.lessons.push({
                        id: l.id,
                        title: l.title,
                        type: l.type,
                        videoSource: l.videoSource || null,
                        videoUrl: l.videoUrl || null,
                        description: l.description || '',
                        resourceLinks: l.resourceLinks || '',
                        questions: l.questions?.map(q => ({
                            type: q.type,
                            text: q.text,
                            options: q.options || [],
                            correctAnswer: q.correctAnswer || ''
                        })) || []
                    });
                }
            });
            if (currentModule.lessons.length > 0 || modulesToSave.length === 0) {
                modulesToSave.push(currentModule);
            }

            const courseData = {
                title: courseTitle,
                description: courseDescription,
                domain: company?.subdomain || 'global',
                companyId: selectedCompanyId,
                companyName: company?.name || 'Platform Global',
                modules: modulesToSave,
                status: 'AVAILABLE',
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'courses'), courseData);

            // Trigger Notification
            if (company) {
                await NotificationService.notifyNewCourse(courseTitle, company.id, company.name);
            }

            setSaved(true);
            setTimeout(() => { setSaved(false); router.push(`/admin/courses`); }, 1500);
        } catch (err) {
            console.warn(err);
            alert('Failed to save course. Check console for details.');
        }
        setSaving(false);
    };

    const ytId = activeLesson?.type === 'video' && activeLesson.videoSource !== 'local' ? extractYouTubeId(activeLesson.videoUrl || '') : null;

    // Styles
    const cardS: React.CSSProperties = { background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' };
    const tabBtnS = (active: boolean): React.CSSProperties => ({
        padding: '6px 14px', borderRadius: '8px', border: 'none', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
        background: active ? '#4f46e5' : 'var(--surface)',
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
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Global Course Creator</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create and assign training programs to platform tenants.</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px', border: 'none', background: saved ? '#10b981' : '#4f46e5', color: 'white', fontWeight: 600, fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}>
                    {saved ? <><FileCheck size={18} /> Saved!</> : <><Save size={18} /> {saving ? 'Saving...' : 'Deploy Course'}</>}
                </button>
            </div>

            {/* Course Info + Company Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', marginBottom: '24px' }}>
                <div style={cardS}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Course Title *</label>
                            <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Master Platform Fundamentals" style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '1rem', fontWeight: 600, background: 'var(--surface)', outline: 'none' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                            <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} placeholder="Describe what students will learn..." rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.9rem', background: 'var(--surface)', resize: 'vertical', outline: 'none' }} />
                        </div>
                    </div>
                </div>

                <div style={cardS}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <Building2 size={18} color="#4f46e5" />
                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Target Assignment</h3>
                    </div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Select Tenant Company</label>
                    <select 
                        value={selectedCompanyId} 
                        onChange={e => setSelectedCompanyId(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--surface)', outline: 'none', fontWeight: 500 }}
                    >
                        <option value="">-- Choose Company --</option>
                        {companies.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Assigning a course will make it immediately available in the tenant's repository.
                    </p>
                </div>
            </div>

            {/* Main Grid: Editor + Module Structure */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

                {/* Left: Lesson Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {activeLesson ? (
                        <>
                            {/* Title Card */}
                            <div style={cardS}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    {activeLesson.type === 'video' ? <Video size={20} color="#4f46e5" /> : 
                                     activeLesson.type === 'quiz' ? <FileQuestion size={20} color="#10b981" /> :
                                     <Layers size={20} color="#f59e0b" />}
                                    <input type="text" value={activeLesson.title} onChange={e => updateActiveLesson({ title: e.target.value })} placeholder={`Enter ${activeLesson.type} title...`} style={{ flex: 1, fontSize: '1.2rem', fontWeight: 700, border: 'none', background: 'transparent', outline: 'none', color: 'var(--foreground)' }} />
                                </div>
                            </div>

                            {activeLesson.type === 'module' ? (
                                <div style={{ ...cardS, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    <Layers size={48} color="#f59e0b" style={{ opacity: 0.2, marginBottom: '20px' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--foreground)', marginBottom: '8px' }}>Module Header</h3>
                                    <p style={{ maxWidth: '400px', lineHeight: 1.5 }}>This acts as a structural section in your curriculum. Any lessons or quizzes placed below this will be grouped under this module.</p>
                                </div>
                            ) : activeLesson.type === 'video' ? (
                                /* Video Editor */
                                <div style={cardS}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <MonitorPlay size={20} color="#4f46e5" />
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

                                    {/* Description and Resources inside the Video section */}
                                    <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Lesson Description</label>
                                            <textarea value={activeLesson.description || ''} onChange={e => updateActiveLesson({ description: e.target.value })} placeholder="What is covered in this video lesson?" rows={3} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.9rem', outline: 'none', resize: 'vertical' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Resources (PDFs, Drive URLs, GitHub Links)</label>
                                            
                                            <div 
                                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                                                onDrop={e => { e.preventDefault(); e.stopPropagation(); handleResourceUpload(Array.from(e.dataTransfer.files)); }}
                                                onClick={() => !uploadingResource && resourceUploadRef.current?.click()}
                                                style={{ 
                                                    width: '100%', padding: '24px', borderRadius: '10px', border: '2px dashed var(--border)', 
                                                    background: 'var(--surface)', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                                                    justifyContent: 'center', cursor: 'pointer', marginBottom: '12px', transition: 'all 0.2s' 
                                                }}
                                            >
                                                <input type="file" multiple ref={resourceUploadRef} onChange={e => handleResourceUpload(Array.from(e.target.files || []))} style={{ display: 'none' }} title="Upload Resource File" />
                                                <UploadCloud size={28} color="var(--text-muted)" style={{ marginBottom: '8px' }} />
                                                <div style={{ fontWeight: 600 }}>{uploadingResource ? 'Uploading...' : 'Drag & drop files here, or click to select'}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>PDF docs, images, or valid attachments</div>
                                            </div>

                                            <textarea value={activeLesson.resourceLinks || ''} onChange={e => updateActiveLesson({ resourceLinks: e.target.value })} placeholder="Add one link per line... (Uploaded file links will appear here automatically)" rows={4} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background)', fontSize: '0.85rem', outline: 'none', resize: 'vertical', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }} />
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>These links will be shown under the video player for learners to access.</p>
                                        </div>
                                    </div>

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
                                                    <span style={{ background: '#4f46e5', color: 'white', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>{idx + 1}</span>
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
                                                            <button onClick={() => updateQuestion(q.id, { options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] })} style={{ fontSize: '0.8rem', color: '#4f46e5', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
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
                            <LayoutGrid size={20} color="#4f46e5" />
                            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>Module Structure</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {lessons.map(item => {
                                const isModule = item.type === 'module';
                                return (
                                <div key={item.id} onClick={() => setSelectedLessonId(item.id)} style={{
                                    padding: isModule ? '16px 12px' : '12px', 
                                    borderRadius: '12px', 
                                    border: `1px solid ${selectedLessonId === item.id ? '#4f46e5' : isModule ? '#333' : 'var(--border)'}`,
                                    background: selectedLessonId === item.id ? '#4f46e508' : isModule ? '#1a1a1a' : 'var(--surface)',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    marginLeft: isModule ? '0' : '20px',
                                    color: isModule ? 'white' : 'inherit'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: isModule ? '24px' : '32px', height: isModule ? '24px' : '32px', 
                                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            background: selectedLessonId === item.id || isModule ? '#4f46e5' : 'var(--background)',
                                            color: selectedLessonId === item.id || isModule ? 'white' : 'var(--text-muted)'
                                        }}>
                                            {item.type === 'video' ? <PlayCircle size={16} /> : item.type === 'quiz' ? <FileQuestion size={16} /> : <Layers size={14} />}
                                        </div>
                                        <div style={{ overflow: 'hidden' }}>
                                            <div style={{ fontSize: isModule ? '0.95rem' : '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</div>
                                            {!isModule && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.type === 'video' ? 'Video Lesson' : 'Interactive Quiz'}</div>}
                                        </div>
                                    </div>
                                    <button onClick={e => deleteLessonItem(e, item.id)} title={`Delete ${item.type}`} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#ef4444', opacity: 0.6, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )})}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <button onClick={() => addLesson('module')} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px dashed var(--border)', background: 'transparent', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, transition: 'background 0.2s' }}>
                                <Layers size={14} /> Add Module Section
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
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
        </div>
    );
}

