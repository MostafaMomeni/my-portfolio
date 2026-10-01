"use client";

import { useEffect, useState } from "react";
import { navItems, profile, socials } from "../data/site";
import { Icon } from "./Icon";

export default function Navbar() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => {
      setStuck(window.scrollY > 20);

      // بخش فعال را بر اساس موقعیت اسکرول مشخص کن
      let current = "#home";
      for (const item of navItems) {
        const el = document.querySelector(item.href);
        if (el && el.getBoundingClientRect().top <= 140) current = item.href;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // قفل اسکرول وقتی منوی موبایل باز است
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className={`nav${stuck ? " is-stuck" : ""}`}>
      <div className="shell nav-inner">
        <a href="#home" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            {profile.initials}
          </span>
          <span className="brand-text">
            {profile.name}
            <small className="ltr">{profile.nameEn.toUpperCase()}</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="ناوبری اصلی">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`nav-link${active === item.href ? " is-active" : ""}`}
              aria-current={active === item.href ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="btn btn-primary btn-sm nav-cta">
          <Icon name="chat" size={16} />
          بیایید صحبت کنیم
        </a>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className="shell">
        <div id="mobile-menu" className={`mobile-menu${open ? " is-open" : ""}`}>
          <nav aria-label="ناوبری موبایل">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="mobile-link"
                onClick={() => setOpen(false)}
              >
                {item.label}
                <Icon name="arrow-left" size={16} />
              </a>
            ))}
          </nav>
          <a
            href={profile.email} target="_blank"
            className="btn btn-primary"
            onClick={() => setOpen(false)}
          >
            <Icon name="mail" size={17} />
            تماس با من
          </a>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {socials.slice(0, 3).map((s) => (
              <a
                key={s.key}
                href={s.url}
                className="chip"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
              >
                <Icon name={s.key} size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}