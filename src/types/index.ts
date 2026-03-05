export type Role = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'TRAINER' | 'USER';

export interface Company {
    id: string;
    name: string;
    subdomain: string;
    branding: {
        logoUrl?: string;
        themeColor: string;
        dashboardTitle: string;
        landingPageText?: string;
    };
    features: string[]; // From Kanban board
    status: 'ACTIVE' | 'SUSPENDED';
}

export interface User {
    id: string;
    companyId: string;
    name: string;
    email: string;
    role: Role;
    avatarUrl?: string;
}

export interface Course {
    id: string;
    companyId: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    status: 'AVAILABLE' | 'ASSIGNED' | 'ARCHIVED';
    modules: Module[];
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: string;
    title: string;
    type: 'VIDEO' | 'DOCUMENT' | 'SLIDES';
    contentUrl: string;
    questions: Question[];
}

export interface Question {
    id: string;
    timestamp?: number; // For video
    text: string;
    type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'DESCRIPTIVE';
    options?: string[];
    correctAnswer?: string;
}

export interface Feature {
    id: string;
    name: string;
    status: 'AVAILABLE' | 'ENABLED' | 'DISABLED';
}
