"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile, projects } from "../data/site";
import { Icon } from "./Icon";
import MagneticLink from "./MagneticLink";
import CodeWindow from "./CodeWindow";
import { createLaptopScene } from "./three/laptop";
import { projectsGeometry, T, clamp } from "./three/timeline";

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** مرحله‌های روایت — فقط برای نمایش نشانگر کنار صفحه. */
const PHASES = [
  { at: 0.0, label: "لپ‌تاپ" },
  { at: 0.06, label: "ویندوز" },
  { at: 0.16, label: "نوشتن کد" },
  { at: 0.4, label: "دربارهٔ من" },
  { at: 0.65, label: "پروژه‌ها" },
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

/** نشانگر مرحله‌ها در گوشهٔ صفحه. */
function PhaseRail() {
  return (
    <ol className="intro3d-rail" aria-hidden="true">
      {PHASES.map((phase, i) => (
        <li key={phase.label} className="intro3d-rail-item" data-index={i}>
          <span className="intro3d-rail-dot" />
          <span className="intro3d-rail-label">{phase.label}</span>
        </li>
      ))}
      <span className="intro3d-rail-line" />
    </ol>
  );
}

export default function LaptopExperience() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const liveRef = useRef(null);
  const liveIndexRef = useRef(-1);
  // سرور و کاربران بدون WebGL همان نسخه‌ی استاتیک را می‌بینند.
  const [mode, setMode] = useState("static");
  const [live, setLive] = useState(null);

  /** شمارهٔ پروژهٔ فعلی در اسلایدر، از روی پیشرفت اسکرول. */
  const carouselIndex = useCallback((p) => {
    const [a, b] = T.carousel;
    const t = clamp01((p - a) / (b - a));
    return Math.round(t * (projects.length - 1));
  }, []);

  const setLiveUrl = useCallback((url) => {
    liveRef.current = url;
    liveIndexRef.current = carouselIndex(progressRef.current);
    setLive(url);
  }, [carouselIndex]);

  const closeLive = useCallback(() => {
    liveRef.current = null;
    liveIndexRef.current = -1;
    setLive(null);
  }, []);

  const progressRef = useRef(0);

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

    /* ---------- پیش‌نمایش زندهٔ پروژه ---------- */

    const btn = projectsGeometry().viewBtn;

    scene.onScreenTap((pt, st) => {
      if (liveRef.current) return; // نمای زنده باز است
      const hit =
        pt.x >= btn.x &&
        pt.x <= btn.x + btn.w &&
        pt.y >= btn.y &&
        pt.y <= btn.y + btn.h;
      if (!hit) return;
      const p = projects[clamp(Math.round(st.projects.pos), 0, projects.length - 1)];
      if (p && p.url) setLiveUrl(p.url);
    });

    scene.onLiveTransform((matrix) => {
      if (frameRef.current) frameRef.current.style.transform = matrix;
    });

    const applyProgress = () => {
      const total = section.offsetHeight - window.innerHeight;
      const raw = total > 0 ? -section.getBoundingClientRect().top / total : 0;
      const p = clamp01(raw);

      scene.setProgress(p);
      section.style.setProperty("--p", p.toFixed(4));
      progressRef.current = p;

      // با اسکرول به پروژهٔ بعدی، نمای زنده بسته می‌شود
      if (liveRef.current && carouselIndex(p) !== liveIndexRef.current) {
        closeLive();
      }

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
      scene.onLiveTransform(null);
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
            <PhaseRail />
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

      {/*
        پیش‌نمایش زندهٔ سایت پروژه.
        این عنصر با ماتریس CSS که صحنهٔ سه‌بعدی هر فریم می‌دهد، دقیقاً روی
        صفحهٔ لپ‌تاپ می‌نشیند؛ پس iframe واقعی و تعاملی است، نه تصویر.
      */}
      {live && (
        <div className="intro3d-live" aria-hidden="true">
          <div className="intro3d-live-frame" ref={frameRef}>
            <iframe
              src={live}
              title="پیش‌نمایش زندهٔ پروژه"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {live && (
        <button
          type="button"
          className="intro3d-live-close"
          onClick={closeLive}
        >
          بستن پیش‌نمایش
        </button>
      )}
    </section>
  );
}