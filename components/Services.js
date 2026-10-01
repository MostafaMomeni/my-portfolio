import { services } from "../data/site";
import { Icon } from "./Icon";

export default function Services() {
  return (
    <section className="section">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow" data-reveal>
            چه کاری انجام می‌دهم
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            حوزه‌های <span className="grad-text">کاری من</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
            خدماتی که واقعاً ارائه می‌دهم — هر کدام بر پایه مهارت‌ها و پروژه‌های
            واقعی‌ام، نه شعار.
          </p>
        </div>

        <div className="services-grid">
          {services.map((s, i) => (
            <div
              className="card service"
              key={s.title}
              data-reveal
              data-delay={(i % 3) + 1}
            >
              <span className="service-icon">
                <Icon name={s.icon} size={22} />
              </span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}