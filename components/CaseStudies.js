import Link from "next/link";
import { featuredProjects } from "../data/site";
import { Icon } from "./Icon";

/** کیس استادی — فقط برای پروژه‌های شاخص، و فقط با اطلاعات مستند. */
export default function CaseStudies() {
  const cases = featuredProjects.filter(
    (p) => p.overview && p.problem && p.goal && p.role && p.result
  );

  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow" data-reveal>
            مطالعه موردی
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            پشت هر <span className="grad-text">پروژه</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
            خلاصه‌ای از مسئله، هدف، نقش من و نتیجه پروژه‌های کلیدی — فقط بر پایه
            اطلاعاتی که در رزومه و خودِ پروژه‌ها موجود است.
          </p>
        </div>

        <div className="case-grid">
          {cases.map((p, i) => (
            <article className="card case-card" key={p.slug} data-reveal>
              <div>
                <div className="case-index">
                  {String(i + 1).padStart(2, "0")} / {String(cases.length).padStart(2, "0")}
                </div>
                <h3 className="case-title">{p.title}</h3>
              </div>

              <dl className="case-rows">
                <div className="case-row">
                  <dt>نمای کلی</dt>
                  <dd>{p.overview}</dd>
                </div>
                <div className="case-row">
                  <dt>مسئله</dt>
                  <dd>{p.problem}</dd>
                </div>
                <div className="case-row">
                  <dt>هدف</dt>
                  <dd>{p.goal}</dd>
                </div>
                <div className="case-row">
                  <dt>نقش من</dt>
                  <dd>{p.role}</dd>
                </div>
                <div className="case-row">
                  <dt>نتیجه</dt>
                  <dd>{p.result}</dd>
                </div>
              </dl>

              <div className="case-tech">
                {p.tech.map((t) => (
                  <span className="chip ltr" key={t}>
                    {t}
                  </span>
                ))}
                <Link href={`/projects/${p.slug}`} className="project-link is-detail">
                  مطالعه کامل
                  <Icon name="arrow-left" size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}