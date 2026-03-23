import ClientPage from './ClientPage';

// Known domains - includes hardcoded list + new companies get served at runtime
// since ClientPage is fully client-rendered and fetches data from Firestore.
const KNOWN_DOMAINS = [
    'globalit', 'acme', 'skyline', 'travelpro', 'medlearn',
    'novatech', 'demo', 'luxaar', 'z2learn', 'ustglobal',
    'c8', 'c9', 'c10', 'test',
];

// Known course IDs from Firestore (these are pre-rendered)
const KNOWN_COURSE_IDS = [
    'course_1', 'course_2', 'course_3', 'course_4', 'course_5',
    'course_6', 'course_7', 'course_8', 'course_9', 'course_10',
    'course_11', 'course_12', 'course_13',
];

export function generateStaticParams() {
    const params: { domain: string; courseId: string }[] = [];
    for (const domain of KNOWN_DOMAINS) {
        for (const courseId of KNOWN_COURSE_IDS) {
            params.push({ domain, courseId });
        }
    }
    return params;
}

export default function CoursePlayerPage() {
    return <ClientPage />;
}
