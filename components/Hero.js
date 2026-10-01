import { profile } from "../data/site";
import { Icon } from "./Icon";
import MagneticLink from "./MagneticLink";

const facts = [
  { icon: "pin", text: profile.location },
  { icon: "briefcase", text: "برنامه‌نویس در شرکت طلوع نجم" },
  { icon: "layers", text: "Frontend + Artificial Intelligence" },
];

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="shell hero-grid">
        <div>
          <div className="hero-badge" data-reveal>
            <span className="pulse-dot" aria-hidden="true" />
            <span>آماده همکاری در پروژه‌های جدید</span>
          </div>

          <h1 data-reveal data-delay="1">
            <span className="grad-text">{profile.name}</span>
          </h1>
          <span className="hero-name-en" data-reveal data-delay="1">
            {profile.nameEn.toUpperCase()}
          </span>

          <div className="hero-role" data-reveal data-delay="2">
            <span>برنامه‌نویس</span>
            <span className="role-x ltr" aria-hidden="true">
              ×
            </span>
            <span>توسعه‌دهنده هوش مصنوعی</span>
          </div>

          <p className="hero-text" data-reveal data-delay="2">
            رابط‌های کاربری مدرن و تجربه‌های دیجیتال می‌سازم؛ و در کنار توسعه
            فرانت‌اند، روی راهکارهای هوش مصنوعی، یادگیری ماشین و مدل‌های زبانی کار
            می‌کنم.
          </p>

          <div className="hero-actions" data-reveal data-delay="3">
            <MagneticLink href="#projects" className="btn btn-primary">
              <Icon name="layers" size={17} />
              مشاهده پروژه‌ها
            </MagneticLink>
            <MagneticLink href="#about" className="btn btn-ghost">
              <Icon name="user" size={17} />
              درباره من
            </MagneticLink>
            <MagneticLink
              href={profile.github}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="github" size={17} />
              GitHub
            </MagneticLink>
            <MagneticLink href="#contact" className="btn btn-ghost">
              <Icon name="mail" size={17} />
              تماس با من
            </MagneticLink>
          </div>

          <div className="hero-meta" data-reveal data-delay="4">
            {facts.map((f) => (
              <span className="hero-meta-item" key={f.icon}>
                <Icon name={f.icon} size={16} />
                {f.text}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-visual" data-reveal="right">
          <div className="orbit orbit-1" aria-hidden="true" />
          <div className="orbit orbit-2" aria-hidden="true" />

          <div className="term">
            <div className="term-bar">
              <span className="term-dot r" />
              <span className="term-dot y" />
              <span className="term-dot g" />
              <span className="term-file">developer.py</span>
            </div>
            <div className="term-body">
              <div>
                <span className="tok-com"># Frontend × Artificial Intelligence</span>
              </div>
              <div>
                <span className="tok-key">class</span>{" "}
                <span className="tok-fn">Developer</span>(<span className="tok-num">3</span>
                , <span className="tok-num">16</span>, <span className="tok-str">&quot;Qom&quot;</span>,{" "}
                <span className="tok-str">&quot;Iran&quot;</span>):
              </div>
              <div>
                {"    "}
                <span className="tok-prop">name</span> ={" "}
                <span className="tok-str">&quot;Mostafa Momeni&quot;</span>
              </div>
              <div>
                {"    "}
                <span className="tok-prop">focus</span> = [<span className="tok-str">&quot;Frontend&quot;</span>,{" "}
                <span className="tok-str">&quot;AI&quot;</span>]
              </div>
              <div>
                {"    "}
                <span className="tok-prop">stack</span> = [<span className="tok-str">&quot;React&quot;</span>,{" "}
                <span className="tok-str">&quot;Next.js&quot;</span>,{" "}
                <span className="tok-str">&quot;Python&quot;</span>]
              </div>
              <div>&nbsp;</div>
              <div>
                <span className="tok-key">def</span> <span className="tok-fn">build</span>(
                <span className="tok-prop">self</span>, idea):
              </div>
              <div>
                {"    "}
                <span className="tok-key">return</span>{" "}
                <span className="tok-fn">ship</span>(idea, craft=<span className="tok-str">&quot;obsessed&quot;</span>)
              </div>
              <div>&nbsp;</div>
              <div>
                <span className="tok-fn">Developer</span>(<span className="tok-num">3</span>,{" "}
                <span className="tok-num">16</span>).<span className="tok-fn">build</span>(
                <span className="tok-str">&quot;the next idea&quot;</span>)
              </div>
              <span className="cursor-blink" />
            </div>
          </div>

          <div className="hero-float hero-float-1" aria-hidden="true">
            <Icon name="react" size={16} />
            <span>React</span>
          </div>
          <div className="hero-float hero-float-2" aria-hidden="true">
            <Icon name="brain" size={16} />
            <span>Machine Learning</span>
          </div>
        </div>
      </div>
    </section>
  );
}