import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { profile } from "../data/site";

export const alt = `${profile.name} — ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * تصویر اشتراک‌گذاری (Open Graph / Twitter Card).
 * با فونت فارسی واقعی رندر می‌شود تا متن‌ها درست نمایش داده شوند.
 */
export default async function OpengraphImage() {
  const fontDir = path.join(process.cwd(), "public", "fonts");

  const [regular, bold] = await Promise.all([
    fs.readFile(path.join(fontDir, "Vazirmatn-Regular.ttf")),
    fs.readFile(path.join(fontDir, "Vazirmatn-Bold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #05060c 0%, #0d1024 48%, #14103a 100%)",
          position: "relative",
          fontFamily: "Vazirmatn",
          direction: "rtl",
        }}
      >
        {/* هاله‌های نوری پس‌زمینه */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(139,92,246,0.45) 0%, rgba(139,92,246,0) 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background: "radial-gradient(circle, rgba(77,124,255,0.42) 0%, rgba(77,124,255,0) 70%)",
            display: "flex",
          }}
        />

        {/* نشان برند */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 34 }}>
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: 20,
              background: "linear-gradient(135deg, #4d7cff, #8b5cf6 55%, #22d3ee)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 27,
              fontWeight: 700,
            }}
          >
            {profile.initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 27, fontWeight: 700, color: "#ffffff" }}>
              {profile.name}
            </div>
            <div
              style={{
                fontSize: 15,
                color: "#8b93ad",
                letterSpacing: 3,
                direction: "ltr",
                textAlign: "right",
              }}
            >
              {profile.nameEn.toUpperCase()}
            </div>
          </div>
        </div>

        {/* عنوان اصلی */}
        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.32,
            marginBottom: 20,
            display: "flex",
          }}
        >
          برنامه‌نویس Frontend و هوش مصنوعی
        </div>

        <div
          style={{
            fontSize: 30,
            color: "#a7aec7",
            lineHeight: 1.6,
            marginBottom: 40,
            display: "flex",
          }}
        >
          رابط‌های کاربری مدرن، React و Next.js — و پروژه‌های یادگیری ماشین
        </div>

        {/* نشان‌ها */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {["React", "Next.js", "JavaScript", "Python", "Machine Learning", "Computer Vision"].map(
            (t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 9999,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#dfe4f5",
                  fontSize: 21,
                  direction: "ltr",
                }}
              >
                {t}
              </div>
            )
          )}
        </div>

        {/* پابرگ */}
        <div
          style={{
            position: "absolute",
            bottom: 46,
            right: 80,
            display: "flex",
            fontSize: 20,
            color: "#7c83a0",
          }}
        >
          {profile.location} · {profile.tagline}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Vazirmatn", data: regular, weight: 400, style: "normal" },
        { name: "Vazirmatn", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
}