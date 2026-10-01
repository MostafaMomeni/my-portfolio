import { education, experience } from "../data/site";
import { Icon } from "./Icon";

export default function Experience() {
  return (
    <section className="section" id="experience">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow" data-reveal>
            سوابق
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            تجربه و <span className="grad-text">تحصیلات</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
            مسیر حرفه‌ای و تحصیلی من.
          </p>
        </div>

        <div className="exp-grid">
          {experience.map((e, i) => (
            <div className="card exp-card" key={e.company} data-reveal data-delay={i + 1}>
              <span className="exp-logo" aria-hidden="true">
                <Icon name="briefcase" size={22} />
              </span>
              <span className="exp-period">{e.period}</span>
              <h3>{e.role}</h3>
              <div className="exp-org">{e.company}</div>
              <div className="exp-loc">
                <Icon name="pin" size={13} /> {e.location}
              </div>
              <p>{e.text}</p>
              <ul className="exp-points">
                {e.points.map((pt) => (
                  <li className="exp-point" key={pt}>
                    <Icon name="check" size={15} />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {education.map((e, i) => (
            <div
              className="card exp-card"
              key={e.school}
              data-reveal
              data-delay={i + 2}
            >
              <span className="exp-logo" aria-hidden="true">
                <Icon name="cap" size={22} />
              </span>
              <span className="exp-period">{e.period}</span>
              <h3>{e.degree}</h3>
              <div className="exp-org">{e.school}</div>
              <div className="exp-loc">
                <Icon name="pin" size={13} /> {e.location}
              </div>
              <p>
               {e.text}
              </p>
              <ul className="exp-points">
                <li className="exp-point">
                  <Icon name="star" size={15} />
                  {e.grade}
                </li>
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}