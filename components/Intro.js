import { profile } from "../data/site";
import { Icon } from "./Icon";

const pillars = [
  {
    icon: "code",
    title: "نقطه شروع: Frontend",
    text: "مسیرم را از حدود ۱۵ سالگی با توسعه رابط‌های کاربری شروع کردم؛ با HTML، CSS، JavaScript و سپس React و Next.js.",
  },
  {
    icon: "brain",
    title: "گسترش به هوش مصنوعی",
    text: "در ادامه وارد حوزه هوش مصنوعی شدم و روی یادگیری ماشین، بینایی ماشین، پردازش زبان طبیعی و مدل‌های زبانی کار می‌کنم.",
  },
  {
    icon: "layers",
    title: "هر دو حوزه، یک مسیر",
    text: "این دو مسیر جدا نیستند. امروز پروژه‌های وب و هوش مصنوعی را هم‌زمان جلو می‌برم — از رابط کاربری تا مدلی که پشت آن کار می‌کند.",
  },
];

export default function Intro() {
  return (
    <section className="section">
      <div className="shell intro-grid">
        <div>
          <span className="eyebrow" data-reveal>
            معرفی کوتاه
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            کد و هوش مصنوعی، <span className="grad-text">در یک مسیر</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
            {profile.summary}
          </p>

          <div
            className="hero-meta"
            data-reveal
            data-delay="3"
            style={{ marginTop: 30, display: "inline-grid", gap: 12 }}
          >
            <span className="hero-meta-item">
              <Icon name="cap" size={16} />
              دانشگاه آزاد اسلامی قم — مهندسی کامپیوتر
            </span>
            <span className="hero-meta-item">
              <Icon name="briefcase" size={16} />
              برنامه‌نویس Frontend و هوش مصنوعی در شرکت طلوع نجم
            </span>
          </div>
        </div>

        <div className="pillars">
          {pillars.map((p, i) => (
            <div className="pillar" key={p.title} data-reveal data-delay={i + 1}>
              <span className="pillar-icon">
                <Icon name={p.icon} size={21} />
              </span>
              <div>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}