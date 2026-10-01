import { skillGroups } from "../data/site";
import { Icon } from "./Icon";

export default function Skills() {
  return (
    <section className="section" id="skills">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow" data-reveal>
            مهارت‌ها
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            جعبه‌ابزار <span className="grad-text">من</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
           مهارت هایی که من در طی این سالها آنها را کسب کرده ام 
          </p>
        </div>

        <div className="skills-grid">
          {skillGroups.map((group, gi) => (
            <div
              className="card skill-card"
              key={group.id}
              data-reveal
              data-delay={gi + 1}
            >
              <div className="skill-head">
                <span className="pillar-icon" aria-hidden="true">
                  <Icon name={group.icon} size={21} />
                </span>
                <div>
                  <h3>{group.title}</h3>
                  <p>{group.caption}</p>
                </div>
              </div>

              <ul className="skill-list">
                {group.skills.map((s) => (
                  <li key={s.name} className="skill-tag" title={s.note}>
                    <span className="ltr">{s.name}</span>
                    <span className="skill-note">{s.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}