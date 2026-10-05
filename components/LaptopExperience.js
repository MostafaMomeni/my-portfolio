"use client";

import { useEffect, useRef, useState } from "react";
import { profile } from "../data/site";
import { Icon } from "./Icon";
import MagneticLink from "./MagneticLink";
import CodeWindow from "./CodeWindow";
import { createLaptopScene } from "./three/laptop";

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** مرحله‌های روایت — فقط برای نمایش نشانگر کنار صفحه. */
const PHASES = [
  { at: 0.0, label: "شروع" },
  { at: 0.13, label: "باز کردن لپ‌تاپ" },
  { at: 0.42, label: "باز شدن VS Code" },
  { at: 0.58, label: "نوشتن کد" },
];

function HeroCopy() {
  const facts = [
    { icon: "pin", text: profile.location },
    { icon: "briefcase", text: "برنامه‌نویس در شرکت طلوع نجم" },
    { icon: "layers", text: "Frontend + Artificial Intelligence" },
  ];

  return (
    <div className="intro3d-copy">
      <div className="hero-badge intro3d-badge">
        <span className="pulse-dot" aria-hidden="true" />
        <span>آماده همکاری در پروژه‌های جدید</span>
      </div>

      <h1>
        <span className="grad-text">{profile.name}</span>
      </h1>
      <span className="hero-name-en ltr">{profile.nameEn.toUpperCase()}</span>

      <div className="hero-role">
        <span>برنامه‌نویس</span>
        <span className="role-x ltr" aria-hidden="true">
          ×
        </span>
        <span>توسعه‌دهنده هوش مصنوعی</span>
      </div>

      <p className="hero-text">
        رابط‌های کاربری مدرن و تجربه‌های دیجیتال می‌سازم؛ و در کنار توسعه
        فرانت‌اند، روی راهکارهای هوش مصنوعی، یادگیری ماشین و مدل‌های زبانی کار
        می‌کنم.
      </p>

      <div className="hero-actions">
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

      <div className="hero-meta">
        {facts.map((f) => (
          <span className="hero-meta-item" key={f.icon}>
            <Icon name={f.icon} size={16} />
            {f.text}
          </span>
        ))}
      </div>
    </div>
  );
}


export default function LaptopExperience() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  // سرور و کاربران بدون WebGL همان نسخه‌ی استاتیک را می‌بینند.
  const [mode, setMode] = useState("static");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    let scene;
    try {
      scene = createLaptopScene(canvas);
    } catch {
      return; // WebGL در دسترس نیست — همان کارت استاتیک می‌ماند.
    }

    setMode("3d");

    const applyProgress = () => {
      const total = section.offsetHeight - window.innerHeight;
      const raw = total > 0 ? -section.getBoundingClientRect().top / total : 0;
      const p = clamp01(raw);

      scene.setProgress(p);
      section.style.setProperty("--p", p.toFixed(4));

      let phase = 0;
      for (let i = 0; i < PHASES.length; i++) {
        if (p >= PHASES[i].at) phase = i;
      }
      if (section.dataset.phase !== String(phase)) {
        section.dataset.phase = String(phase);
      }
    };

    const onPointerMove = (e) => {
      scene.setPointer(
        (e.clientX / window.innerWidth) * 2 - 1,
        (e.clientY / window.innerHeight) * 2 - 1,
      );
    };

    const onResize = () => {
      // ارتفاع واقعی نوار بالای صفحه تا بوم دقیقاً یک‌نمایشگر را بپوشاند.
      const navH = document.querySelector(".nav")?.offsetHeight ?? 0;
      if (navH) section.style.setProperty("--nav-h", `${navH}px`);
      scene.resize();
      applyProgress();
    };

    // وقتی این بخش از دید خارج است، رندر متوقف شود.
    const io = new IntersectionObserver(
      ([entry]) => scene.setActive(entry.isIntersecting),
      { rootMargin: "5% 0px" },
    );
    io.observe(section);

    window.addEventListener("scroll", applyProgress, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    onResize();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", applyProgress);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      scene.dispose();
    };
  }, []);

  return (
    <section className="intro3d" id="home" ref={sectionRef} data-mode={mode}>
      <div className="intro3d-sticky">
        <div className="intro3d-canvas-wrap">
          <canvas ref={canvasRef} className="intro3d-canvas" aria-hidden="true" />
        </div>

        {mode === "3d" ? (
          <>
            <HeroCopy />
            <div className="intro3d-hint" aria-hidden="true">
              <span className="intro3d-hint-wheel" />
              <span>برای دیدن بقیه، اسکرول کنید</span>
            </div>
          </>
        ) : (
          <div className="intro3d-static">
            <HeroCopy />
            <div className="intro3d-static-code">
              <CodeWindow />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}