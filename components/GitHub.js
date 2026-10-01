import { profile, repos } from "../data/site";
import { Icon } from "./Icon";

/** آمار گیت‌هاب از API رسمی گرفته شده است (۱۲ مخزن عمومی). */
const ghStats = [
  { value: "۱۲", label: "مخزن عمومی" },
  { value: "۱۴", label: "دنبال‌کننده" },
  { value: "۲۰۲۳", label: "عضویت از" },
];

export default function GitHub() {
  return (
    <section className="section">
      <div className="shell">
        <div className="gh-head">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow" data-reveal>
              متن‌باز
            </span>
            <h2 className="section-title" data-reveal data-delay="1">
              کدهایی که <span className="grad-text">می‌سازم</span>
            </h2>
            <p className="section-desc" data-reveal data-delay="2">
              بخشی از مخازن عمومی من در GitHub؛ از پروژه‌های فرانت‌اند تا تمرین‌های
              یادگیری ماشین.
            </p>
          </div>

          <div className="gh-stats" data-reveal data-delay="3">
            {ghStats.map((s) => (
              <div className="gh-stat" key={s.label}>
                <b className="ltr">{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="repo-grid">
          {repos.map((r, i) => (
            <a
              className="card repo"
              href={r.url}
              key={r.name}
              target="_blank"
              rel="noopener noreferrer"
              data-reveal
              data-delay={(i % 2) + 1}
            >
              <div className="repo-top">
                <span className="repo-name">{r.name}</span>
                <span className="repo-lang ltr">
                  <i aria-hidden="true" />
                  {r.language}
                </span>
              </div>
              <p className="repo-desc">{r.desc}</p>
              <div className="repo-tech">
                {r.tech.map((t) => (
                  <span className="chip ltr" key={t}>
                    {t}
                  </span>
                ))}
                <span className="project-link is-detail" style={{ marginInlineStart: "auto" }}>
                  <Icon name="arrow-up-left" size={15} />
                </span>
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 34 }} data-reveal>
          <a
            href={profile.github}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="github" size={17} />
            همه مخازن در GitHub
          </a>
        </div>
      </div>
    </section>
  );
}