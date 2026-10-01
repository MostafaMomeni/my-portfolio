"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "./Icon";

/**
 * پیش‌نمایش زنده پروژه.
 *
 * به‌جای بارگذاری هم‌زمان چند iframe سنگین (که کارایی صفحه را خراب می‌کند)،
 * ابتدا اسکرین‌شات واقعی نمایش داده می‌شود و کاربر خودش با یک کلیک، سایت زنده
 * را داخل همان کادر بارگذاری و با آن کار می‌کند.
 */
export default function LivePreview({ url, title, image, alt, className = "" }) {
  const [live, setLive] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const frameRef = useRef(null);
  const timerRef = useRef(null);
  const graceRef = useRef(null);

  // اگر بعد از ۱۲ ثانیه چیزی بارگذاری نشد، به تصویر برگرد
  useEffect(() => {
    if (!live) return;
    setLoaded(false);
    setFailed(false);

    timerRef.current = setTimeout(() => {
      if (!loaded) setFailed(true);
    }, 12000);

    // اگر رویداد onLoad از دست برود (مثلاً وقتی صفحه از قبل کش شده و
    // قبل از اتصال هندلر لود می‌شود)، بعد از ۳ ثانیه فرض می‌کنیم موفق بوده.
    graceRef.current = setTimeout(() => {
      setLoaded(true);
    }, 3000);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(graceRef.current);
    };
  }, [live]);

  const canEmbed = url && !url.startsWith("mailto:");

  return (
    <div className={`live-preview ${className}${live ? " is-live" : ""}`}>
      {/* --- تصویر پوستر (حالت پیش‌فرض) --- */}
      {!live && image && (
        <div className="live-poster">
          <Image
            src={image}
            alt={alt}
            fill
            sizes="(max-width: 900px) 100vw, (max-width: 1200px) 50vw, 600px"
            loading="lazy"
            quality={82}
          />
        </div>
      )}

      {/* --- سایت زنده --- */}
      {live && (
        <div className="live-frame-wrap">
          {!loaded && !failed && (
            <div className="live-loading" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <span>در حال بارگذاری سایت زنده…</span>
            </div>
          )}

          {failed && (
            <div className="live-fallback">
              {image && (
                <Image
                  src={image}
                  alt={alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 600px"
                  quality={82}
                />
              )}
              <div className="live-fallback-msg">
                <Icon name="external" size={20} />
                <span>نمایش زنده در این مرورگر محدود شده است.</span>
              </div>
            </div>
          )}

          <iframe
            ref={frameRef}
            className={`live-frame${loaded ? " is-loaded" : ""}${failed ? " is-hidden" : ""}`}
            src={url}
            title={`پیش‌نمایش زنده سایت ${title}`}
            onLoad={() => {
              setLoaded(true);
              clearTimeout(timerRef.current);
            }}
            onError={() => setFailed(true)}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )} 

      {/* --- دکمه شروع پیش‌نمایش --- */}
      {!live && canEmbed && (
        <button
          type="button"
          className="live-play"
          onClick={() => setLive(true)}
          aria-label={`بارگذاری پیش‌نمایش زنده سایت ${title}`}
        >
          <span className="live-play-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          <span className="live-play-text">
            <b>پیش‌نمایش زنده</b>
            <small>داخل همین کادر قابل استفاده است</small>
          </span>
        </button>
      )}

      {/* --- نوار ابزار --- */}
      {canEmbed && (
        <div className={`live-bar${live ? " is-live" : ""}`}>
          {live ? (
            <>
              <span className="live-bar-live">
                <span className="pulse-dot" aria-hidden="true" />
                نمایش زنده
              </span>
              <span className="live-bar-actions">
                <button
                  type="button"
                  className="live-bar-btn"
                  onClick={() => setLive(false)}
                >
                  <Icon name="layers" size={14} />
                  تصویر
                </button>
                <a
                  href={url}
                  className="live-bar-btn is-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="external" size={14} />
                  تب جدید
                </a>
              </span>
            </>
          ) : (
            <span className="live-bar-hint">
              <Icon name="sparkle" size={13} />
              سایت زنده را امتحان کنید
            </span>
          )}
        </div>
      )}
    </div>
  );
}