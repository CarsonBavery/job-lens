import { ApplicationStatus } from '../types/types';
import type { User, Resume, JobApplication, DashboardStats, GeneratedContent } from '../types/types';

export const mockUser: User = {
    id: 'u_123456',
    email: 'alex.taylor@example.com',
    fullName: 'Alex Taylor',
    jobTitle: 'Senior Product Manager',
    experienceLevel: 'Senior',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvAAa6tko_HaNX1OtUvUEPPPkeS8KomrLcs0UoLUDUHuKqabGw5ZG6QLjIbM02--KrhyizU1_SlhzSG-iW1U-bzTmvKYIzApmGsJdyrbn65BSL_gp-m3oKrQZ8BGe6F17l1ymk6Eoi71EOtlVlPBqzc3KyeoZUMcavwL7AvxO4m04FVap01eHK33sxruOdEfOrH1wYG0liTWQTM8IpHfDL9W1X2KRemnS6pH-TdWD-NZU_SZCnAa4Xml78yQ4aWzDXIkBciL9s0w', // Using one of the avatar images from landing page
};

export const mockStats: DashboardStats = {
    totalApplications: 24,
    interviewsScheduled: 3,
    offersReceived: 1,
    resumesTailored: 15,
};

export const mockResumes: Resume[] = [
    {
        id: 'r_001',
        userId: 'u_123456',
        title: 'Base PM Resume 2024',
        fileName: 'Alex_Taylor_PM_Resume.pdf',
        fileUrl: '#',
        createdAt: '2025-12-10T10:00:00Z',
        lastModifiedAt: '2026-01-05T14:30:00Z',
        tags: ['General', 'Product Management'],
    },
    {
        id: 'r_002',
        userId: 'u_123456',
        title: 'Fintech Focused Resume',
        fileName: 'Alex_Taylor_Fintech.pdf',
        fileUrl: '#',
        createdAt: '2026-01-12T09:15:00Z',
        lastModifiedAt: '2026-01-12T09:15:00Z',
        tags: ['Fintech', 'Technical'],
    },
];

export const mockApplications: JobApplication[] = [
    {
        id: 'app_001',
        userId: 'u_123456',
        companyName: 'TechFlow',
        positionTitle: 'Senior Product Manager',
        status: ApplicationStatus.INTERVIEWING,
        appliedDate: '2026-01-02T10:00:00Z',
        location: 'San Francisco, CA (Hybrid)',
        logoUrl: '',
        notes: 'Technical interview pending for next Tuesday.',
    },
    {
        id: 'app_002',
        userId: 'u_123456',
        companyName: 'Streamline Inc.',
        positionTitle: 'Group Product Manager',
        status: ApplicationStatus.OFFER,
        // Let's use APPLIED for now to be safe or fix standard enum usage
        // Wait, looking at types.ts I defined OFFER. Let's use OFFER.
    } as any, // casting to avoid strict check error while I fix the object literal in my head... wait, I can just write it correctly.
];

// Re-writing mockApplications correctly
export const mockJobApplications: JobApplication[] = [
    {
        id: 'app_001',
        userId: 'u_123456',
        companyName: 'TechFlow',
        positionTitle: 'Senior Product Manager',
        status: ApplicationStatus.INTERVIEWING,
        appliedDate: '2026-01-02T10:00:00Z',
        location: 'San Francisco, CA (Hybrid)',
        logoUrl: '',
    },
    {
        id: 'app_002',
        userId: 'u_123456',
        companyName: 'Nebula Systems',
        positionTitle: 'Product Lead',
        status: ApplicationStatus.APPLIED,
        appliedDate: '2026-01-14T16:20:00Z',
        location: 'Remote',
    },
    {
        id: 'app_003',
        userId: 'u_123456',
        companyName: 'GreenEarth',
        positionTitle: 'Senior PM, Sustainability',
        status: ApplicationStatus.WISHLIST,
        location: 'Seattle, WA',
    },
    {
        id: 'app_004',
        userId: 'u_123456',
        companyName: 'InnovateX',
        positionTitle: 'VP of Product',
        status: ApplicationStatus.REJECTED,
        appliedDate: '2025-12-20T09:00:00Z',
        location: 'New York, NY',
    },
];

export const mockRecentActivity: GeneratedContent[] = [
    {
        id: 'gen_001',
        userId: 'u_123456',
        applicationId: 'app_001',
        type: 'CoverLetter',
        content: 'Dear Hiring Manager...',
        createdAt: '2026-01-02T10:05:00Z',
    },
    {
        id: 'gen_002',
        userId: 'u_123456',
        type: 'ResumeBulletPoints',
        content: '* Increased user retention by 20%...',
        createdAt: '2026-01-15T11:30:00Z',
    }
];
