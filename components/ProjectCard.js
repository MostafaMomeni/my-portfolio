import Image from "next/image";
import Link from "next/link";
import { categories } from "../data/site";
import { Icon } from "./Icon";
import LivePreview from "./LivePreview";

export default function ProjectCard({ project }) {
  const isPrivate = project.confidential;
  const hasImage = Boolean(project.image);

  return (
    <article
      className={`project-card${isPrivate ? " is-private" : ""}`}
      data-reveal
    >
      <div
        className={`project-media${project.imageKind === "brand" ? " is-brand" : ""}`}
      >
        <div className="project-badges">
          <span className="badge">{categories[project.category]}</span>
          {isPrivate && (
            <span className="badge badge-lock">
              <Icon name="lock" size={11} /> محرمانه
            </span>
          )}
        </div>

        {isPrivate ? (
          <div className="project-private-mark">
            <Icon name="lock" size={34} />
            <span>پروژه محرمانه — بدون تصویر و دمو عمومی</span>
          </div>
        ) : (
          <>
            <LivePreview
              url={project.url}
              title={project.title}
              image={project.image}
              alt={
                project.imageKind === "brand"
                  ? `نشان رسمی پروژه ${project.title}`
                  : `تصویر واقعی از وب‌سایت ${project.title}`
              }
            />
          </>
          // hasImage && (
          //   <Image
          //     src={project.image}
          //     alt={
          //       project.imageKind === "brand"
          //         ? `نشان رسمی پروژه ${project.title}`
          //         : `تصویر واقعی از وب‌سایت ${project.title}`
          //     }
          //     fill
          //     sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 600px"
          //     loading="lazy"
          //     quality={82}
          //   />
          // )
        )}
      </div>

      <div className="project-body">
        <div className="project-top">
          <div>
            <h3>{project.title}</h3>
            <div className="project-sub">
              {project.subtitle}
              {project.date ? ` · ${project.date}` : ""}
            </div>
          </div>
        </div>

        <p className="project-desc">{project.summary}</p>

        {project.note && <div className="project-note">{project.note}</div>}

        <div className="project-foot">
          <div className="project-tech">
            {project.tech.map((t) => (
              <span className="chip ltr" key={t}>
                {t}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Link
              href={`/projects/${project.slug}`}
              className="project-link is-detail"
              aria-label={`جزئیات پروژه ${project.title}`}
            >
              جزئیات
              <Icon name="arrow-left" size={15} />
            </Link>
            {project.url && (
              <Link
                href={project.url}
                className="project-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`مشاهده سایت ${project.title} (لینک خارجی)`}
              >
                سایت
                <Icon name="arrow-up-left" size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
