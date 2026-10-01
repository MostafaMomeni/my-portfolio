import { featuredProjects, otherProjects } from "../data/site";
import ProjectCard from "./ProjectCard";
import { Icon } from "./Icon";

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="shell">
        <div className="section-head">
          <span className="eyebrow" data-reveal>
            پروژه‌ها
          </span>
          <h2 className="section-title" data-reveal data-delay="1">
            کارهایی که <span className="grad-text">ساخته‌ام</span>
          </h2>
          <p className="section-desc" data-reveal data-delay="2">
            پروژه‌های واقعی که برای کارفرماها و مجموعه‌های مختلف ساخته‌ام. تصویر
            هر کارت، اسکرین‌شات واقعی همان پروژه است.
          </p>
        </div>

        <div className="project-grid">
          {featuredProjects.map((p) => (
            <ProjectCard project={p} key={p.slug} />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            margin: "clamp(38px,5vw,56px) 0 26px",
          }}
          data-reveal
        >
          <h3 style={{ fontSize: 20, whiteSpace: "nowrap" }}>سایر پروژه‌ها</h3>
          <span style={{ flex: 1, height: 1, background: "var(--grad-line)" }} />
        </div>

        <div className="project-grid">
          {otherProjects.map((p) => (
            <ProjectCard project={p} key={p.slug} />
          ))}
        </div>

        <div
          style={{
            marginTop: 34,
            padding: "26px 24px",
            borderRadius: "var(--r-lg)",
            border: "1px dashed var(--line-strong)",
            display: "flex",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
          data-reveal
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
            <span className="pillar-icon" aria-hidden="true">
              <Icon name="github" size={21} />
            </span>
            <div>
              <strong style={{ display: "block", fontSize: 15.5 }}>
                کدهای بیشتری هم هست
              </strong>
              <span style={{ fontSize: 13.5, color: "var(--text-3)" }}>
                مخازن عمومی من در GitHub را ببینید
              </span>
            </div>
          </div>
          <a
            href="https://github.com/MostafaMomeni"
            className="btn btn-ghost btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="github" size={16} />
            مشاهده GitHub
          </a>
        </div>
      </div>
    </section>
  );
}