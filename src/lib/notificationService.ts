import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';

export type NotificationType = 'info' | 'alert' | 'success' | 'message';

export interface Notification {
    id?: string;
    title: string;
    message: string;
    type: NotificationType;
    companyId: string; // 'platform' for super admin, or specific companyId
    userId?: string;   // specific user if needed, or null for all users in company
    read: boolean;
    createdAt: any;
}

export const NotificationService = {
    async sendNotification(data: Omit<Notification, 'read' | 'createdAt'>) {
        try {
            await addDoc(collection(db, 'notifications'), {
                ...data,
                read: false,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.warn("Error sending notification:", error);
        }
    },

    async notifyNewCourse(courseTitle: string, companyId: string, companyName: string) {
        // 1. Notify Super Admin
        await this.sendNotification({
            title: 'New Course Created',
            message: `A new course "${courseTitle}" has been created by ${companyName}.`,
            type: 'info',
            companyId: 'platform'
        });

        // 2. Notify Company Admin & Users of that company
        await this.sendNotification({
            title: 'New Course Added',
            message: `A new course "${courseTitle}" is now available in your academy.`,
            type: 'success',
            companyId: companyId
        });
    },

    async getNotifications(companyId: string, userId?: string) {
        try {
            let q = query(
                collection(db, 'notifications'),
                where('companyId', '==', companyId),
                limit(100) // Increased limit since we'll sort in memory
            );

            const snap = await getDocs(q);
            const notifications = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Notification));

            // Sort in memory to avoid index requirement
            return notifications.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB.getTime() - dateA.getTime();
            }).slice(0, 20); // Maintain the original limit of 20 for the return value
        } catch (error) {
            console.warn("Error fetching notifications:", error);
            return [];
        }
    }
};
