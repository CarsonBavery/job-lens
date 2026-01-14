import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Login attempt:', { email, password });
        login(); // Mock login for verification
        navigate('/dashboard');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200 min-h-screen flex flex-col">
            {/* Simple Header */}
            <header className="w-full border-b border-gray-200 dark:border-border-dark bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined !text-[32px] ai-gradient-text">
                                auto_fix
                            </span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">JobLens</span>
                    </Link>
                    <Link
                        to="/"
                        className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Home
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
                {/* Background Blobs for Atmosphere */}
                <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-accent-purple/20 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="glass-card rounded-2xl border border-gray-200 dark:border-white/10 p-8 shadow-2xl relative">
                        {/* Top Accent Gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent-purple to-pink-500 rounded-t-2xl"></div>

                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-black tracking-tight mb-2">
                                Welcome <span className="ai-gradient-text">Back</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Enter your credentials to access your dashboard
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2 ml-1" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-xl">mail</span>
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2 ml-1">
                                    <label className="text-sm font-semibold" htmlFor="password">
                                        Password
                                    </label>
                                    <a href="#" className="text-xs font-medium text-primary hover:text-primary-dark transition-colors">
                                        Forgot Password?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-xl">lock</span>
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
                            >
                                <span>Sign In</span>
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                    login
                                </span>
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-gray-200 dark:border-border-dark"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-background-dark px-4 text-slate-500 font-medium">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <button className="flex items-center justify-center gap-3 w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-gray-800 py-3 rounded-xl transition-all shadow-sm font-medium group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Sign in with Google</span>
                            </button>
                        </div>

                        <div className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <a href="#" className="font-bold text-primary hover:text-primary-dark transition-colors">
                                Sign Up
                            </a>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                        Securely Powered by JobLens Encryption
                    </p>
                </div>
            </main>

            <footer className="py-8 text-center text-xs text-slate-500 opacity-60">
                &copy; 2024 JobLens Inc. All rights reserved.
            </footer>
        </div>
    );
}