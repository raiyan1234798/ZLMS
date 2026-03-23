import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ActivityType = 'COURSE_CREATED' | 'COURSE_ENROLLED' | 'LESSON_COMPLETED' | 'USER_REGISTERED' | 'COMPANY_REGISTERED' | 'COURSE_REQUESTED' | 'COURSE_COMPLETED';

export interface Activity {
    type: ActivityType;
    text: string;
    userId?: string;
    userName?: string;
    companyId?: string;
    companyName?: string;
    courseId?: string;
    courseName?: string;
    color?: string;
    timestamp?: any;
}

const TYPE_COLORS: Record<ActivityType, string> = {
    'COURSE_CREATED': '#4f46e5',
    'COURSE_ENROLLED': '#10b981',
    'LESSON_COMPLETED': '#3b82f6',
    'USER_REGISTERED': '#10b981',
    'COMPANY_REGISTERED': '#7c3aed',
    'COURSE_REQUESTED': '#f59e0b',
    'COURSE_COMPLETED': '#10b981'
};

export const ActivityService = {
    logActivity: async (activity: Omit<Activity, 'timestamp' | 'color'>) => {
        try {
            await addDoc(collection(db, 'activity'), {
                ...activity,
                color: TYPE_COLORS[activity.type] || '#94a3b8',
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error logging activity:", error);
        }
    },

    logCourseCreated: (courseName: string, companyId: string, companyName: string) => {
        return ActivityService.logActivity({
            type: 'COURSE_CREATED',
            text: `New course "${courseName}" created in ${companyName}`,
            companyId,
            companyName,
            courseName
        });
    },

    logUserRegistered: (userName: string, companyId?: string, companyName?: string) => {
        return ActivityService.logActivity({
            type: 'USER_REGISTERED',
            text: `${userName} joined the platform${companyName ? ` via ${companyName}` : ''}`,
            userName,
            companyId,
            companyName
        });
    },

    logLessonCompleted: (userName: string, lessonTitle: string, courseName: string, companyId: string, companyName?: string) => {
        return ActivityService.logActivity({
            type: 'LESSON_COMPLETED',
            text: `${userName} completed "${lessonTitle}" in ${courseName}${companyName ? ` (${companyName})` : ''}`,
            userName,
            companyId,
            companyName,
            courseName
        });
    },

    logCourseCompleted: (userName: string, courseName: string, companyId: string, companyName?: string) => {
        return ActivityService.logActivity({
            type: 'COURSE_COMPLETED',
            text: `🎉 ${userName} completed the entire course "${courseName}"${companyName ? ` in ${companyName}` : ''}!`,
            userName,
            companyId,
            companyName,
            courseName
        });
    }
};
