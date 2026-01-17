import { Link } from 'react-router-dom';
import type { User } from '../types/types';

interface DashboardNavbarProps {
    user: User;
    activeTab: 'dashboard' | 'resumes' | 'generator';
    onTabChange: (tab: 'dashboard' | 'resumes' | 'generator') => void;
}

export default function DashboardNavbar({ user, activeTab, onTabChange }: DashboardNavbarProps) {
    return (
        <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo */}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onTabChange('dashboard')}>
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined !text-[32px] ai-gradient-text">
                                auto_fix
                            </span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                            JobLens
                        </span>
                    </div>

                    {/* Center: Tabs */}
                    <nav className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                        <button
                            onClick={() => onTabChange('dashboard')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'dashboard'
                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => onTabChange('resumes')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'resumes'
                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            Resumes
                        </button>
                        <button
                            onClick={() => onTabChange('generator')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'generator'
                                ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                        >
                            Generator
                        </button>
                    </nav>

                    {/* Right: User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                            <div className="text-right hidden md:block">
                                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {user.fullName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {user.email}
                                </div>
                            </div>
                            <button className="relative group">
                                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ring-2 ring-transparent group-hover:ring-primary transition-all">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-slate-500">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                    )}
                                </div>
                                {/* Dropdown menu indicator */}
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <span className="material-symbols-outlined text-[10px] text-slate-500 block">
                                        expand_more
                                    </span>
                                </div>
                            </button>
                            {/* Sign Out Button (Small) */}
                            <Link
                                to="/"
                                className="ml-2 text-xs text-slate-500 hover:text-red-500 transition-colors"
                                title="Sign Out"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
