import { profile } from "../data/site";
import { Icon } from "./Icon";

const items = [
  { icon: "mail", label: "ایمیل", value: profile.emailName, url: profile.email },
  { icon: "telegram", label: "تلگرام", value: profile.telegramHandle, url: profile.telegram },
  { icon: "github", label: "GitHub", value: profile.githubHandle, url: profile.github },
  {
    icon: "instagram",
    label: "اینستاگرام",
    value: profile.instagramHandle,
    url: profile.instagram,
  },
  { icon: "phone", label: "تلفن", value: profile.phoneDisplay, url: `tel:${profile.phone}` },
  { icon: "pin", label: "محل سکونت", value: profile.location, url: null },
];

export default function Contact() {
  return (
    <section className="section" id="contact">
      <div className="shell">
        <div className="contact-wrap" data-reveal>
          <div className="contact-grid">
            <div>
              <span className="eyebrow">تماس</span>
              <h2>
                بیایید <span className="grad-text">با هم بسازیم</span>
              </h2>
              <p className="contact-lead">
                اگر پروژه‌ای در ذهن دارید — چه یک پروژه فرانت‌اند و چه یک راهکار
                هوش مصنوعی — خوشحال می‌شوم درباره‌اش صحبت کنیم. از طریق هر کدام از
                راه‌های زیر در ارتباط باشید.
              </p>

              <div className="contact-actions">
                <a href={profile.email} target="_blank" className="btn btn-primary">
                  <Icon name="mail" size={17} />
                  ارسال ایمیل
                </a>
                <a
                  href={profile.telegram}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="telegram" size={17} />
                  تلگرام
                </a>
                <a
                  href={profile.github}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="github" size={17} />
                  GitHub
                </a>
                <a
                  href={profile.instagram}
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="instagram" size={17} />
                  اینستاگرام
                </a>
              </div>
            </div>

            <ul className="contact-list">
              {items.map((it) => {
                const inner = (
                  <>
                    <span className="contact-icon">
                      <Icon name={it.icon} size={19} />
                    </span>
                    <span className="contact-item-body">
                      <b>{it.label}</b>
                      <span className={it.icon === "phone" || it.icon === "pin" ? "" : "ltr"}>
                        {it.value}
                      </span>
                    </span>
                    {it.url && <Icon name="arrow-left" size={17} className="arrow" />}
                  </>
                );

                return (
                  <li key={it.label}>
                    {it.url ? (
                      <a
                        className="contact-item"
                        href={it.url}
                        target={it.url.startsWith("http") ? "_blank" : undefined}
                        rel={it.url.startsWith("http") ? "noopener noreferrer" : undefined}
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="contact-item">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}