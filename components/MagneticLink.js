"use client";

import { useRef } from "react";

/**
 * دکمه مغناطیسی — جابه‌جایی ملایم دکمه به سمت نشانگر.
 * روی دستگاه‌های لمسی و کاربرانی که انیمیشن را کم می‌خواهند، غیرفعال است.
 */
export default function MagneticLink({
  as: Tag = "a",
  href,
  className,
  children,
  strength = 0.28,
  ...rest
}) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = "";
  };

  const extra = Tag === "a" ? { href } : { onClick: href };

  return (
    <Tag
      ref={ref}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}
      {...extra}
      {...rest}
    >
      {children}
    </Tag>
  );
}