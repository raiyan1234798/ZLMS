export function generateStaticParams() {
    return [
        { domain: "globalit", courseId: "fe-react" },
        { domain: "globalit", courseId: "be-node" },
        { domain: "acme", courseId: "sales-101" },
        { domain: "acme", courseId: "sales-adv" },
        { domain: "travelpro", courseId: "cs-basics" },
        { domain: "travelpro", courseId: "sys-booking" },
        { domain: "medlearn", courseId: "compliance-hipaa" },
        { domain: "medlearn", courseId: "med-ethics" },
        { domain: "skyline", courseId: "real-intro" },
        { domain: "skyline", courseId: "sales-closing" },
        { domain: "globalit", courseId: "aws-cert" }
    ];
}

import ClientPage from './ClientPage';

export default function CoursePlayerPage() {
    return <ClientPage />;
}
