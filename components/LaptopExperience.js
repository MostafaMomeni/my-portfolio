"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { profile, projects } from "../data/site";
import { Icon } from "./Icon";
import MagneticLink from "./MagneticLink";
import CodeWindow from "./CodeWindow";
import { createLaptopScene } from "./three/laptop";
import { loadDana, watchSystem } from "./three/desktop";
import { projectsGeometry, T, clamp, liveFrameSize } from "./three/timeline";

/** اندازهٔ iframe زنده در فضای ۱۶۰۰×۱۰۰۰ صفحه — ثابت است. */
const { w: LIVE_W, h: LIVE_H } = liveFrameSize();

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);


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
  const frameRef = useRef(null);
  const liveRef = useRef(null);
  const liveIndexRef = useRef(-1);
  // سرور و کاربران بدون WebGL همان نسخه‌ی استاتیک را می‌بینند.
  const [mode, setMode] = useState("static");
  // پروژه‌ای که سایت زنده‌اش باز است (نه فقط نشانی — تصویر و عنوانش هم لازم است)
  const [live, setLive] = useState(null);
  // "loading" | "ready" | "slow" — وضعیت بارگذاری سایت زنده
  const [liveState, setLiveState] = useState("loading");
  // وضعیت لود اولیه صفحه
  const [pageLoaded, setPageLoaded] = useState(false);
  // پیشرفت اسکرول برای کنترل pointer-events بوم
  const [scrollProgress, setScrollProgress] = useState(0);
  // آیا بوم باید رویدادهای موس بگیرد (بعد از threshold اسکرول)
  const [canvasInteractive, setCanvasInteractive] = useState(false);

  /** شمارهٔ پروژهٔ فعلی در اسلایدر، از روی پیشرفت اسکرول. */
  const carouselIndex = useCallback((p) => {
    const [a, b] = T.carousel;
    const t = clamp01((p - a) / (b - a));
    return Math.round(t * (projects.length - 1));
  }, []);

  const setLiveProject = useCallback(
    (project) => {
      liveRef.current = project.url;
      liveIndexRef.current = carouselIndex(progressRef.current);
      setLiveState("loading");
      setLive(project);
    },
    [carouselIndex],
  );

  const closeLive = useCallback(() => {
    liveRef.current = null;
    liveIndexRef.current = -1;
    setLive(null);
  }, []);

  const progressRef = useRef(0);

  // TEMP-LAB-REMOVE
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("labclick")) return;
    const ids = [];
    ids.push(
      setTimeout(() => {
        const s = document.querySelector(".intro3d");
        const total = s.offsetHeight - window.innerHeight;
        window.scrollTo({ top: total * 0.85, behavior: "instant" });
      }, 800),
    );
    ids.push(
      setTimeout(() => {
        const canvas = document.querySelector(".intro3d-canvas");
        const b = canvas.getBoundingClientRect();
        const map = (sx, sy) => [
          Math.round(b.left + (sx / 1600) * b.width),
          Math.round(b.top + (sy / 1000) * b.height),
        ];
        const [cx, cy] = map((1312 + 1508) / 2, (774 + 824) / 2);
        const el = document.elementFromPoint(cx, cy);
        el?.dispatchEvent(
          new PointerEvent("pointerdown", { clientX: cx, clientY: cy, bubbles: true }),
        );
        window.__click = { cx, cy, hit: el?.className || el?.tagName };
      }, 2600),
    );
    ids.push(
      setTimeout(() => {
        const f = document.querySelector(".intro3d-live-frame");
        const r = f?.getBoundingClientRect();
        document.title = "DIAG " + JSON.stringify({
          click: window.__click,
          liveOpened: !!document.querySelector(".intro3d-live"),
          frame: r ? [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)] : null,
        });
      }, 6500),
    );
    return () => ids.forEach(clearTimeout);
  }, []);

  /* ---------- سقف زمان بارگذاری سایت زنده ---------- */

  // بعضی سایت‌ها سرد بالا می‌آیند. اگر بعد از این مدت رویداد load نرسید،
  // به‌جای یک کادر خالیِ بی‌پایان، راه باز کردن سایت در تب جدید را نشان می‌دهیم.
  useEffect(() => {
    if (!live) return;
    if (liveState !== "loading") return;
    const id = setTimeout(() => {
      setLiveState((s) => (s === "loading" ? "slow" : s));
    }, 9000);
    return () => clearTimeout(id);
  }, [live, liveState]);

  /* ---------- پایش وضعیت واقعی سیستم کاربر ---------- */

  // آیکون‌های نوار وظیفه (باتری، شبکه، صدا) از همین وضعیت می‌خوانند، پس
  // پایش باید حتی اگر صحنهٔ سه‌بعدی اجرا نشد هم روشن باشد.
  useEffect(() => watchSystem(), []);

  /* ---------- اتصال زودهنگام به میزبان سایت‌ها ---------- */

  // پیش از رسیدن کاربر به پنجرهٔ پروژه‌ها، اتصال به میزبان‌ها باز می‌شود تا
  // DNS و TLS موقع کلیک آماده باشند. بدون این، خودِ «باز شدن» سایت کند حس
  // می‌شود چون هر بار از صفر وصل می‌شود.
  useEffect(() => {
    const links = [];
    let done = false;

    const connect = () => {
      if (done) return;
      done = true;
      const origins = new Set();
      for (const p of projects) {
        if (p.url) origins.add(new URL(p.url).origin);
      }
      for (const origin of origins) {
        const link = document.createElement("link");
        link.rel = "preconnect";
        link.href = origin;
        document.head.appendChild(link);
        links.push(link);
      }
    };

    const section = sectionRef.current;
    if (!section) return;

    // به‌محض اینکه کاربر شروع به اسکرول کرد، اتصال باز می‌شود. تا آن لحظه
    // چند دقیقه اسکرول تا پنجرهٔ پروژه‌ها فاصله است، پس وقتی کاربر کلیک می‌کند
    // DNS و TLS از قبل آماده‌اند.
    const check = () => {
      if (window.scrollY > 120) connect();
    };

    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();

    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      links.forEach((l) => l.remove());
    };
  }, []);

  /* ---------- لودر اولیه صفحه ---------- */
  useEffect(() => {
    // کمی صبر می‌کنیم تا همه اسْت‌ها و فونت‌ها لود شوند
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 600); // 600ms برای انیمیشن لودر
    return () => clearTimeout(timer);
  }, []);

  /* ---------- قفل اسکرول در حالت نمای زنده ---------- */

useEffect(() => {
    if (!live) return;

    const anchor = window.scrollY;
    /*
     * قفل اسکرول بدون دست زدن به `overflow`.
     *
     * `overflow: hidden` روی <html> باعث می‌شود `position: sticky` هیرو از
     * کار بیفتد؛ آن‌وقت بوم جابه‌جا می‌شود و ماتریس iframe چند هزار پیکسل
     * بیرون قاب می‌افتد. پس به‌جای آن، خودِ رویدادهای اسکرول را می‌بندیم.
     * چون iframe متقاطع است، چرخ روی خودِ سایت به این گوشه نمی‌رسد.
     */
    const prevent = (e) => e.preventDefault();
    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });

    const SCROLL_KEYS = new Set([
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "PageUp",
      "PageDown",
      "Home",
      "End",
      " ",
      "Spacebar",
    ]);

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLive();
        return;
      }
      if (SCROLL_KEYS.has(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);

    // هر اسکرولی که از راه فوکوس یا برنامه‌نویسی رخ دهد، برمی‌گردد.
    const onScroll = () => {
      if (Math.abs(window.scrollY - anchor) > 1) {
        window.scrollTo({ top: anchor, behavior: "instant" });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      if (Math.abs(window.scrollY - anchor) > 1) {
        window.scrollTo({ top: anchor, behavior: "instant" });
      }
    };
  }, [live, closeLive]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    // فونت دانا باید پیش از نخستین رسمِ بوم آماده باشد، وگرنه متن فارسیِ
    // صفحهٔ لپ‌تاپ با فونت جایگزین کشیده می‌شود و دیگر درست نمی‌شود.
    let stopped = false;
    let teardown = null;

    loadDana().then(() => {
      if (stopped) return;

      let scene;
      try {
        scene = createLaptopScene(canvas);
      } catch {
        return; // WebGL در دسترس نیست — همان کارت استاتیک می‌ماند.
      }

      if (stopped) {
        scene.dispose();
        return;
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
        if (p && p.url) setLiveProject(p);
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
        setScrollProgress(p);

        // بوم پس از ۵٪ اسکرول تعاملی شود (لپ‌تاپ باز می‌شود)
        // در ابتدای صفحه (p=0) محتوا قابل کلیک باشد، بوم رویداد نگیرد
        setCanvasInteractive(p > 0.05);

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

      teardown = () => {
        io.disconnect();
        window.removeEventListener("scroll", applyProgress);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointerMove);
        scene.onLiveTransform(null);
        scene.dispose();
      };
    });

    return () => {
      stopped = true;
      teardown?.();
    };
  }, []);

  return (
    <section className="intro3d" id="home" ref={sectionRef} data-mode={mode} data-page-loaded={pageLoaded} data-canvas-interactive={canvasInteractive}>
      {/* لودر اولیه صفحه - تم برنامه‌نویسی سه‌بعدی */}
      {!pageLoaded && (
        <div className="intro3d-page-loader" aria-hidden="true">
          <div className="intro3d-loader-scene">
            {/* کد تایپ می‌شود */}
            <div className="intro3d-loader-terminal">
              <div className="intro3d-loader-terminal-bar">
                <span className="intro3d-loader-terminal-dot" style={{background: '#ff5f57'}} />
                <span className="intro3d-loader-terminal-dot" style={{background: '#febc2e'}} />
                <span className="intro3d-loader-terminal-dot" style={{background: '#28c840'}} />
              </div>
              <div className="intro3d-loader-terminal-body">
                <div className="intro3d-loader-code-line">
                  <span className="intro3d-loader-prompt">const</span>
                  <span className="intro3d-loader-keyword"> developer</span>
                  <span className="intro3d-loader-operator"> =</span>
                  <span className="intro3d-loader-string"> "Mostafa"</span>
                  <span className="intro3d-loader-punctuation">;</span>
                </div>
                <div className="intro3d-loader-code-line">
                  <span className="intro3d-loader-prompt">const</span>
                  <span class="intro3d-loader-keyword"> skills</span>
                  <span className="intro3d-loader-operator"> =</span>
                  <span className="intro3d-loader-bracket">[</span>
                  <span className="intro3d-loader-string">"React"</span>
                  <span className="intro3d-loader-punctuation">,</span>
                  <span className="intro3d-loader-string">"Three.js"</span>
                  <span className="intro3d-loader-punctuation">,</span>
                  <span className="intro3d-loader-string">"AI/ML"</span>
                  <span className="intro3d-loader-punctuation">,</span>
                  <span className="intro3d-loader-string">"TypeScript"</span>
                  <span className="intro3d-loader-bracket">]</span>
                  <span className="intro3d-loader-punctuation">;</span>
                </div>
                <div className="intro3d-loader-code-line">
                  <span className="intro3d-loader-prompt">const</span>
                  <span className="intro3d-loader-keyword"> build</span>
                  <span className="intro3d-loader-operator"> =</span>
                  <span className="intro3d-loader-function"> ()</span>
                  <span className="intro3d-loader-bracket"> &#61;&#62;</span>
                  <span className="intro3d-loader-bracket"> &#123;</span>
                </div>
                <div className="intro3d-loader-code-line intro3d-loader-indent">
                  <span className="intro3d-loader-keyword">return</span>
                  <span className="intro3d-loader-string"> "Amazing UI"</span>
                  <span className="intro3d-loader-punctuation">;</span>
                </div>
                <div className="intro3d-loader-code-line">
                  <span className="intro3d-loader-bracket">&#125;</span>
                  <span className="intro3d-loader-punctuation">;</span>
                </div>
                <div className="intro3d-loader-cursor-line">
                  <span className="intro3d-loader-prompt">build</span>
                  <span className="intro3d-loader-function">()</span>
                  <span className="intro3d-loader-cursor" aria-hidden="true"></span>
                </div>
              </div>
            </div>
            {/* المان‌های سه‌بعدی شناور: آکولادها، براکت‌ها، سمی‌کالون‌ها */}
            <div className="intro3d-loader-floating-elements" aria-hidden="true">
              <span className="intro3d-float-el" style={{'--i':0}}>&#123;</span>
              <span className="intro3d-float-el" style={{'--i':1}}>&#125;</span>
              <span className="intro3d-float-el" style={{'--i':2}}>&#91;</span>
              <span className="intro3d-float-el" style={{'--i':3}}>&#93;</span>
              <span className="intro3d-float-el" style={{'--i':4}}>&#61;&#62;</span>
              <span className="intro3d-float-el" style={{'--i':5}}>()&#59;</span>
              <span className="intro3d-float-el" style={{'--i':6}}>&#60;/&#62;</span>
              <span className="intro3d-float-el" style={{'--i':7}}>const</span>
              <span className="intro3d-float-el" style={{'--i':8}}>let</span>
              <span className="intro3d-float-el" style={{'--i':9}}>async</span>
              <span className="intro3d-float-el" style={{'--i':10}}>await</span>
              <span className="intro3d-float-el" style={{'--i':11}}>&#96;&#96;&#96;</span>
            </div>
          </div>
        </div>
      )}

      <div className="intro3d-sticky">
        <div className={`intro3d-canvas-wrap${mode === "static" && !pageLoaded ? " is-loading" : ""}`} style={{ pointerEvents: canvasInteractive ? 'auto' : 'none' }}>
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

      {/*
        پیش‌نمایش زندهٔ سایت پروژه.
        این عنصر با ماتریس CSS که صحنهٔ سه‌بعدی هر فریم می‌دهد، دقیقاً روی
        ناحیهٔ محتوای کارت مرورگرِ همان پروژه می‌نشیند — نه روی کل صفحه؛ پس
        سایت داخل پنجرهٔ خودش دیده می‌شود و بقیهٔ لپ‌تاپ دست‌نخورده می‌ماند.
        هم‌زمان اسکرول بقیهٔ صفحه قفل می‌شود تا تمرکز کاربر داخل لپ‌تاپ بماند.
      */}
      {live && (
        <div className="intro3d-live">
          <div className="intro3d-live-scrim" aria-hidden="true" />
          <div
            className="intro3d-live-frame"
            ref={frameRef}
            style={{ width: LIVE_W, height: LIVE_H }}
          >
            {/*
              تا وقتی سایت بالا نیامده، همان تصویر واقعی پروژه زیرش می‌ماند.
              بدون این، یک مستطیل خالی دیده می‌شد و به نظر می‌رسید سایت باز
              نشده است.
            */}
            {live.image && (
              /* تصویر داخل صحنهٔ سه‌بعدی است، نه محتوای صفحه؛ next/image اینجا
                 کمکی نمی‌کند. */
              // eslint-disable-next-line @next/next/no-img-element
              <img className="intro3d-live-poster" src={live.image} alt="" />
            )}

            {/* لودر تمام‌صفحه در حین بارگذاری iframe */}
            {liveState !== "ready" && (
              <div className="intro3d-live-loader" role="status" aria-live="polite">
                <div className="intro3d-live-loader-content">
                  <span className="intro3d-live-loader-spinner" aria-hidden="true" />
                  <span className="intro3d-live-loader-text">
                    {liveState === "loading" ? "در حال بارگذاری سایت…" : "سایت دیر بالا آمد"}
                  </span>
                  {liveState === "slow" && (
                    <a
                      className="intro3d-live-fallback-link"
                      href={live.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      باز کردن در تب جدید
                    </a>
                  )}
                </div>
              </div>
            )}

            <iframe
              src={live.url}
              title={`پیش‌نمایش زندهٔ سایت ${live.title}`}
              onLoad={() => setLiveState("ready")}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              referrerPolicy="no-referrer"
              fetchPriority="high"
            />
          </div>
        </div>
      )}

      {live && (
        <div className="intro3d-live-bar">
          <p className="intro3d-live-note">
            <span className="intro3d-live-dot" aria-hidden="true" />
            نمای زنده — اسکرول بیرون از لپ‌تاپ قفل است
          </p>
          <button
            type="button"
            className="intro3d-live-close"
            onClick={closeLive}
            aria-label="خروج از حالت لایو"
          >
            <Icon name="arrow-left" size={16} />
            <span>خروج از حالت لایو</span>
            <kbd className="intro3d-live-key">Esc</kbd>
          </button>
        </div>
      )}
    </section>
  );
}