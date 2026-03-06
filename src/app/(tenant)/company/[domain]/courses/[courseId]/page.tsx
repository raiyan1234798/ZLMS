import { MOCK_COURSES } from '@/data/mockDb';
import ClientPage from './ClientPage';

export function generateStaticParams() {
    return MOCK_COURSES.map(c => ({ courseId: c.id }));
}

export default function CoursePlayerPage() {
    return <ClientPage />;
}
