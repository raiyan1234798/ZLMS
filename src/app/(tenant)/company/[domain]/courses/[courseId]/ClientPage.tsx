"use client";

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_COMPANIES } from '@/data/mockDb';
import Link from 'next/link';
import {
    Play, Pause, SkipForward, Volume2, Maximize, ChevronLeft,
    CheckCircle, Lock, Clock, BookOpen, ChevronRight, Award,
    MessageSquare, FileText, Info, Send, Reply
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, setDoc, serverTimestamp, addDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/authContext';
import { ActivityService } from '@/lib/activityService';
import { ProgressService } from '@/lib/progressService';

export default function CoursePlayer() {
    const params = useParams();
    const domain = params.domain as string;
    const courseId = params.courseId as string;
    
    const [company, setCompany] = useState<any>(MOCK_COMPANIES.find(c => c.subdomain === domain) || null);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();
    const [isPlaying, setIsPlaying] = useState(false);
    const [showQuestion, setShowQuestion] = useState(false);
    const [answered, setAnswered] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState('');
    const [progress, setProgress] = useState(0);
    const [lessonQuizStatus, setLessonQuizStatus] = useState<'unanswered' | 'correct' | 'wrong'>('unanswered');
    const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [savingProgress, setSavingProgress] = useState(false);
    
    // Tab State
    const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'qna'>('overview');

    // Comments State
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    // New states for real video
    const [activeLessonId, setActiveLessonId] = useState('');
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Helpers for video embeds
    const extractYouTubeId = (url: string): string | null => {
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
    };

    useEffect(() => {
        const fetchCourse = async () => {
            setLoading(true);
            try {
                let compId = company?.id;
                const compQ = query(collection(db, 'companies'), where('subdomain', '==', domain));
                const compSnap = await getDocs(compQ);
                if (!compSnap.empty) {
                    compId = compSnap.docs[0].id;
                    setCompany({ id: compId, ...compSnap.docs[0].data() });
                }

                const docRef = doc(db, 'courses', courseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.domain === domain || (compId && data.companyId === compId)) {
                        const fetchedCourse: any = { id: docSnap.id, ...data };
                        
                        // Ensure modules array exists
                        if (!fetchedCourse.modules && fetchedCourse.lessons) {
                            fetchedCourse.modules = [{ id: 'm1', title: 'Content', lessons: fetchedCourse.lessons }];
                        }
                        
                        setCourse(fetchedCourse);
                    }
                }

                // Fetch real progress from Firestore
                if (user) {
                    const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
                    const progressSnap = await getDoc(progressRef);
                    if (progressSnap.exists()) {
                        const progData = progressSnap.data();
                        setCompletedLessons(progData.completedLessons || {});
                        setProgress(progData.overallProgress || 0);
                    }
                }
            } catch (err) {
                console.warn('Error fetching course or progress:', err);
            }
            setLoading(false);
        };
        fetchCourse();
    }, [courseId, domain, user]);

    const handleLessonComplete = async (lessonId: string) => {
        if (!user || !course || completedLessons[lessonId]) return;
        
        setSavingProgress(true);
        try {
            const nextCompleted = { ...completedLessons, [lessonId]: true };
            const lessonTitle = allLessons.find((l: any) => l.id === lessonId)?.title || 'Lesson';
            
            // Use unified ProgressService to save progress and handle certificate issuance
            const newProgress = await ProgressService.saveProgress(
                user.uid,
                courseId,
                course.title,
                company?.id || 'unknown',
                company?.name || 'Unknown',
                user.displayName || (user as any)?.name || 'Learner',
                nextCompleted,
                allLessons.length
            );

            setCompletedLessons(nextCompleted);
            setProgress(newProgress);
            
            // Log lesson activity (course completion is handled inside ProgressService)
            await ActivityService.logLessonCompleted(
                user?.displayName || (user as any)?.name || 'Learner',
                lessonTitle,
                course.title,
                company?.id || 'unknown',
                company?.name || 'Unknown'
            );
            
        } catch (err) {
            console.warn('Error saving progress:', err);
        } finally {
            setSavingProgress(false);
        }
    };

    useEffect(() => {
        if (course && !activeLessonId) {
            setActiveLessonId(course.modules?.[0]?.lessons?.[0]?.id || '');
        }
    }, [course, activeLessonId]);

    // Live Learning Tracker for Dashboard stats (timeSpent, lastAccessed)
    useEffect(() => {
        if (!user || !courseId || !activeLessonId || !isPlaying) return;

        // Immediately update last accessed lesson when it changes
        const updateLastAccessed = async () => {
            try {
                const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
                await setDoc(progressRef, {
                    lastAccessedLesson: activeLessonId,
                    lastAccessedTime: new Date().toISOString()
                }, { merge: true });
            } catch (err) {
                console.warn("Failed to update last accessed lesson:", err);
            }
        };
        updateLastAccessed();

        // Interval to increment time spent
        const interval = setInterval(async () => {
            try {
                const progressRef = doc(db, 'users', user.uid, 'progress', courseId);
                const progressSnap = await getDoc(progressRef);
                
                let timeToday = 0;
                let timeTotal = 0;
                
                if (progressSnap.exists()) {
                    const data = progressSnap.data();
                    timeToday = data.timeSpent?.today || 0;
                    timeTotal = data.timeSpent?.total || 0;
                }

                await setDoc(progressRef, {
                    timeSpent: {
                        today: timeToday + 30, // 30 seconds
                        total: timeTotal + 30
                    }
                }, { merge: true });
            } catch (err) {
                // Fail silently for heartbeat interval to avoid cluttering logs
            }
        }, 30000); // 30 seconds interval

        return () => clearInterval(interval);
    }, [user, courseId, activeLessonId, isPlaying]);

    if (loading) {
        return (
            <div style={{ padding: '100px', textAlign: 'center', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
                <h2>Loading course...</h2>
            </div>
        );
    }

    if (!course) {
        return (
            <div style={{ padding: '100px', textAlign: 'center', minHeight: '100vh', background: '#0f0f0f', color: '#fff' }}>
                <h2>Course not found</h2>
                <Link href={`/company/${domain}/dashboard`} className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const allLessons = course.modules.flatMap((m: any) => m.lessons);
    const currentLesson = allLessons.find((l: any) => l.id === activeLessonId) || course.modules[0]?.lessons[0];
    const currentQuestion = currentLesson?.questions?.[0];

    // Effect to toggle video play state
    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying && !showQuestion) {
                videoRef.current.play().catch(e => console.warn("Video play failed:", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, showQuestion, activeLessonId]);

    // Cleanup on lesson change
    useEffect(() => {
        setIsPlaying(true);
        setShowQuestion(false);
        setAnswered(false);
        setSelectedAnswer('');
        setCurrentTime(0);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.playbackRate = playbackSpeed;
        }
        setActiveTab('overview');
        fetchComments(); // Fetch comments when lesson changes
    }, [activeLessonId]);

    const fetchComments = async () => {
        if (!courseId || !activeLessonId) return;
        setLoadingComments(true);
        try {
            const q = query(
                collection(db, 'courseComments'),
                where('courseId', '==', courseId),
                where('lessonId', '==', activeLessonId),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            const fetched: any[] = [];
            snap.forEach(doc => fetched.push({ id: doc.id, ...doc.data() }));
            setComments(fetched);
        } catch (err) {
            console.warn("Failed to fetch comments", err);
        }
        setLoadingComments(false);
    };

    const handlePostComment = async () => {
        if (!newComment.trim() || !user) return;
        try {
            const commentData = {
                courseId,
                lessonId: activeLessonId,
                userId: user.uid,
                userName: user.displayName || (user as any).name || 'Learner',
                text: newComment.trim(),
                createdAt: serverTimestamp(),
                replies: []
            };
            const docRef = await addDoc(collection(db, 'courseComments'), commentData);
            setComments([{ id: docRef.id, ...commentData, createdAt: { toDate: () => new Date() } }, ...comments]);
            setNewComment('');
        } catch (err) {
            alert('Failed to post comment.');
        }
    };

    const handlePostReply = async (commentId: string) => {
        if (!replyText.trim() || !user) return;
        try {
            const commentRef = doc(db, 'courseComments', commentId);
            const cSnap = await getDoc(commentRef);
            if (cSnap.exists()) {
                const updatedReplies = [...(cSnap.data().replies || []), {
                    id: Date.now().toString(),
                    userId: user.uid,
                    userName: user.displayName || (user as any).name || 'Resource Person',
                    text: replyText.trim(),
                    createdAt: new Date().toISOString()
                }];
                await setDoc(commentRef, { replies: updatedReplies }, { merge: true });
                setComments(comments.map(c => c.id === commentId ? { ...c, replies: updatedReplies } : c));
            }
            setReplyingTo(null);
            setReplyText('');
        } catch (err) {
            alert('Failed to post reply.');
        }
    };

    // Handle playback speed
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackSpeed;
        }
    }, [playbackSpeed]);

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        setAnswered(true);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'inherit' }}>
            {/* Top Bar */}
            <div style={{ padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1f1f1f', background: '#111', position: 'sticky', top: 0, zIndex: 100 }}>
                <Link href={`/company/${domain}/dashboard`} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0a0', fontSize: '0.9rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#a0a0a0'}>
                    <ChevronLeft size={20} /> <span style={{ fontWeight: 500 }}>Back</span>
                </Link>
                <div style={{ fontSize: '1rem', fontWeight: 600, maxWidth: '40%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {!isMobile && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '100px', height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${progress}%`, height: '100%', background: company?.branding?.themeColor || '#4f46e5', borderRadius: '3px' }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#a0a0a0', fontWeight: 600 }}>{progress}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 64px)' }}>
                {/* Left Side: Video Player Area + Tabbed Content */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#0a0a0a', position: 'relative', overflowY: 'auto' }}>
                    
                    {/* Video Container (Fixed aspect ratio to allow scrolling) */}
                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {(() => {
                            const isVid = currentLesson?.type?.toUpperCase() === 'VIDEO';
                            const url = currentLesson?.videoUrl || currentLesson?.contentUrl;
                            const srcType = currentLesson?.videoSource?.toLowerCase();

                            if (isVid && url && url !== '#') {
                                if (srcType === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')) {
                                    const ytId = extractYouTubeId(url);
                                    if (ytId) {
                                        return (
                                            <iframe
                                                width="100%" height="100%"
                                                src={`https://www.youtube.com/embed/${ytId}?rel=0&autoplay=1`}
                                                title={currentLesson.title} frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen style={{ background: 'black' }}
                                            />
                                        );
                                    }
                                }
                                if (srcType === 'drive' || url.includes('drive.google.com')) {
                                    // Make sure sharing link is converted to preview link
                                    const previewUrl = url.replace('/view', '/preview');
                                    return (
                                        <iframe
                                            width="100%" height="100%"
                                            src={previewUrl}
                                            title={currentLesson.title} frameBorder="0"
                                            allow="autoplay"
                                            allowFullScreen style={{ background: 'black' }}
                                        />
                                    );
                                }
                                if (srcType === 'github' || url.includes('github.com')) {
                                    return (
                                        <div style={{ padding: '40px', textAlign: 'center', color: '#fff' }}>
                                            <h3>GitHub Material</h3>
                                            <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: company?.branding?.themeColor || '#4f46e5', textDecoration: 'underline' }}>
                                                Open GitHub Link
                                            </a>
                                        </div>
                                    );
                                }
                                
                                // Default local or direct video URL
                                return (
                                    <video
                                        ref={videoRef}
                                        src={url}
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                        onTimeUpdate={(e) => {
                                            const time = e.currentTarget.currentTime;
                                            setCurrentTime(time);
                                            if (currentQuestion && !showQuestion && lessonQuizStatus === 'unanswered' && currentQuestion.timestamp !== undefined) {
                                                if (time >= currentQuestion.timestamp && time < currentQuestion.timestamp + 1) {
                                                    setIsPlaying(false);
                                                    setShowQuestion(true);
                                                }
                                            }
                                        }}
                                        onEnded={(e) => {
                                            if (currentQuestion && lessonQuizStatus === 'wrong') {
                                                setShowQuestion(true);
                                                setLessonQuizStatus('unanswered');
                                            } else {
                                                handleLessonComplete(currentLesson.id);
                                            }
                                        }}
                                    />
                                );
                            }

                            // Fallback for non-video or no URL
                            return (
                                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            margin: '0 auto 16px', cursor: 'pointer',
                                            border: '2px solid rgba(255,255,255,0.2)',
                                            transition: 'all 0.2s ease'
                                        }}
                                            onClick={() => { setIsPlaying(!isPlaying); if (!showQuestion) setTimeout(() => setShowQuestion(true), 1500); }}
                                        >
                                            {isPlaying ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: '4px' }} />}
                                        </div>
                                        <p style={{ color: '#888', fontSize: '0.9rem' }}>{currentLesson?.title || 'No lesson available'}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Inline Question Overlay */}
                        {showQuestion && currentQuestion && !answered && (
                            <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(12px)', padding: '24px', zIndex: 10
                            }}>
                                <div style={{
                                    background: '#1a1a1a', borderRadius: '24px', padding: isMobile ? '24px' : '40px',
                                    maxWidth: '560px', width: '100%', border: '1px solid #333',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    animation: 'scaleIn 0.3s ease-out'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        <Clock size={16} /> Knowledge Check
                                    </div>
                                    <h3 style={{ marginBottom: '32px', fontSize: isMobile ? '1.1rem' : '1.4rem', lineHeight: 1.4, fontWeight: 700 }}>{currentQuestion.text}</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {currentQuestion.options?.map((option: any, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleAnswer(option)}
                                                style={{
                                                    padding: '16px 20px', borderRadius: '14px', textAlign: 'left',
                                                    background: '#242424', border: '1px solid #333',
                                                    color: 'white', fontSize: '1rem', cursor: 'pointer',
                                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    display: 'flex', alignItems: 'center', gap: '16px'
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#444'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#242424'; e.currentTarget.style.borderColor = '#333'; }}
                                            >
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#888' }}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ marginTop: '24px', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>Please select an answer to continue</p>
                                </div>
                            </div>
                        )}

                        {/* Answer Feedback */}
                        {answered && (
                            <div style={{
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(16px)', zIndex: 11
                            }}>
                                <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: selectedAnswer === currentQuestion?.correctAnswer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 24px',
                                        border: `2px solid ${selectedAnswer === currentQuestion?.correctAnswer ? '#10b981' : '#ef4444'}`,
                                        animation: 'pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}>
                                        <CheckCircle size={40} color={selectedAnswer === currentQuestion?.correctAnswer ? '#10b981' : '#ef4444'} />
                                    </div>
                                    <h2 style={{ marginBottom: '12px', fontSize: '1.8rem', fontWeight: 800 }}>
                                        {selectedAnswer === currentQuestion?.correctAnswer ? 'Excellent!' : 'Wrong Answer'}
                                    </h2>
                                    <p style={{ color: '#a0a0a0', marginBottom: '32px', fontSize: '1rem', lineHeight: 1.5 }}>
                                        {selectedAnswer === currentQuestion?.correctAnswer ? 
                                            "You've mastered this concept. Let's keep moving!" : 
                                            'Don\'t worry! The lesson will continue, but you\'ll need to attempt this again at the end for completion.'}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setShowQuestion(false);
                                            setAnswered(false);
                                            if (selectedAnswer === currentQuestion?.correctAnswer) {
                                                setLessonQuizStatus('correct');
                                                if (currentTime >= duration - 0.5 && duration > 0) {
                                                    setCompletedLessons(prev => ({ ...prev, [currentLesson!.id]: true }));
                                                }
                                            } else {
                                                setLessonQuizStatus('wrong');
                                                if (currentTime >= duration - 0.5 && duration > 0) {
                                                    setShowQuestion(true);
                                                }
                                            }
                                            setIsPlaying(true);
                                        }}
                                        className="btn-primary"
                                        style={{ 
                                            padding: '16px 40px', 
                                            borderRadius: '12px', 
                                            background: selectedAnswer === currentQuestion?.correctAnswer ? '#10b981' : '#333',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Continue Lesson <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Video Controls */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                            {/* Progress Bar */}
                            <div
                                style={{ width: '100%', height: '4px', background: '#333', borderRadius: '999px', marginBottom: '12px', cursor: 'pointer' }}
                                onClick={(e) => {
                                    if (videoRef.current && duration) {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const pos = (e.clientX - rect.left) / rect.width;
                                        videoRef.current.currentTime = pos * duration;
                                    }
                                }}
                            >
                                <div style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : `0%`, height: '100%', borderRadius: '999px', background: company?.branding.themeColor || '#4f46e5', transition: 'width 0.1s linear' }}></div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button onClick={() => setIsPlaying(!isPlaying)} style={{ color: 'white' }}>
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>
                                        {duration > 0 ? `${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')} / ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}` : '0:00 / 0:00'}
                                    </span>
                                    <Volume2 size={18} color="#999" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <button
                                        onClick={() => setPlaybackSpeed(playbackSpeed === 2 ? 1 : playbackSpeed + 0.25)}
                                        style={{ color: '#999', fontSize: '0.8rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', border: '1px solid #444' }}
                                    >
                                        {playbackSpeed}x
                                    </button>
                                    <Maximize size={18} color="#999" style={{ cursor: 'pointer' }} />
                                </div>
                            </div>
                        </div>
                    </div> {/* End Video Container */}

                    {/* Tab Navigation */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #1f1f1f', padding: '0 24px', background: '#111' }}>
                        {[
                            { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
                            { id: 'resources', label: 'Resources', icon: <FileText size={16} /> },
                            { id: 'qna', label: 'Q&A (Comments)', icon: <MessageSquare size={16} /> }
                        ].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: activeTab === t.id ? (company?.branding?.themeColor || '#4f46e5') : '#a0a0a0',
                                    fontWeight: activeTab === t.id ? 600 : 500,
                                    borderBottom: `2px solid ${activeTab === t.id ? (company?.branding?.themeColor || '#4f46e5') : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content Area */}
                    <div style={{ padding: '32px 24px', flex: 1, background: '#0a0a0a' }}>
                        {activeTab === 'overview' && (
                            <div className="animate-fade-in-up" style={{ maxWidth: '800px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>About this Lesson</h3>
                                <div style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                    {currentLesson?.description || "No description provided for this lesson."}
                                </div>
                            </div>
                        )}

                        {activeTab === 'resources' && (
                            <div className="animate-fade-in-up" style={{ maxWidth: '800px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Resource Materials</h3>
                                {currentLesson?.resourceLinks ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {currentLesson.resourceLinks.split('\n').filter((l: string) => l.trim() !== '').map((link: string, idx: number) => {
                                            const isUrl = link.startsWith('http://') || link.startsWith('https://');
                                            let rName = 'Resource Link';
                                            if (isUrl) {
                                                if (link.includes('drive.google.com')) rName = 'Google Drive Document';
                                                else if (link.includes('github.com')) rName = 'GitHub Repository';
                                                else if (link.includes('firebasestorage')) rName = 'Platform Hosted File';
                                                else if (link.toLowerCase().endsWith('.pdf')) rName = 'PDF Document';
                                                else {
                                                    try { rName = new URL(link).hostname; } catch {}
                                                }
                                            }
                                            
                                            return (
                                                <div key={idx} style={{ padding: '16px', borderRadius: '12px', background: '#111', border: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = company?.branding?.themeColor || '#4f46e5'} onMouseLeave={e => e.currentTarget.style.borderColor = '#1f1f1f'} onClick={() => isUrl && window.open(link, '_blank')}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: company?.branding?.themeColor || '#4f46e5', flexShrink: 0 }}>
                                                        <FileText size={24} />
                                                    </div>
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: 600, color: 'white', fontSize: '1.05rem', marginBottom: '4px' }}>{isUrl ? rName : link}</div>
                                                        {isUrl && (
                                                            <div style={{ color: '#888', fontSize: '0.85rem', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', whiteSpace: 'nowrap' }}>
                                                                {link}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {isUrl && (
                                                        <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                                                            Open
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{ color: '#a0a0a0' }}>No extra resources provided for this lesson.</div>
                                )}
                            </div>
                        )}

                        {activeTab === 'qna' && (
                            <div className="animate-fade-in-up" style={{ maxWidth: '800px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>Questions & Comments</h3>
                                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '24px' }}>Ask questions or report issues. Tutors and designated Resource Persons will review and reply.</p>
                                
                                {/* Add Comment */}
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: company?.branding?.themeColor || '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                        {user?.displayName?.charAt(0) || 'U'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <textarea
                                            value={newComment}
                                            onChange={e => setNewComment(e.target.value)}
                                            placeholder="Add a new question or comment..."
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: '#111', border: '1px solid #333', color: 'white', outline: 'none', resize: 'vertical', minHeight: '80px', fontSize: '0.9rem' }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                            <button onClick={handlePostComment} disabled={!newComment.trim()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: company?.branding?.themeColor || '#4f46e5', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: newComment.trim() ? 'pointer' : 'not-allowed', opacity: newComment.trim() ? 1 : 0.5 }}>
                                                <Send size={14} /> Post Comment
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Comments List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {loadingComments ? (
                                        <div style={{ color: '#888' }}>Loading comments...</div>
                                    ) : comments.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#666', padding: '40px 0', background: '#111', borderRadius: '12px', border: '1px dashed #333' }}>
                                            No questions yet. Be the first to start a discussion!
                                        </div>
                                    ) : (
                                        comments.map((comment: any) => {
                                            const role = (user as any)?.role;
                                            const canReply = role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'TRAINER' || role === 'RESOURCE_PERSON';
                                            return (
                                                <div key={comment.id} style={{ display: 'flex', gap: '16px' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontWeight: 700, flexShrink: 0 }}>
                                                        {comment.userName?.charAt(0) || 'U'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ background: '#111', padding: '16px', borderRadius: '12px', border: '1px solid #1f1f1f' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e5e7eb' }}>{comment.userName}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                                    {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Just now'}
                                                                </span>
                                                            </div>
                                                            <div style={{ color: '#d1d5db', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{comment.text}</div>
                                                        </div>

                                                        {/* Actions & Replies */}
                                                        <div style={{ marginTop: '8px', marginLeft: '16px' }}>
                                                            {canReply && replyingTo !== comment.id && (
                                                                <button onClick={() => setReplyingTo(comment.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <Reply size={14} /> Reply
                                                                </button>
                                                            )}
                                                            
                                                            {replyingTo === comment.id && (
                                                                <div style={{ marginTop: '12px', display: 'flex', gap: '12px', animation: 'fadeInUp 0.2s ease' }}>
                                                                    <textarea autoFocus value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply. This is visible to the learner." style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', background: '#161616', border: '1px solid #333', color: 'white', outline: 'none', resize: 'vertical', minHeight: '60px', fontSize: '0.85rem' }} />
                                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                                        <button onClick={() => handlePostReply(comment.id)} style={{ padding: '6px 14px', borderRadius: '6px', background: company?.branding?.themeColor || '#4f46e5', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Submit</button>
                                                                        <button onClick={() => { setReplyingTo(null); setReplyText(''); }} style={{ padding: '6px 14px', borderRadius: '6px', background: 'transparent', color: '#9ca3af', border: '1px solid #4b5563', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Cancel</button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Actual Replies */}
                                                            {comment.replies && comment.replies.length > 0 && (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                                                                    {comment.replies.map((reply: any) => (
                                                                        <div key={reply.id} style={{ display: 'flex', gap: '12px' }}>
                                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.2)', border: `1px solid ${company?.branding?.themeColor || '#4f46e5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: company?.branding?.themeColor || '#4f46e5', fontWeight: 700, flexShrink: 0, fontSize: '0.8rem' }}>
                                                                                {reply.userName?.charAt(0) || 'R'}
                                                                            </div>
                                                                            <div style={{ flex: 1, background: '#161616', padding: '12px', borderRadius: '12px', border: '1px solid #333' }}>
                                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                                                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: company?.branding?.themeColor || '#4f46e5' }}>{reply.userName} <span style={{ padding: '2px 6px', background: 'rgba(79, 70, 229, 0.1)', borderRadius: '4px', fontSize: '0.65rem', marginLeft: '6px' }}>Staff</span></span>
                                                                                </div>
                                                                                <div style={{ color: '#d1d5db', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{reply.text}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar - Course Content */}
            <div style={{ width: isMobile ? '100%' : '380px', borderLeft: isMobile ? 'none' : '1px solid #1f1f1f', borderTop: isMobile ? '1px solid #1f1f1f' : 'none', overflow: 'auto', background: '#111' }}>
                <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Course Content</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '0' }}>{course.modules.length} modules • {course.modules.reduce((a: number, m: any) => a + m.lessons.length, 0)} lessons</p>
                </div>

                {/* Modules */}
                {course.modules.map((module: any, mi: number) => (
                    <div key={module.id}>
                        <div style={{ padding: '16px 24px', background: '#161616', fontSize: '0.9rem', fontWeight: 700, borderTop: '1px solid #1f1f1f', borderBottom: '1px solid #1f1f1f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{module.title}</span>
                            <span style={{ fontSize: '0.75rem', color: '#555' }}>Step {mi + 1}</span>
                        </div>
                        {module.lessons.map((lesson: any, li: number) => {
                            const globalIndex = allLessons.findIndex((l: any) => l.id === lesson.id);
                            const prevLessonId = globalIndex > 0 ? allLessons[globalIndex - 1].id : null;
                            const isUnlocked = globalIndex === 0 || (prevLessonId && completedLessons[prevLessonId]);
                            const isActive = activeLessonId === lesson.id;
                            
                            return (
                            <div key={lesson.id} style={{
                                padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '16px',
                                borderBottom: '1px solid #161616', cursor: isUnlocked ? 'pointer' : 'not-allowed',
                                background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                                opacity: isUnlocked ? 1 : 0.5,
                                transition: 'all 0.2s'
                            }}
                                onClick={() => {
                                    if (isUnlocked) setActiveLessonId(lesson.id);
                                }}
                            >
                                <div style={{ 
                                    width: '32px', height: '32px', borderRadius: '10px', 
                                    background: isActive ? (company?.branding?.themeColor || '#4f46e5') : '#1f1f1f', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {isActive ? <Play size={14} fill="white" /> : 
                                     completedLessons[lesson.id] ? <CheckCircle size={16} color="#10b981" /> : 
                                     isUnlocked ? <Play size={14} color="#666" /> : <Lock size={14} color="#444" />}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.9rem', color: isActive ? 'white' : '#a0a0a0', fontWeight: isActive ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lesson.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#555', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        {lesson.type?.toUpperCase() === 'VIDEO' && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Play size={10} /> Video</span>}
                                        {lesson.questions && lesson.questions.length > 0 && <span>• {lesson.questions.length} quiz</span>}
                                    </div>
                                </div>
                                {completedLessons[lesson.id] && !isActive && <div style={{ color: '#10b981', fontSize: '0.7rem', fontWeight: 700 }}>DONE</div>}
                            </div>
                        )})}
                    </div>
                ))}

                {/* Certificate */}
                <div style={{ padding: '24px', borderTop: '1px solid #1f1f1f', marginTop: 'auto' }}>
                    <div style={{ padding: '24px', borderRadius: '20px', background: 'linear-gradient(135deg, #1a1a1a, #111)', border: '1px solid #1f1f1f', textAlign: 'center' }}>
                        <Award size={40} color="#f59e0b" style={{ marginBottom: '12px' }} />
                        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Course Certificate</div>
                        <div style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5 }}>Complete all modules to unlock your achievement.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
