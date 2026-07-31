import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Self-hosted (app/fonts/), not next/font/google -- fetching from Google's
// CDN at build time proved unreliable in this environment (see PROGRESS.md).
// IBM Plex Sans/Mono, not variable builds (IBM Plex doesn't ship one) --
// four weights of Sans cover UI text, two of Mono cover the data-dense
// figures (salary, dates, category tags) the job board's redesign leans on.
const plexSans = localFont({
  src: [
    { path: "./fonts/IBMPlexSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/IBMPlexSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/IBMPlexSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const plexMono = localFont({
  src: [
    { path: "./fonts/IBMPlexMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/IBMPlexMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JobLens",
  description:
    "Search real STEM jobs -- software, data/ML, hardware, biotech, and infrastructure roles pulled directly from company ATS platforms, deduplicated and categorized. AI resume and cover letter tailoring built in.",
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="theme-color" content="oklch(0.985 0.003 250)" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="oklch(0.145 0.006 250)" media="(prefers-color-scheme: dark)" />
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
