export interface User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string; // URL to profile picture
    jobTitle?: string; // Target job title
    experienceLevel?: 'Entry' | 'Mid' | 'Senior' | 'Executive';
}

export interface Resume {
    id: string;
    userId: string;
    title: string;
    fileName: string; // Original filename, e.g., "John_Doe_Resume.pdf"
    fileUrl: string;
    createdAt: string; // ISO Date
    lastModifiedAt: string; // ISO Date
    tags: string[]; // e.g., "Product Management", "Tech Lead"
}

export const ApplicationStatus = {
    WISHLIST: 'Wishlist',
    APPLIED: 'Applied',
    INTERVIEWING: 'Interviewing',
    OFFER: 'Offer',
    REJECTED: 'Rejected',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export interface JobApplication {
    id: string;
    userId: string;
    companyName: string;
    positionTitle: string;
    jobDescription?: string; // The full text
    status: ApplicationStatus;
    appliedDate?: string; // ISO Date
    salaryRange?: string;
    location?: string;
    notes?: string;
    logoUrl?: string; // Company logo if available
}

export interface GeneratedContent {
    id: string;
    userId: string;
    applicationId?: string; // Linked to a specific application
    type: 'CoverLetter' | 'ResumeBulletPoints' | 'InterviewQnA';
    content: string; // Markdown or plain text
    createdAt: string;
}

export interface DashboardStats {
    totalApplications: number;
    interviewsScheduled: number;
    offersReceived: number;
    resumesTailored: number;
}
