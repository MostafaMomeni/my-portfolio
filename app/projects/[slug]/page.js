import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getProject, projects, profile } from "../../../data/site";
import { Icon } from "../../../components/Icon";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Reveal from "../../../components/Reveal";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mostafamomeni.dev";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.title} — ${project.subtitle}`;
  const description = project.summary;

  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      locale: "fa_IR",
      url: `${SITE_URL}/projects/${project.slug}`,
      title: `${title} | ${profile.name}`,
      description,
      ...(project.image ? { images: [{ url: project.image, width: 1200, height: 750 }] } : {}),
    },
    twitter: {
      card: project.image ? "summary_large_image" : "summary",
      title: `${title} | ${profile.name}`,
      description,
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const idx = projects.findIndex((p) => p.slug === slug);
  const prev = projects[idx - 1];
  const next = projects[idx + 1];

  const isPrivate = project.confidential;
  const brandOnly = project.imageKind === "brand";

  const ld = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: project.url || `${SITE_URL}/projects/${project.slug}`,
    dateCreated: project.date || undefined,
    inLanguage: "fa-IR",
    creator: { "@type": "Person", name: profile.name, url: SITE_URL },
    about: project.tech,
  };

  return (
    <>
      <Navbar />
      <main>
        <section className="pd-hero">
          <div className="shell">
            <nav className="breadcrumb" aria-label="مسیر صفحه">
              <Link href="/">خانه</Link>
              <Icon name="arrow-left" size={13} />
              <Link href="/#projects">پروژه‌ها</Link>
              <Icon name="arrow-left" size={13} />
              <span>{project.title}</span>
            </nav>

            <span className="eyebrow">{categories[project.category]}</span>
            <h1 className="grad-text">{project.title}</h1>
            <div className="pd-sub">{project.subtitle}</div>
            <p className="pd-lede">{project.summary}</p>

            <dl className="pd-meta">
              {project.employer && (
                <div>
                  <dt className="k">کارفرما</dt>
                  <dd className="v">{project.employer}</dd>
                </div>
              )}
              {project.date && (
                <div>
                  <dt className="k">تاریخ</dt>
                  <dd className="v">{project.date}</dd>
                </div>
              )}
              <div>
                <dt className="k">نقش</dt>
                <dd className="v">{project.role}</dd>
              </div>
              <div>
                <dt className="k">دسته‌بندی</dt>
                <dd className="v">{categories[project.category]}</dd>
              </div>
            </dl>

            {project.image && (
              <figure className="pd-figure">
                <Image
                  src={project.image}
                  alt={
                    brandOnly
                      ? `نشان رسمی پروژه ${project.title}`
                      : `تصویر واقعی از وب‌سایت ${project.title}`
                  }
                  width={1200}
                  height={750}
                  priority
                  quality={82}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
                <figcaption>
                  {brandOnly
                    ? "نشان رسمی پروژه — تصویر از دامنه خود پروژه"
                    : "تصویر واقعی از وب‌سایت پروژه"}
                </figcaption>
              </figure>
            )}
          </div>
        </section>

        <section className="shell pd-body">
          <div>
            <div className="pd-section" data-reveal>
              <h2>نمای کلی</h2>
              <p>{project.overview}</p>
            </div>

            <div className="pd-section" data-reveal>
              <h2>مسئله</h2>
              <p>{project.problem}</p>
            </div>

            <div className="pd-section" data-reveal>
              <h2>هدف</h2>
              <p>{project.goal}</p>
            </div>

            <div className="pd-section" data-reveal>
              <h2>نقش من</h2>
              <p>{project.role}</p>
            </div>

            {project.details?.length > 0 && (
              <div className="pd-section" data-reveal>
                <h2>جزئیات</h2>
                <ul className="pd-list">
                  {project.details.map((d) => (
                    <li key={d}>
                      <Icon name="check" size={16} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pd-section" data-reveal>
              <h2>نتیجه</h2>
              <p>{project.result}</p>
            </div>

            {project.note && (
              <div className="pd-section" data-reveal>
                <h2>نکته</h2>
                <p>{project.note}</p>
              </div>
            )}
          </div>

          <aside className="pd-aside">
            <div className="card pd-aside-card" data-reveal>
              {project.url ? (
                <a
                  href={project.url}
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="external" size={16} />
                  مشاهده سایت
                </a>
              ) : (
                <span
                  className="btn btn-ghost"
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                  aria-disabled="true"
                >
                  <Icon name="lock" size={16} />
                  بدون لینک عمومی
                </span>
              )}
            </div>

            <div className="card pd-aside-card" data-reveal>
              <h3>فناوری‌ها</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {project.tech.map((t) => (
                  <span className="chip ltr" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="card pd-aside-card" data-reveal>
              <h3>مشخصات</h3>
              <div className="pd-aside-list">
                <div className="pd-aside-row">
                  <span>کارفرما</span>
                  <b>{project.employer}</b>
                </div>
                <div className="pd-aside-row">
                  <span>تاریخ</span>
                  <b>{project.date || "—"}</b>
                </div>
                <div className="pd-aside-row">
                  <span>دسته</span>
                  <b>{categories[project.category]}</b>
                </div>
              </div>
            </div>

            <div className="card pd-aside-card" data-reveal>
              <h3>ارتباط با من</h3>
              <a href={`mailto:${profile.email}`} className="btn btn-ghost btn-sm">
                <Icon name="mail" size={15} />
                ارسال ایمیل
              </a>
            </div>
          </aside>
        </section>

        <div className="shell">
          <nav className="pd-nav" aria-label="پیمایش بین پروژه‌ها">
            {prev ? (
              <Link href={`/projects/${prev.slug}`} className="btn btn-ghost btn-sm">
                <Icon name="arrow-left" size={15} />
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            <Link href="/#projects" className="btn btn-ghost btn-sm">
              همه پروژه‌ها
            </Link>
            {next ? (
              <Link href={`/projects/${next.slug}`} className="btn btn-ghost btn-sm">
                {next.title}
                <Icon name="arrow-left" size={15} style={{ transform: "scaleX(-1)" }} />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </main>

      <Footer />
      <Reveal />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
    </>
  );
}