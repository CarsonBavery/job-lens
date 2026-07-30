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
// would flash the light theme on every navigation.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={jakartaSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
