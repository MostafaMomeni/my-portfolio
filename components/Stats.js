import { stats } from "../data/site";

/** آمار — همه اعداد مستقیماً از منابع واقعی استخراج شده‌اند. */
export default function Stats() {
  return (
    <section className="stats-band" aria-label="آمار">
      <div className="shell stats-grid">
        {stats.map((s, i) => (
          <div className="stat" key={s.label} data-reveal data-delay={i + 1}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-hint">{s.hint}</div>
          </div>
        ))}
      </div>
    </section>
  );
}