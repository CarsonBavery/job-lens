export default function LandingPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200 min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-border-dark bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="size-8 text-primary flex items-center justify-center">
                            <span className="material-symbols-outlined !text-[32px] ai-gradient-text">
                                auto_fix
                            </span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">JobLens</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a
                            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors"
                            href="#how-it-works"
                        >
                            How it Works
                        </a>
                        <a
                            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors"
                            href="#features"
                        >
                            Features
                        </a>
                        <a
                            className="text-sm font-medium text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-colors"
                            href="#pricing"
                        >
                            Pricing
                        </a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:flex text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-primary dark:hover:text-white transition-colors">
                            Log In
                        </button>
                        <button className="bg-primary hover:bg-primary-dark text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-primary/25">
                            Get Started
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-36 bg-hero-glow">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                            <div className="flex-1 text-center lg:text-left">
                                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6">
                                    <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                                    Powered by Gemini 3.0 Flash
                                </div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] mb-6">
                                    Land Your Dream Job with{" "}
                                    <span className="ai-gradient-text">Gemini Precision</span>
                                </h1>
                                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                                    Stop sending generic applications. Tailor your resume and
                                    cover letter to every job description in seconds using
                                    advanced AI analysis.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                    <button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white text-base font-bold h-12 px-8 rounded-lg transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2">
                                        <span>Get Started for Free</span>
                                        <span className="material-symbols-outlined text-sm">
                                            arrow_forward
                                        </span>
                                    </button>
                                    <button className="w-full sm:w-auto bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark text-slate-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 text-base font-medium h-12 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-primary">
                                            play_circle
                                        </span>
                                        <span>Watch Demo</span>
                                    </button>
                                </div>
                                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 dark:text-slate-500">
                                    <div className="flex -space-x-2">
                                        <div
                                            className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 bg-cover"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBzmJmKw-bJvbS0tBc2zbIzP40p6kUpv2MU0-NEBGquO4rqwwrcBPolVWBrAEULoE-o0hLmSo9ofswwsGS0DzS_pT8Guj_5ed0umzpx1zW3C3RahJ14A-4cV3Ry3Fig9O4xIzE7LtWfmn9jxXkyqp2fLKSgUBApFZVFTJoHuYaABZn7YbpIlet2_GAzC__Od6RpDBXkXtBAXLP3Z_SR8PotY7ccG8HtgtaAmMW6azVwDaltWLQ7R2sU86j9Gc_jTkaTIwp6SU38Ug')",
                                            }}
                                        ></div>
                                        <div
                                            className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 bg-cover"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvAAa6tko_HaNX1OtUvUEPPPkeS8KomrLcs0UoLUDUHuKqabGw5ZG6QLjIbM02--KrhyizU1_SlhzSG-iW1U-bzTmvKYIzApmGsJdyrbn65BSL_gp-m3oKrQZ8BGe6F17l1ymk6Eoi71EOtlVlPBqzc3KyeoZUMcavwL7AvxO4m04FVap01eHK33sxruOdEfOrH1wYG0liTWQTM8IpHfDL9W1X2KRemnS6pH-TdWD-NZU_SZCnAa4Xml78yQ4aWzDXIkBciL9s0w')",
                                            }}
                                        ></div>
                                        <div
                                            className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 bg-cover"
                                            style={{
                                                backgroundImage:
                                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC7jYALoCM6UP8lFGcS_f95OpGhfizTXpkRgYuxE33dZooGkGRCsRtAxI46TyJ3mRYBJVH1DLQ8FWVIG9dKEcO1rBA_Ehq_FeSoAZt4OgABIVJIk5km9zgeQDOGbEbxpCP9K42rJtdkQieF7NVHlrTUnOE2x_72u-J7jTjA-9jy8DXaiHW5IGoop_YFY2lYpSgOl2CrDrkdd8KwvhvzSvoGy8c47Tst0v77IO5tAKJ7A0GGYhHCt2-DzlGMTVCNkcZLsamOAHESHA')",
                                            }}
                                        ></div>
                                    </div>
                                    <p>Join 10,000+ job seekers</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full max-w-[600px] lg:max-w-none relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent-purple/30 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                                <div className="relative glass-card rounded-xl p-2 shadow-2xl ring-1 ring-white/10">
                                    <div className="bg-slate-900 rounded-lg overflow-hidden relative aspect-[4/3]">
                                        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-800 flex items-center px-3 gap-2 border-b border-slate-700 z-20">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                        </div>
                                        <div className="mt-8 p-6 flex gap-4 h-full">
                                            <div className="w-1/4 hidden sm:flex flex-col gap-3">
                                                <div className="h-2 w-1/2 bg-slate-700 rounded mb-4"></div>
                                                <div className="h-8 w-full bg-slate-800/50 rounded border border-slate-700/50"></div>
                                                <div className="h-8 w-full bg-primary/20 rounded border border-primary/30"></div>
                                                <div className="h-8 w-full bg-slate-800/50 rounded border border-slate-700/50"></div>
                                            </div>
                                            <div className="flex-1 bg-white rounded shadow-sm p-6 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                                                <div className="h-4 w-1/3 bg-slate-800 rounded mb-2"></div>
                                                <div className="h-2 w-1/4 bg-slate-400 rounded mb-6"></div>
                                                <div className="space-y-3">
                                                    <div className="h-2 w-full bg-slate-200 rounded"></div>
                                                    <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                                                    <div className="h-2 w-4/6 bg-slate-200 rounded"></div>
                                                </div>
                                                <div className="mt-6 space-y-3">
                                                    <div className="h-2 w-full bg-slate-200 rounded"></div>
                                                    <div className="h-2 w-11/12 bg-slate-200 rounded"></div>
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent-purple/10 flex items-center justify-center">
                                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                                                    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-2xl border border-primary/50 flex items-center gap-3 animate-bounce">
                                                        <span className="material-symbols-outlined text-yellow-400">
                                                            spark
                                                        </span>
                                                        <div className="text-xs">
                                                            <div className="font-bold text-primary-300">
                                                                Optimizing for "Senior Product Manager"...
                                                            </div>
                                                            <div className="text-slate-400">
                                                                Rewriting impact statements
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-white dark:bg-background-light" id="how-it-works">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-2">
                                Process
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
                                How It Works
                            </h3>
                            <p className="text-lg text-slate-600">
                                Land your next role in three simple steps using our intuitive
                                platform.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-12 relative">
                            <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-slate-200 z-0"></div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-bold text-2xl mb-8 shadow-xl shadow-primary/30 border-4 border-white">
                                    1
                                </div>
                                <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-100 w-full max-w-[280px] aspect-video flex flex-col justify-center gap-2 overflow-hidden group hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-primary text-3xl mb-1">
                                        upload_file
                                    </span>
                                    <div className="h-1.5 w-3/4 bg-slate-100 rounded mx-auto"></div>
                                    <div className="h-1.5 w-1/2 bg-slate-100 rounded mx-auto"></div>
                                    <div className="mt-2 py-2 px-4 border-2 border-dashed border-slate-200 rounded-lg text-[10px] text-slate-400">
                                        Drop resume here
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">
                                    Upload &amp; Parse
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-[240px]">
                                    Import your base resume. Our AI automatically identifies your
                                    skills, experience, and achievements.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-bold text-2xl mb-8 shadow-xl shadow-primary/30 border-4 border-white">
                                    2
                                </div>
                                <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-100 w-full max-w-[280px] aspect-video flex flex-col justify-center gap-2 overflow-hidden group hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-accent-purple text-3xl mb-1">
                                        psychology
                                    </span>
                                    <div className="flex gap-1 items-center justify-center">
                                        <div className="h-1 w-8 bg-slate-100 rounded"></div>
                                        <div className="h-1 w-12 bg-primary/40 rounded"></div>
                                        <div className="h-1 w-6 bg-slate-100 rounded"></div>
                                    </div>
                                    <div className="mt-2 flex gap-1 justify-center">
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xs text-slate-400">
                                                description
                                            </span>
                                        </div>
                                        <div className="w-4 h-4 mt-3 rounded-full bg-accent-purple/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-[10px] text-accent-purple animate-pulse">
                                                bolt
                                            </span>
                                        </div>
                                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xs text-slate-400">
                                                task_alt
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">
                                    Analyze &amp; Adapt
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-[240px]">
                                    Paste a job description. Gemini analyzes the requirements and
                                    crafts perfectly tailored bullet points.
                                </p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white font-bold text-2xl mb-8 shadow-xl shadow-primary/30 border-4 border-white">
                                    3
                                </div>
                                <div className="mb-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-100 w-full max-w-[280px] aspect-video flex flex-col justify-center gap-2 overflow-hidden group hover:border-primary/50 transition-colors">
                                    <span className="material-symbols-outlined text-green-500 text-3xl mb-1">
                                        verified
                                    </span>
                                    <div className="h-8 w-1/2 bg-slate-900 rounded-md mx-auto flex items-center justify-center gap-1">
                                        <span className="material-symbols-outlined text-white text-[12px]">
                                            download
                                        </span>
                                        <div className="h-1 w-8 bg-white/30 rounded"></div>
                                    </div>
                                    <div className="mt-2 flex gap-1 justify-center opacity-50">
                                        <div className="w-3 h-3 rounded-sm bg-blue-400"></div>
                                        <div className="w-3 h-3 rounded-sm bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-sm bg-green-400"></div>
                                    </div>
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">
                                    Apply with Confidence
                                </h4>
                                <p className="text-slate-600 text-sm leading-relaxed max-w-[240px]">
                                    Download your tailored resume and track your application
                                    through every stage of the hiring process.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y border-border-dark bg-background-dark/50 py-10">
                    <div className="mx-auto max-w-7xl px-4 text-center">
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-8">
                            Trusted by Job Seekers at Innovative Companies
                        </h4>
                        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                            <div
                                className="h-8 w-24 bg-contain bg-no-repeat bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxGYma6v56Xi5DMlEbtHPkHlapQyc6GXDCeiCzNXJIqIxs-hIYJ-X8RkngkAG9qXUQ8Ro3FUeBVjNUnKpcnir-IFPktrbR6i4oFPCS1pqo7tIMeuJ5EkKDs0yBAn8NDMBc0rkYtAD7yVob_Jm-nAQ5LTsyh85_FaLdPtT8MuBW825XeE39T_tNO6Y_xWKxkAaRt4eC4jg9Oq4MKNhii_y63AOSEuMo_Xb_G-w8enmJnzNXYt4yk6DEhZF3nPUIvF2YLsf_Vwg0ow')",
                                }}
                            ></div>
                            <div
                                className="h-8 w-24 bg-contain bg-no-repeat bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKmKguq2ImjskPyQVHUVEPJ1gGjbi6BVk5z2QRNUxhxepE_QxJ1zJZ4a0LS21WgyZvXAiQxXdsVvIGXGVK-0vaTmIzHMAlpGGMJx_j4nLJzhxKgioEXdo1c1U5Yz2ib9GG3TUnPDTRFWyoVJaTDCmjvxOr7mZyw3WMN7DSlz2ffoGoBCdWwOqin5ypfrtzZicUFPl8_XG7fKa3K-IYLOeDdP9Qa9tqSVsi--qoidu7wF-qcP4OcgF6apMJiryGhh1xPqeJONiEXA')",
                                }}
                            ></div>
                            <div
                                className="h-8 w-24 bg-contain bg-no-repeat bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCm_K_mDA8ZGxOK9uLKyp0wf8EaZUTIe-zGAu-mD_SAtBA1qkqMDWX91ipF1r4kk3Tz0lVD546I0g45JeE5Ce089-G1UPrzRxukdZ6gmkxAleSo2kcJA_W1OvUqfsAvKvHRZjqLcadDhzb92Qa6pJ0gO1GHQy8L-ge6HrnEQhlFs5O2sZTirQkfdoO61M9bkE1mobnGaG2PTzPa8UiZ-_n5dQaz725fSL29PLNuKY7CSnmOSXhzYx44PwK5eL9kmndN6yZmkG6FvA')",
                                }}
                            ></div>
                            <div
                                className="h-8 w-24 bg-contain bg-no-repeat bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAe54rPuI-e1rVeChdmFkOsHUGWu0280yzH--b-uwkzJAMYtOwCFnBhfomYurbfvpRj_J1xB1gamXLLT9ctuMCRsKYmqoiuW3SYKLy5uqZVSmJde9rPzr6Tbt9j7sK2UrV5bEgU--KWVvrc1ub7VToYFK5ukzCx27q-m_GKSrmQPfBIli24ajRyz5PVQXn93XcK6_Ji0uAWSMpNXTuRK6wyxqzXwF-awwOXyMA75hc-EXwWh0hpMAlyNzbVh74OG-0TjvFMng6QHg')",
                                }}
                            ></div>
                            <div
                                className="h-8 w-24 bg-contain bg-no-repeat bg-center"
                                style={{
                                    backgroundImage:
                                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUuIzb0hZ8JQ5-NfL-E5Qysm2-OxwxfYEKHbYmWbiTJUAdBFbnmMklZFYvWQ4MkyepklK4uVjmcpiOyi-nhJlzfX4FSMb5tAX2-M_WDyAtyHXTVCkPlafUy3i6_19wb8VadyeOFRiy0yZRjM2Ao4svPZICVrDWStXbOs0pTr4sqUtdv8FJfopowrypNF-RlhckPHB0E7KudcdLVvERSOB1CjFLb4zGUW5vHYGyA4Ju-TJQve-WfZxCblXh6mzfK3dcULNpYVDW1g')",
                                }}
                            ></div>
                        </div>
                    </div>
                </section>

                <section className="py-24 relative" id="features">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-base font-semibold text-primary tracking-wide uppercase mb-2">
                                Supercharge Your Search
                            </h2>
                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
                                Everything you need to manage your career move
                            </h3>
                            <p className="text-lg text-slate-400">
                                Powered by Google's Gemini models to give you the unfair
                                advantage in a crowded market.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="group relative rounded-2xl bg-surface-dark border border-border-dark p-8 hover:border-primary/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-primary text-2xl">
                                            edit_note
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3">
                                        AI-Driven Tailoring
                                    </h4>
                                    <p className="text-slate-400 leading-relaxed">
                                        Instantly rewrite resume bullet points to match job
                                        description keywords. Our AI ensures you pass every ATS
                                        scan.
                                    </p>
                                    <div className="mt-6 p-3 rounded bg-background-dark border border-border-dark text-xs text-slate-500 font-mono">
                                        <div className="flex items-center gap-2 mb-2 text-green-400">
                                            <span className="material-symbols-outlined text-[14px]">
                                                check_circle
                                            </span>
                                            <span>Keyword Match: 98%</span>
                                        </div>
                                        <div className="opacity-50">Original: Managed a team...</div>
                                        <div className="text-primary mt-1">
                                            AI: Led a cross-functional team of 15 engineers to
                                            deliver...
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative rounded-2xl bg-surface-dark border border-border-dark p-8 hover:border-accent-purple/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-gradient-to-b from-accent-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-lg bg-accent-purple/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-accent-purple text-2xl">
                                            view_kanban
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3">
                                        Job Application Tracking
                                    </h4>
                                    <p className="text-slate-400 leading-relaxed">
                                        Visualize your application pipeline with a built-in Kanban
                                        board. Never forget a follow-up email again.
                                    </p>
                                    <div className="mt-6 flex gap-2 overflow-hidden opacity-70">
                                        <div className="flex-1 bg-background-dark border border-border-dark rounded p-2 h-20">
                                            <div className="w-full h-1 bg-blue-500 rounded mb-2"></div>
                                            <div className="w-2/3 h-1.5 bg-slate-700 rounded mb-1"></div>
                                        </div>
                                        <div className="flex-1 bg-background-dark border border-border-dark rounded p-2 h-20">
                                            <div className="w-full h-1 bg-yellow-500 rounded mb-2"></div>
                                            <div className="w-2/3 h-1.5 bg-slate-700 rounded mb-1"></div>
                                        </div>
                                        <div className="flex-1 bg-background-dark border border-border-dark rounded p-2 h-20">
                                            <div className="w-full h-1 bg-green-500 rounded mb-2"></div>
                                            <div className="w-2/3 h-1.5 bg-slate-700 rounded mb-1"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative rounded-2xl bg-surface-dark border border-border-dark p-8 hover:border-pink-500/50 transition-colors duration-300">
                                <div className="absolute inset-0 bg-gradient-to-b from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
                                <div className="relative z-10">
                                    <div className="h-12 w-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-pink-500 text-2xl">
                                            mic
                                        </span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-3">
                                        Interview Simulation
                                    </h4>
                                    <p className="text-slate-400 leading-relaxed">
                                        Practice answering specific questions with Gemini acting as
                                        the hiring manager. Get real-time feedback on your tone.
                                    </p>
                                    <div className="mt-6 flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-xs">
                                                smart_toy
                                            </span>
                                        </div>
                                        <div className="bg-background-dark border border-border-dark rounded-r-lg rounded-bl-lg p-2 text-xs text-slate-300 max-w-[80%]">
                                            Tell me about a time you failed?
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center gap-3 justify-end">
                                        <div className="bg-primary/20 border border-primary/30 rounded-l-lg rounded-br-lg p-2 text-xs text-white max-w-[80%]">
                                            In my previous role at...
                                        </div>
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-white text-xs">
                                                person
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-24 bg-background-light dark:bg-slate-900/50" id="pricing">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="text-slate-400">
                                Start for free, upgrade when you're ready to scale your
                                applications.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <div className="rounded-2xl border border-border-dark bg-surface-dark p-8 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white">Free Starter</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Perfect for casual job seekers
                                    </p>
                                </div>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">$0</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-slate-300 text-sm">
                                        <span className="material-symbols-outlined text-green-500 text-lg">
                                            check
                                        </span>
                                        <span>1 Resume Template</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-300 text-sm">
                                        <span className="material-symbols-outlined text-green-500 text-lg">
                                            check
                                        </span>
                                        <span>Basic AI Keyword matching</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-slate-300 text-sm">
                                        <span className="material-symbols-outlined text-green-500 text-lg">
                                            check
                                        </span>
                                        <span>Manual Job Tracking</span>
                                    </li>
                                </ul>
                                <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-slate-700">
                                    Start for Free
                                </button>
                            </div>
                            <div className="relative rounded-2xl border border-primary bg-surface-dark p-8 flex flex-col shadow-2xl shadow-primary/10">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent-purple text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    Most Popular
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white">Pro Career</h3>
                                    <p className="text-slate-400 text-sm mt-1">
                                        For serious career changers
                                    </p>
                                </div>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">$12</span>
                                    <span className="text-slate-500">/month</span>
                                </div>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-start gap-3 text-white text-sm">
                                        <span className="material-symbols-outlined text-primary text-lg">
                                            check_circle
                                        </span>
                                        <span>Unlimited AI Resume Tailoring</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white text-sm">
                                        <span className="material-symbols-outlined text-primary text-lg">
                                            check_circle
                                        </span>
                                        <span>Custom Cover Letter Generation</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white text-sm">
                                        <span className="material-symbols-outlined text-primary text-lg">
                                            check_circle
                                        </span>
                                        <span>Advanced Interview Simulator (Voice)</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-white text-sm">
                                        <span className="material-symbols-outlined text-primary text-lg">
                                            check_circle
                                        </span>
                                        <span>Auto-fill Applications Chrome Extension</span>
                                    </li>
                                </ul>
                                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-primary/25">
                                    Get Pro Access
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-background-dark border-t border-border-dark pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-primary text-2xl">
                                    auto_fix
                                </span>
                                <span className="text-lg font-bold text-white">JobLens</span>
                            </div>
                            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                                Empowering job seekers with AI to land their dream roles faster.
                                Built with privacy and precision in mind.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <a className="text-slate-400 hover:text-white transition-colors" href="#">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                    </svg>
                                </a>
                                <a className="text-slate-400 hover:text-white transition-colors" href="#">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h5 className="text-white font-semibold mb-4 text-sm">Product</h5>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Success Stories
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Chrome Extension
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-semibold mb-4 text-sm">Company</h5>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-semibold mb-4 text-sm">Legal</h5>
                            <ul className="space-y-3 text-sm text-slate-400">
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a className="hover:text-primary transition-colors" href="#">
                                        Cookie Policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border-dark pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-500">
                            © 2024 JobLens Inc. All rights reserved.
                        </p>
                        <div className="flex gap-4">
                            <span className="text-xs text-slate-600">
                                Made with ❤️ for job seekers
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}