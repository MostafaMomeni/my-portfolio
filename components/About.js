import { profile } from "../data/site";
import { Icon } from "./Icon";

const facts = [
  { k: "نام", v: profile.name },
  { k: "نام انگلیسی", v: profile.nameEn },
  { k: "عنوان", v: profile.role },
  { k: "محل سکونت", v: profile.location },
  { k: "تاریخ تولد", v: profile.birthDate },
  { k: "زبان انگلیسی", v: profile.englishLevel },
];

const tags = [
  "Frontend Development",
  "React",
  "Next.js",
  "JavaScript",
  "TypeScript",
  "Python",
  "Machine Learning",
  "Deep Learning",
  "Computer Vision",
  "LLM",
  "NLP",
];

export default function About() {
  return (
    <section className="section" id="about">
      <div className="shell about-grid">
        <div className="about-visual">
          <div className="about-card" data-reveal>
            <div className="about-avatar" aria-hidden="true">
              {profile.initials}
            </div>
            <h3>{profile.name}</h3>
            <div className="about-role">{profile.role}</div>

            <dl className="about-facts">
              {facts.map((f) => (
                <div className="about-fact" key={f.k}>
                  <dt>{f.k}</dt>
                  <dd className={/^[A-Za-z]/.test(f.v) ? "ltr" : undefined}>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="about-body">
          <span className="eyebrow" data-reveal>
            درباره من
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            سال‌ها پیش شروع کردم، <span className="grad-text">هنوز دارم یاد می‌گیرم</span>
          </h2>

          <p data-reveal data-delay="2">
            من از حدود <strong>۱۵ سالگی</strong> وارد دنیای برنامه‌نویسی شدم و
            مسیرم را با <strong>Frontend Development</strong> شروع کردم. آن روزها
            تمرکزم روی ساختن رابط‌های کاربری و درست کردن جزئیات ظاهری و تجربه
            کاربری بود.
          </p>

          <p data-reveal data-delay="2">
            با گذشت زمان مسیر گسترده‌تر شد. امروز در کنار توسعه وب با{" "}
            <strong>React</strong> و <strong>Next.js</strong>، در حوزه{" "}
            <strong>هوش مصنوعی</strong> هم فعالیت می‌کنم — از یادگیری ماشین و
            یادگیری عمیق تا بینایی ماشین، پردازش زبان طبیعی و مدل‌های زبانی بزرگ.
            زبان اصلی‌ام در این حوزه <strong>Python</strong> است.
          </p>

          <p data-reveal data-delay="3">
            روی پروژه‌های واقعی کار کرده‌ام: وب‌سایت‌ها و ابزارهای مجموعه ۹ فلک
            برای محققان نجوم، فروشگاه اینترنتی چیپ‌یاب، ابزار مدیریت مشتریان
            طلافروشان و پروژه‌های هوش مصنوعی. در حال حاضر دانشجوی مهندسی کامپیوتر
            هستم و هم‌زمان در شرکت طلوع نجم به‌عنوان برنامه‌نویس Frontend و هوش
            مصنوعی کار می‌کنم.
          </p>

          <p data-reveal data-delay="3">
            معتقدم که بهترین محصول‌های دیجیتال از کنار هم گذاشتن طراحی، مهندسی و
            داده به دست می‌آیند — دقیقاً همان چیزی که تلاش می‌کنم در کارهایم
            دنبال کنم.
          </p>

          <div className="about-tags" data-reveal data-delay="4">
            {tags.map((t) => (
              <span className="chip ltr" key={t}>
                {t}
              </span>
            ))}
          </div>

          <div
            style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 26 }}
            data-reveal
            data-delay="4"
          >
            <a href="#projects" className="btn btn-primary btn-sm">
              <Icon name="layers" size={16} />
              دیدن پروژه‌ها
            </a>
            <a href="#contact" className="btn btn-ghost btn-sm">
              <Icon name="mail" size={16} />
              تماس با من
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}