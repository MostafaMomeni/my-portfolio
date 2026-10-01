import "./globals.css";
import { profile, projects } from "../data/site";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mostafamomeni.dev";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "مصطفی مومنی | برنامه‌نویس Frontend و هوش مصنوعی",
    template: "%s | مصطفی مومنی",
  },
  description:
    "پورتفولیوی مصطفی مومنی، برنامه‌نویس Frontend و هوش مصنوعی از قم. توسعه رابط‌های کاربری مدرن با React و Next.js، و پروژه‌های هوش مصنوعی شامل یادگیری ماشین، بینایی ماشین و مدل‌های زبانی با Python.",
  keywords: [
    "مصطفی مومنی",
    "Mostafa Momeni",
    "برنامه نویس فرانت اند",
    "برنامه نویس هوش مصنوعی",
    "Frontend Developer",
    "AI Developer",
    "React",
    "Next.js",
    "Python",
    "Machine Learning",
    "پورتفولیو",
    "قم",
  ],
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: `${profile.name} | Portfolio`,
    title: "مصطفی مومنی | برنامه‌نویس Frontend و هوش مصنوعی",
    description:
      "پورتفولیوی مصطفی مومنی، برنامه‌نویس Frontend و هوش مصنوعی. توسعه رابط کاربری مدرن و پروژه‌های هوش مصنوعی.",
  },
  twitter: {
    card: "summary_large_image",
    title: "مصطفی مومنی | برنامه‌نویس Frontend و هوش مصنوعی",
    description:
      "پورتفولیوی مصطفی مومنی، برنامه‌نویس Frontend و هوش مصنوعی از قم.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** داده ساخت‌یافته: Person + WebSite + CreativeWork برای پروژه‌های عمومی */
function StructuredData() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: profile.name,
    alternateName: profile.nameEn,
    jobTitle: profile.role,
    description: profile.summary,
    url: SITE_URL,
    email: profile.email,
    telephone: `tel:${profile.phone}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Qom",
      addressCountry: "IR",
    },
    sameAs: [profile.github, profile.telegram, profile.instagram],
    knowsAbout: [
      "Frontend Development",
      "React",
      "Next.js",
      "JavaScript",
      "TypeScript",
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Large Language Models",
      "Natural Language Processing",
      "Data Analysis",
    ],
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "دانشگاه آزاد اسلامی قم",
    },
    worksFor: {
      "@type": "Organization",
      name: "شرکت طلوع نجم",
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: `${profile.name} | Portfolio`,
    description: profile.shortBio,
    inLanguage: "fa-IR",
    author: { "@id": `${SITE_URL}/#person` },
  };

  const works = projects
    .filter((p) => !p.confidential)
    .map((p) => ({
      "@type": "CreativeWork",
      "@id": `${SITE_URL}/projects/${p.slug}#work`,
      name: p.title,
      description: p.summary,
      url: p.url || `${SITE_URL}/projects/${p.slug}`,
      dateCreated: p.date || undefined,
      creator: { "@id": `${SITE_URL}/#person` },
      keywords: p.tech.join(", "),
      inLanguage: "fa-IR",
    }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [person, website, ...works],
          }),
        }}
      />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a href="#home" className="skip-link">
          رفتن به محتوای اصلی
        </a>
        {children}
        <StructuredData />
      </body>
    </html>
  );
}