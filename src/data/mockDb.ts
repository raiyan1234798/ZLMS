import { Company, Course, User } from '../types';

// ─── COMPANIES ──────────────────────────────────────────────────────────────────
export const MOCK_COMPANIES: Company[] = [
    {
        id: 'c1',
        name: 'Global IT Academy',
        subdomain: 'globalit',
        branding: {
            themeColor: '#3b82f6',
            dashboardTitle: 'Global IT Training Portal',
            landingPageText: 'Welcome to Global IT Training. Upskill your employees with cutting-edge tech courses.'
        },
        features: ['courses', 'video', 'analytics', 'certificates', 'quizzes', 'teams'],
        status: 'ACTIVE'
    },
    {
        id: 'c2',
        name: 'Acme Corp Sales',
        subdomain: 'acme',
        branding: {
            themeColor: '#ef4444',
            dashboardTitle: 'Acme Sales Enablement',
            landingPageText: 'Learn to close deals faster with Acme world-class sales training.'
        },
        features: ['courses', 'quizzes', 'analytics', 'certificates'],
        status: 'ACTIVE'
    },
    {
        id: 'c3',
        name: 'Skyline Real Estate',
        subdomain: 'skyline',
        branding: {
            themeColor: '#10b981',
            dashboardTitle: 'Skyline Training Academy',
            landingPageText: 'Master real estate fundamentals and grow your property business.'
        },
        features: ['courses', 'video', 'certificates', 'analytics', 'assignments'],
        status: 'ACTIVE'
    },
    {
        id: 'c4',
        name: 'TravelPro Agency',
        subdomain: 'travelpro',
        branding: {
            themeColor: '#8b5cf6',
            dashboardTitle: 'TravelPro Learning Hub',
            landingPageText: 'Become a certified travel expert. Learn destinations, booking systems, and customer service.'
        },
        features: ['courses', 'video', 'quizzes', 'certificates'],
        status: 'ACTIVE'
    },
    {
        id: 'c5',
        name: 'MedLearn Health',
        subdomain: 'medlearn',
        branding: {
            themeColor: '#06b6d4',
            dashboardTitle: 'MedLearn Compliance Training',
            landingPageText: 'Stay compliant. Complete your mandatory healthcare training and certifications.'
        },
        features: ['courses', 'video', 'certificates', 'analytics', 'notifications'],
        status: 'ACTIVE'
    },
    {
        id: 'c6',
        name: 'NovaTech Solutions',
        subdomain: 'novatech',
        branding: {
            themeColor: '#f59e0b',
            dashboardTitle: 'NovaTech Engineering Academy',
            landingPageText: 'Level up your engineering skills with NovaTech\'s curated learning paths.'
        },
        features: ['courses', 'video', 'analytics'],
        status: 'SUSPENDED'
    },
    {
        id: 'c7',
        name: 'Demo Enterprise',
        subdomain: 'demo',
        branding: {
            themeColor: '#e11d48',
            dashboardTitle: 'Demo Enterprise Portal',
            landingPageText: 'Welcome to the interactive demo portal for all platform features.'
        },
        features: ['courses', 'video', 'quizzes', 'analytics', 'certificates', 'teams', 'assignments'],
        status: 'ACTIVE'
    },
    {
        id: 'c8',
        name: 'Luxaar Learning',
        subdomain: 'luxaar',
        branding: {
            themeColor: '#7c3aed',
            dashboardTitle: 'Luxaar Learning Portal',
            landingPageText: 'Welcome to Luxaar Learning. Exclusive technical and management courses.'
        },
        features: ['courses', 'video', 'quizzes', 'analytics', 'certificates', 'teams'],
        status: 'ACTIVE'
    }
];

// ─── USERS ──────────────────────────────────────────────────────────────────────
export const MOCK_USERS: User[] = [
    // Platform
    { id: 'u0', companyId: 'platform', name: 'Rayan (Platform Owner)', email: 'rayan@zlms.com', role: 'SUPER_ADMIN' },

    // ── Global IT Academy (c1) ──
    { id: 'u1', companyId: 'c1', name: 'John Doe', email: 'john@globalit.com', role: 'COMPANY_ADMIN' },
    { id: 'u2', companyId: 'c1', name: 'Sarah Mitchell', email: 'sarah@globalit.com', role: 'TRAINER' },
    { id: 'u3', companyId: 'c1', name: 'Jane Smith', email: 'jane@globalit.com', role: 'USER' },
    { id: 'u4', companyId: 'c1', name: 'Mike Johnson', email: 'mike@globalit.com', role: 'USER' },
    { id: 'u5', companyId: 'c1', name: 'Emily Chen', email: 'emily@globalit.com', role: 'USER' },
    { id: 'u6', companyId: 'c1', name: 'David Wilson', email: 'david@globalit.com', role: 'USER' },

    // ── Acme Corp Sales (c2) ──
    { id: 'u7', companyId: 'c2', name: 'Robert Taylor', email: 'robert@acme.com', role: 'COMPANY_ADMIN' },
    { id: 'u8', companyId: 'c2', name: 'Lisa Anderson', email: 'lisa@acme.com', role: 'TRAINER' },
    { id: 'u9', companyId: 'c2', name: 'Tom Harris', email: 'tom@acme.com', role: 'USER' },
    { id: 'u10', companyId: 'c2', name: 'Amanda Clark', email: 'amanda@acme.com', role: 'USER' },
    { id: 'u11', companyId: 'c2', name: 'Kevin Brooks', email: 'kevin@acme.com', role: 'USER' },

    // ── Skyline Real Estate (c3) ──
    { id: 'u12', companyId: 'c3', name: 'Maria Rodriguez', email: 'maria@skyline.com', role: 'COMPANY_ADMIN' },
    { id: 'u13', companyId: 'c3', name: 'James Cooper', email: 'james@skyline.com', role: 'TRAINER' },
    { id: 'u14', companyId: 'c3', name: 'Sophie Turner', email: 'sophie@skyline.com', role: 'USER' },
    { id: 'u15', companyId: 'c3', name: 'Daniel Kim', email: 'daniel@skyline.com', role: 'USER' },
    { id: 'u16', companyId: 'c3', name: 'Rachel Green', email: 'rachel@skyline.com', role: 'USER' },

    // ── TravelPro Agency (c4) ──
    { id: 'u17', companyId: 'c4', name: 'Carlos Mendez', email: 'carlos@travelpro.com', role: 'COMPANY_ADMIN' },
    { id: 'u18', companyId: 'c4', name: 'Nina Patel', email: 'nina@travelpro.com', role: 'TRAINER' },
    { id: 'u19', companyId: 'c4', name: 'Alex Rivera', email: 'alex@travelpro.com', role: 'USER' },
    { id: 'u20', companyId: 'c4', name: 'Priya Sharma', email: 'priya@travelpro.com', role: 'USER' },

    // ── MedLearn Health (c5) ──
    { id: 'u21', companyId: 'c5', name: 'Dr. Helen Park', email: 'helen@medlearn.com', role: 'COMPANY_ADMIN' },
    { id: 'u22', companyId: 'c5', name: 'Dr. Alan Foster', email: 'alan@medlearn.com', role: 'TRAINER' },
    { id: 'u23', companyId: 'c5', name: 'Nurse Joy Adams', email: 'joy@medlearn.com', role: 'USER' },
    { id: 'u24', companyId: 'c5', name: 'Mark Stevens', email: 'mark@medlearn.com', role: 'USER' },
    { id: 'u25', companyId: 'c5', name: 'Linda Choi', email: 'linda@medlearn.com', role: 'USER' },

    // ── NovaTech Solutions (c6 — suspended) ──
    { id: 'u26', companyId: 'c6', name: 'Frank Norton', email: 'frank@novatech.com', role: 'COMPANY_ADMIN' },
    { id: 'u27', companyId: 'c6', name: 'Grace Liu', email: 'grace@novatech.com', role: 'USER' },

    // ── Demo Enterprise (c7) ──
    { id: 'u28', companyId: 'c7', name: 'Demo Admin', email: 'admin@demo.com', role: 'COMPANY_ADMIN' },
    { id: 'u29', companyId: 'c7', name: 'Demo Trainer', email: 'trainer@demo.com', role: 'TRAINER' },
    { id: 'u30', companyId: 'c7', name: 'Demo User 1', email: 'user1@demo.com', role: 'USER' },
    { id: 'u31', companyId: 'c7', name: 'Demo User 2', email: 'user2@demo.com', role: 'USER' },

    // ── Luxaar Learning (c8) ──
    { id: 'u32', companyId: 'c8', name: 'Luxaar Admin', email: 'admin@luxaar.com', role: 'COMPANY_ADMIN' },
    { id: 'u33', companyId: 'c8', name: 'Luxaar Learner', email: 'user@luxaar.com', role: 'USER' }
];

// ─── COURSES ────────────────────────────────────────────────────────────────────
export const MOCK_COURSES: Course[] = [
    // ── Global IT Academy (c1) ──
    {
        id: 'course_1',
        companyId: 'c1',
        title: 'React Fundamentals',
        description: 'Learn the basics of React 19 — components, hooks, and state management.',
        status: 'ASSIGNED',
        modules: [
            {
                id: 'm1',
                title: 'Introduction to React',
                lessons: [
                    {
                        id: 'l1',
                        title: 'What is React?',
                        type: 'VIDEO',
                        contentUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
                        questions: [
                            {
                                id: 'q1',
                                timestamp: 5,
                                text: 'What year was React first released by Facebook?',
                                type: 'MULTIPLE_CHOICE',
                                options: ['2010', '2013', '2015', '2020'],
                                correctAnswer: '2013'
                            }
                        ]
                    },
                    {
                        id: 'l2',
                        title: 'Setting Up Your Environment',
                        type: 'VIDEO',
                        contentUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
                        questions: [
                            {
                                id: 'q2',
                                timestamp: 8,
                                text: 'Which command creates a new React app?',
                                type: 'MULTIPLE_CHOICE',
                                options: ['npm start', 'npx create-react-app', 'react init', 'npm build'],
                                correctAnswer: 'npx create-react-app'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'm2',
                title: 'Components & Props',
                lessons: [
                    {
                        id: 'l3',
                        title: 'Functional Components',
                        type: 'VIDEO',
                        contentUrl: 'https://example.com/video3',
                        questions: [
                            {
                                id: 'q3',
                                timestamp: 180,
                                text: 'What do props allow you to do?',
                                type: 'MULTIPLE_CHOICE',
                                options: ['Style components', 'Pass data between components', 'Create APIs', 'Write CSS'],
                                correctAnswer: 'Pass data between components'
                            }
                        ]
                    },
                    {
                        id: 'l4',
                        title: 'Props Deep Dive',
                        type: 'DOCUMENT',
                        contentUrl: 'https://example.com/doc1',
                        questions: []
                    }
                ]
            },
            {
                id: 'm3',
                title: 'State & Hooks',
                lessons: [
                    {
                        id: 'l5',
                        title: 'useState Hook',
                        type: 'VIDEO',
                        contentUrl: 'https://example.com/video4',
                        questions: [
                            {
                                id: 'q4',
                                timestamp: 150,
                                text: 'What does useState return?',
                                type: 'MULTIPLE_CHOICE',
                                options: ['A string', 'An array with value and setter', 'An object', 'A number'],
                                correctAnswer: 'An array with value and setter'
                            }
                        ]
                    },
                    {
                        id: 'l6',
                        title: 'useEffect Hook',
                        type: 'VIDEO',
                        contentUrl: 'https://example.com/video5',
                        questions: []
                    }
                ]
            }
        ]
    },
    {
        id: 'course_2',
        companyId: 'c1',
        title: 'TypeScript for Professionals',
        description: 'Master TypeScript — types, interfaces, generics, and advanced patterns.',
        status: 'AVAILABLE',
        modules: [
            {
                id: 'm4',
                title: 'TypeScript Basics',
                lessons: [
                    {
                        id: 'l7',
                        title: 'Why TypeScript?',
                        type: 'VIDEO',
                        contentUrl: 'https://example.com/video6',
                        questions: [
                            {
                                id: 'q5',
                                timestamp: 60,
                                text: 'TypeScript is a superset of which language?',
                                type: 'MULTIPLE_CHOICE',
                                options: ['Python', 'Java', 'JavaScript', 'C++'],
                                correctAnswer: 'JavaScript'
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'course_3',
        companyId: 'c1',
        title: 'Node.js Backend Development',
        description: 'Build scalable REST APIs with Node.js, Express, and PostgreSQL.',
        status: 'AVAILABLE',
        modules: [
            {
                id: 'm5',
                title: 'Getting Started with Node',
                lessons: [
                    { id: 'l8', title: 'Node.js Architecture', type: 'VIDEO', contentUrl: '#', questions: [] },
                    {
                        id: 'l9', title: 'Your First Server', type: 'VIDEO', contentUrl: '#', questions: [
                            { id: 'q6', timestamp: 100, text: 'Which module creates an HTTP server in Node?', type: 'MULTIPLE_CHOICE', options: ['fs', 'http', 'path', 'os'], correctAnswer: 'http' }
                        ]
                    }
                ]
            }
        ]
    },

    // ── Acme Corp Sales (c2) ──
    {
        id: 'course_4',
        companyId: 'c2',
        title: 'Cold Calling Mastery',
        description: 'Master the art of cold calling — scripts, objection handling, and closing.',
        status: 'ASSIGNED',
        modules: [
            {
                id: 'm6',
                title: 'Cold Calling Fundamentals',
                lessons: [
                    {
                        id: 'l10',
                        title: 'The Perfect Opening',
                        type: 'VIDEO',
                        contentUrl: '#',
                        questions: [
                            { id: 'q7', timestamp: 60, text: 'How many seconds do you have to make a first impression?', type: 'MULTIPLE_CHOICE', options: ['3', '7', '15', '30'], correctAnswer: '7' }
                        ]
                    },
                    { id: 'l11', title: 'Handling Objections', type: 'VIDEO', contentUrl: '#', questions: [] },
                    {
                        id: 'l12', title: 'Closing Techniques', type: 'VIDEO', contentUrl: '#', questions: [
                            { id: 'q8', timestamp: 200, text: 'What is the "assumptive close"?', type: 'SHORT_ANSWER', correctAnswer: 'Acting as if the prospect has already decided to buy' }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'course_5',
        companyId: 'c2',
        title: 'Negotiation Strategies',
        description: 'Learn proven negotiation frameworks used by top sales professionals.',
        status: 'AVAILABLE',
        modules: [
            {
                id: 'm7',
                title: 'Negotiation Basics',
                lessons: [
                    {
                        id: 'l13', title: 'BATNA & ZOPA', type: 'VIDEO', contentUrl: '#', questions: [
                            { id: 'q9', timestamp: 90, text: 'What does BATNA stand for?', type: 'MULTIPLE_CHOICE', options: ['Best Alternative To Negotiated Agreement', 'Basic Analysis of Trade Negotiations', 'Bilateral Agreement for Trade Negotiations', 'Best Approach To New Arrangements'], correctAnswer: 'Best Alternative To Negotiated Agreement' }
                        ]
                    },
                    { id: 'l14', title: 'Win-Win Strategies', type: 'DOCUMENT', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },
    {
        id: 'course_6',
        companyId: 'c2',
        title: 'CRM Mastery: Salesforce',
        description: 'Learn Salesforce from scratch — pipelines, reports, and automation.',
        status: 'AVAILABLE',
        modules: []
    },

    // ── Skyline Real Estate (c3) ──
    {
        id: 'course_7',
        companyId: 'c3',
        title: 'Real Estate Licensing Prep',
        description: 'Everything you need to pass your real estate licensing exam.',
        status: 'ASSIGNED',
        modules: [
            {
                id: 'm8',
                title: 'Property Law Basics',
                lessons: [
                    {
                        id: 'l15', title: 'Types of Property Ownership', type: 'VIDEO', contentUrl: '#', questions: [
                            { id: 'q10', timestamp: 120, text: 'What is "fee simple" ownership?', type: 'MULTIPLE_CHOICE', options: ['Temporary ownership', 'Full ownership with no conditions', 'Shared ownership', 'Government-owned'], correctAnswer: 'Full ownership with no conditions' }
                        ]
                    },
                    { id: 'l16', title: 'Contracts & Closings', type: 'DOCUMENT', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },
    {
        id: 'course_8',
        companyId: 'c3',
        title: 'Property Valuation Techniques',
        description: 'Learn how to accurately assess property values using industry methods.',
        status: 'AVAILABLE',
        modules: [
            {
                id: 'm9',
                title: 'Valuation Methods',
                lessons: [
                    { id: 'l17', title: 'Comparable Sales Approach', type: 'VIDEO', contentUrl: '#', questions: [] },
                    { id: 'l18', title: 'Income Approach', type: 'VIDEO', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },

    // ── TravelPro Agency (c4) ──
    {
        id: 'course_9',
        companyId: 'c4',
        title: 'Global Destinations Guide',
        description: 'Deep dive into top travel destinations — Europe, Asia, Americas.',
        status: 'ASSIGNED',
        modules: [
            {
                id: 'm10',
                title: 'European Destinations',
                lessons: [
                    {
                        id: 'l19', title: 'Paris & French Riviera', type: 'VIDEO', contentUrl: '#', questions: [
                            { id: 'q11', timestamp: 60, text: 'What is the most visited monument in Paris?', type: 'MULTIPLE_CHOICE', options: ['Louvre Museum', 'Eiffel Tower', 'Notre-Dame', 'Arc de Triomphe'], correctAnswer: 'Eiffel Tower' }
                        ]
                    },
                    { id: 'l20', title: 'Italian Coast', type: 'VIDEO', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },
    {
        id: 'course_10',
        companyId: 'c4',
        title: 'Booking Systems & GDS',
        description: 'Learn Amadeus, Sabre, and modern booking platforms.',
        status: 'AVAILABLE',
        modules: [
            {
                id: 'm11',
                title: 'GDS Fundamentals',
                lessons: [
                    { id: 'l21', title: 'What is a GDS?', type: 'VIDEO', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },

    // ── MedLearn Health (c5) ──
    {
        id: 'course_11',
        companyId: 'c5',
        title: 'HIPAA Compliance Training',
        description: 'Mandatory HIPAA training for all healthcare staff.',
        status: 'ASSIGNED',
        modules: [
            {
                id: 'm12',
                title: 'HIPAA Overview',
                lessons: [
                    {
                        id: 'l22', title: 'What is HIPAA?', type: 'VIDEO', contentUrl: '#', questions: [
                            { id: 'q12', timestamp: 90, text: 'What does HIPAA protect?', type: 'MULTIPLE_CHOICE', options: ['Financial data', 'Patient health information', 'Employee records', 'Trade secrets'], correctAnswer: 'Patient health information' }
                        ]
                    },
                    { id: 'l23', title: 'PHI & Security Rules', type: 'DOCUMENT', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },
    {
        id: 'course_12',
        companyId: 'c5',
        title: 'Infection Control Procedures',
        description: 'Essential infection control practices for clinical settings.',
        status: 'AVAILABLE',
        modules: [
            {
                id: 'm13',
                title: 'Basic Protocols',
                lessons: [
                    { id: 'l24', title: 'Hand Hygiene', type: 'VIDEO', contentUrl: '#', questions: [] },
                    { id: 'l25', title: 'PPE Guidelines', type: 'VIDEO', contentUrl: '#', questions: [] }
                ]
            }
        ]
    },
    {
        id: 'course_13',
        companyId: 'c5',
        title: 'Patient Communication',
        description: 'Best practices for communicating with patients and families.',
        status: 'AVAILABLE',
        modules: []
    }
];

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────────
export const getCompanyBySubdomain = (subdomain: string) => {
    return MOCK_COMPANIES.find(c => c.subdomain === subdomain) || null;
};

export const getUsersByCompany = (companyId: string) => {
    return MOCK_USERS.filter(u => u.companyId === companyId);
};

export const getCoursesByCompany = (companyId: string) => {
    return MOCK_COURSES.filter(c => c.companyId === companyId);
};

export const getCompanyById = (id: string) => {
    return MOCK_COMPANIES.find(c => c.id === id) || null;
};

export const getAdminForCompany = (companyId: string) => {
    return MOCK_USERS.find(u => u.companyId === companyId && u.role === 'COMPANY_ADMIN') || null;
};

export const getLearnersForCompany = (companyId: string) => {
    return MOCK_USERS.filter(u => u.companyId === companyId && u.role === 'USER');
};

export const getTotalStats = () => ({
    totalCompanies: MOCK_COMPANIES.length,
    activeCompanies: MOCK_COMPANIES.filter(c => c.status === 'ACTIVE').length,
    totalUsers: MOCK_USERS.filter(u => u.companyId !== 'platform').length,
    totalCourses: MOCK_COURSES.length,
    totalAdmins: MOCK_USERS.filter(u => u.role === 'COMPANY_ADMIN').length,
    totalTrainers: MOCK_USERS.filter(u => u.role === 'TRAINER').length,
    totalLearners: MOCK_USERS.filter(u => u.role === 'USER').length,
});
