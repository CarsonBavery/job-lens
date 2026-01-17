import { useState } from 'react';
import DashboardNavbar from '../components/DashboardNavbar';
import { mockUser, mockStats, mockJobApplications, mockResumes, mockRecentActivity } from '../data/mockData';
import { ApplicationStatus } from '../types/types';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'resumes' | 'generator'>('dashboard');

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
            <DashboardNavbar
                user={mockUser}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-fadeIn">
                        {/* Welcome Section */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Welcome back, {mockUser.fullName.split(' ')[0]} 👋
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    You have <span className="text-primary font-semibold">{mockJobApplications.filter(a => a.status === ApplicationStatus.INTERVIEWING).length} upcoming interview(s)</span>.
                                </p>
                            </div>
                            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-lg shadow-lg shadow-primary/25 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                <span>New Application</span>
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-5 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <span className="material-symbols-outlined">send</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">Applied</span>
                                </div>
                                <div className="text-3xl font-bold">{mockStats.totalApplications}</div>
                            </div>
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-5 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                        <span className="material-symbols-outlined">event</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">Interviews</span>
                                </div>
                                <div className="text-3xl font-bold">{mockStats.interviewsScheduled}</div>
                            </div>
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-5 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                                        <span className="material-symbols-outlined">celebration</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">Offers</span>
                                </div>
                                <div className="text-3xl font-bold">{mockStats.offersReceived}</div>
                            </div>
                            <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-5 rounded-xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                                        <span className="material-symbols-outlined">edit_document</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">Resumes Tailored</span>
                                </div>
                                <div className="text-3xl font-bold">{mockStats.resumesTailored}</div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Recent Applications (Kanban-lite list) */}
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold">Active Applications</h2>
                                    <a href="#" className="text-sm text-primary hover:underline">View All</a>
                                </div>
                                <div className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-sm overflow-hidden">
                                    {mockJobApplications.map((app) => (
                                        <div key={app.id} className="p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg font-bold text-slate-500">
                                                    {app.companyName.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">{app.positionTitle}</h3>
                                                    <p className="text-sm text-slate-500">{app.companyName} • {app.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${app.status === ApplicationStatus.INTERVIEWING ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800' :
                                                    app.status === ApplicationStatus.OFFER ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800' :
                                                        app.status === ApplicationStatus.APPLIED ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800' :
                                                            'bg-slate-100 text-slate-700 border-slate-200'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                <button className="text-slate-400 hover:text-primary">
                                                    <span className="material-symbols-outlined">arrow_forward_ios</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity / Generated Content */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold">Recent Activity</h2>
                                <div className="space-y-3">
                                    {mockRecentActivity.map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-1">
                                                    <span className="material-symbols-outlined text-sm">
                                                        {item.type === 'CoverLetter' ? 'description' : 'list'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                                                        Generated {item.type.replace(/([A-Z])/g, ' $1').trim()}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {item.content}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 mt-2">
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'resumes' && (
                    <div className="animate-fadeIn">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold">My Resumes</h2>
                            <button className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                <span className="material-symbols-outlined">upload</span>
                                <span>Upload New</span>
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {mockResumes.map(resume => (
                                <div key={resume.id} className="bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                    <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                                        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">
                                            article
                                        </span>
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                            <button className="p-2 bg-white rounded-full text-slate-900 hover:text-primary">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                            <button className="p-2 bg-white rounded-full text-slate-900 hover:text-primary">
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg mb-1">{resume.title}</h3>
                                        <p className="text-sm text-slate-500 mb-3">{resume.fileName}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {resume.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                                            <span>Modified {new Date(resume.lastModifiedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'generator' && (
                    <div className="max-w-3xl mx-auto animate-fadeIn text-center py-12">
                        <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full text-primary mb-6">
                            <span className="material-symbols-outlined text-4xl">auto_fix</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">AI Generator</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
                            Select what you want to create. Gemini will analyze the job description and your resume to create tailored content.
                        </p>

                        <div className="grid md:grid-cols-2 gap-6 text-left">
                            <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary cursor-pointer transition-all hover:shadow-lg group">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Resume Bullet Points</h3>
                                <p className="text-sm text-slate-500">Perfectly tailored achievements for a specific job.</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary cursor-pointer transition-all hover:shadow-lg group">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Cover Letter</h3>
                                <p className="text-sm text-slate-500">A persuasive cover letter highlighting your fit.</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary cursor-pointer transition-all hover:shadow-lg group">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Interview Questions</h3>
                                <p className="text-sm text-slate-500">Practice questions you're likely to be asked.</p>
                            </div>
                            <div className="p-6 bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark rounded-xl hover:border-primary cursor-pointer transition-all hover:shadow-lg group">
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">Cold Email</h3>
                                <p className="text-sm text-slate-500">Reach out to hiring managers directly.</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}