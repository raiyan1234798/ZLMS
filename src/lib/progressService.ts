import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { ActivityService } from './activityService';

export interface ProgressData {
    courseId: string;
    userId: string;
    completedLessons: Record<string, boolean>;
    overallProgress: number;
    updatedAt: any;
}

export const ProgressService = {
    /**
     * Saves progress to both the user's private collection and a shared company collection for admin reporting.
     */
    saveProgress: async (
        userId: string, 
        courseId: string, 
        courseTitle: string,
        companyId: string, 
        companyName: string,
        userName: string,
        completedLessons: Record<string, boolean>, 
        totalLessons: number
    ) => {
        try {
            const overallProgress = Math.round((Object.keys(completedLessons).length / totalLessons) * 100);
            
            const progressData = {
                courseId,
                userId,
                userName,
                companyId,
                companyName,
                courseTitle,
                completedLessons,
                overallProgress,
                updatedAt: serverTimestamp()
            };

            // 1. Save to user's private progress
            const userProgressRef = doc(db, 'users', userId, 'progress', courseId);
            await setDoc(userProgressRef, progressData, { merge: true });

            // 2. Save to shared company progress for admin visibility
            const adminProgressRef = doc(db, 'companies', companyId, 'progress', `${userId}_${courseId}`);
            await setDoc(adminProgressRef, progressData, { merge: true });

            // 3. If 100% complete, issue certificate and log completion
            if (overallProgress === 100) {
                await ProgressService.checkAndIssueCertificate(userId, userName, courseId, courseTitle, companyId);
                await ActivityService.logCourseCompleted(userName, courseTitle, companyId, companyName);
            }

            return overallProgress;
        } catch (error) {
            console.error("Error saving progress:", error);
            throw error;
        }
    },

    /**
     * Issues a certificate if one doesn't already exist for this user/course.
     */
    checkAndIssueCertificate: async (
        userId: string,
        userName: string,
        courseId: string,
        courseTitle: string,
        companyId: string
    ) => {
        try {
            // Check if certificate already exists to avoid duplicates
            // We use a deterministic ID for the certificate doc or we can query
            const certId = `cert_${userId}_${courseId}`;
            const certRef = doc(db, 'companies', companyId, 'certificates', certId);
            const certSnap = await getDoc(certRef);

            if (!certSnap.exists()) {
                const certData = {
                    userId,
                    userName,
                    courseId,
                    courseName: courseTitle,
                    score: 100, // Default to 100 for completion
                    issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    createdAt: serverTimestamp()
                };

                await setDoc(certRef, certData);
                console.log(`Certificate issued for ${userName} - ${courseTitle}`);
            }
        } catch (error) {
            console.error("Error issuing certificate:", error);
        }
    }
};
