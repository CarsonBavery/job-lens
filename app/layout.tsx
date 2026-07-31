import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (app/fonts/), not next/font/google -- fetching Geist from
// Google's CDN at build time proved unreliable in this environment (a
// blocked/slow connection silently falls back to the browser's default
// serif, which is exactly what read as "plain, like an essay" -- see
// PROGRESS.md). A local file has no network dependency at build or
// runtime. Plus Jakarta Sans variable file covers weights 200-800.
const jakartaSans = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-sans",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobLens",
  description:
    "AI-assisted job search: tailored resumes and cover letters, application tracking, and a deduplicated multi-source job board.",
};

// Runs before paint so the toggle (see components/theme/ThemeToggle.tsx)
// applies before first render -- without this, switching to dark mode
// would flash the light theme on every navigation. Also sets `color-scheme`
// (not just the `.dark` class), which native form controls -- e.g. the plain
// <select> elements in ApplicationRow -- key off directly; without it they
// render with light OS chrome even while the rest of the page is dark.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakartaSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="theme-color" content="oklch(0.99 0.006 75)" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="oklch(0.16 0.012 40)" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
