import { timeline } from "../data/site";

export default function Timeline() {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow" data-reveal>
            مسیر حرفه‌ای
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            از ۱۵ سالگی <span className="grad-text">تا امروز</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
            نقاط عطف مسیر من؛ فقط تاریخ‌هایی که در رزومه‌ام آمده‌اند.
          </p>
        </div>

        <div className="timeline">
          {timeline.map((t, i) => (
            <div className="tl-item" key={t.period + t.title} data-reveal data-delay={i + 1}>
              <span className="tl-dot" aria-hidden="true" />
              <span className="tl-period">{t.period}</span>
              <h3>{t.title}</h3>
              <p>{t.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}