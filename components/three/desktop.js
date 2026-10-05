/**
 * محیط دسکتاپ ویندوز که روی صفحه‌ی لپ‌تاپ رندر می‌شود.
 *
 * این ماژول یک بوم ۱۶۰۰×۱۰۰۰ می‌سازد و بسته به پیشرفت اسکرول، دسکتاپ،
 * پنجره‌ی VS Code، منوی راست‌کلیک، پنجره‌ی «درباره من» و برنامه‌ی
 * پروژه‌ها با اسلایدر را می‌کشد.
 */

import { profile, skillGroups, projects } from "../../data/site";
import { totalChars } from "../../data/code";
import { createScreenRenderer, SCREEN_W, SCREEN_H } from "./vscodeScreen";
import { SW, SH, LAYOUT, TITLEBAR_H, CARD, projectsGeometry, clamp } from "./timeline";

// دانا اول از همه می‌آید تا همهٔ متن‌های فارسیِ داخل لپ‌تاپ با آن کشیده شوند.
// اگر فونت هنوز بارگذاری نشده باشد، بوم خودکار به Vazirmatn برمی‌گردد —
// برای همین صحنه صبر می‌کند تا همهٔ وزن‌ها آماده شوند.
const UI = '"DanaFaNum", "Vazirmatn", "Segoe UI", Tahoma, system-ui, sans-serif';
const MONO = '"Cascadia Code", Consolas, ui-monospace, monospace';

/** وزن‌هایی از دانا که رابط ویندوز استفاده می‌کند. */
export const DANA_WEIGHTS = [400, 500, 600, 700, 800];

/**
 * فونت دانا را پیش از نخستین رسم بوم بار می‌کند.
 *
 * بوم دوبعدی فقط فونتی را می‌کشد که در سند بارگذاری شده باشد؛ اگر زودتر
 * رسم شود، متن فارسی با فونت جایگزین کشیده می‌شود و دیگر عوض نمی‌شود.
 */
export async function loadDana() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    DANA_WEIGHTS.map((w) =>
      document.fonts.load(`${w} 32px "DanaFaNum"`).catch(() => null),
    ),
  );
  await document.fonts.ready;
}

/* ---------- رنگ‌های ویندوز ۱۱ ---------- */
const W = {
  wallTop: "#0a1024",
  wallMid: "#141033",
  wallBot: "#070a18",
  winBg: "#f3f3f3",
  winSurface: "#ffffff",
  winTitle: "#fafafa",
  winBorder: "rgba(0,0,0,0.10)",
  winShadow: "rgba(0,0,0,0.45)",
  accent: "#0067c0",
  accentSoft: "#e5f0fb",
  fg: "#1b1b1f",
  fg2: "#5a5a63",
  fg3: "#8a8a93",
  taskbar: "rgba(22,22,26,0.92)",
  taskFg: "#f2f2f5",
  sel: "rgba(0,103,192,0.16)",
  hover: "rgba(0,0,0,0.055)",
};

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ---------- ابزارهای ترسیم ---------- */

function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function shadowed(g, r, blur = 34, off = 12) {
  g.save();
  g.shadowColor = W.winShadow;
  g.shadowBlur = blur;
  g.shadowOffsetY = off;
  g.fillStyle = W.winBg;
  rr(g, r.x, r.y, r.w, r.h, 14);
  g.fill();
  g.restore();
}

/** متن چندخطی با شکستن روی کلمات. */
function wrap(g, text, maxW) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (g.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** نمایش مرحله‌ای بخش‌ها بر اساس پیشرفت. */
function stepReveal(r, i, n) {
  const span = 0.86;
  const each = span / n;
  return clamp01((r - i * each * 0.9) / each);
}

/* ---------- آیکون‌ها ---------- */

function iconMonitor(g, x, y, s) {
  g.strokeStyle = "#dfe6f2";
  g.fillStyle = "#dfe6f2";
  g.lineWidth = s * 0.055;
  g.lineJoin = "round";
  rr(g, x - s * 0.46, y - s * 0.42, s * 0.92, s * 0.62, s * 0.07);
  g.stroke();
  g.fillRect(x - s * 0.34, y + s * 0.22, s * 0.1, s * 0.2);
  g.fillRect(x - s * 0.3, y + s * 0.4, s * 0.6, s * 0.075);
  g.fillStyle = "rgba(120,180,255,0.55)";
  rr(g, x - s * 0.38, y - s * 0.34, s * 0.76, s * 0.46, s * 0.04);
  g.fill();
}

function iconTrash(g, x, y, s) {
  g.strokeStyle = "#cfd6e2";
  g.lineWidth = s * 0.06;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(x - s * 0.28, y - s * 0.22);
  g.lineTo(x - s * 0.21, y + s * 0.36);
  g.lineTo(x + s * 0.21, y + s * 0.36);
  g.lineTo(x + s * 0.28, y - s * 0.22);
  g.stroke();
  g.beginPath();
  g.moveTo(x - s * 0.36, y - s * 0.24);
  g.lineTo(x + s * 0.36, y - s * 0.24);
  g.moveTo(x - s * 0.14, y - s * 0.36);
  g.lineTo(x + s * 0.14, y - s * 0.36);
  g.stroke();
  g.lineWidth = s * 0.045;
  for (const o of [-0.09, 0.02, 0.13]) {
    g.beginPath();
    g.moveTo(x + s * o, y - s * 0.1);
    g.lineTo(x + s * (o * 1.3), y + s * 0.24);
    g.stroke();
  }
}

/** آیکون اختصاصی برنامه‌ی پروژه‌ها — موشک روی پس‌زمینه‌ی گرادیانی. */
function iconProjects(g, x, y, s) {
  const R = s * 0.52;
  g.save();
  const grad = g.createLinearGradient(x - R, y - R, x + R, y + R);
  grad.addColorStop(0, "#8b5cf6");
  grad.addColorStop(0.55, "#4d7cff");
  grad.addColorStop(1, "#22d3ee");
  g.shadowColor = "rgba(120,90,255,0.55)";
  g.shadowBlur = s * 0.3;
  g.fillStyle = grad;
  rr(g, x - R, y - R, R * 2, R * 2, R * 0.28);
  g.fill();
  g.restore();

  // موشک
  g.save();
  g.translate(x, y - s * 0.03);
  g.rotate(-0.5);
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.moveTo(0, -s * 0.34);
  g.quadraticCurveTo(s * 0.17, -s * 0.06, s * 0.15, s * 0.2);
  g.lineTo(-s * 0.15, s * 0.2);
  g.quadraticCurveTo(-s * 0.17, -s * 0.06, 0, -s * 0.34);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(-s * 0.15, s * 0.02);
  g.lineTo(-s * 0.3, s * 0.22);
  g.lineTo(-s * 0.13, s * 0.2);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(s * 0.15, s * 0.02);
  g.lineTo(s * 0.3, s * 0.22);
  g.lineTo(s * 0.13, s * 0.2);
  g.closePath();
  g.fill();
  g.fillStyle = "#4d7cff";
  g.beginPath();
  g.arc(0, -s * 0.11, s * 0.055, 0, Math.PI * 2);
  g.fill();
  // شعله
  g.fillStyle = "rgba(255,255,255,0.8)";
  g.beginPath();
  g.moveTo(-s * 0.08, s * 0.2);
  g.lineTo(0, s * 0.38);
  g.lineTo(s * 0.08, s * 0.2);
  g.closePath();
  g.fill();
  g.restore();
}

const ICONS = { computer: iconMonitor, recycle: iconTrash, projects: iconProjects };

/* ---------- اطلاعات واقعی سیستم کاربر ---------- */

/**
 * وضعیت زندهٔ سیستم، همان‌طور که مرورگر اجازه می‌دهد.
 *
 * باتری و شبکه API استاندارد دارند و واقعاً از سیستم خوانده می‌شوند. اما
 * *بلندی صدای سیستم* هیچ APIای در وب ندارد؛ تنها چیزی که می‌شود دید،
 * وجود خروجی صوتی است. پس صدا را از خودِ سیستم نمی‌خوانیم و ادعای
 * عدد ساختگی هم نمی‌کنیم.
 */
const system = {
  battery: null, // { level: ۰ تا ۱, charging: bool }
  batteryKnown: false,
  online: true,
  netType: "", // "wifi" | "cellular" | "ethernet" | "none"
  netLabel: "", // "4g" و مانند آن
  audioOut: false,
};

/** پایش سیستم؛ تابع پاک‌سازی برمی‌گرداند. */
export function watchSystem() {
  if (typeof navigator === "undefined") return () => {};
  const off = [];
  const add = (target, type, fn, opts) => {
    if (!target?.addEventListener) return;
    target.addEventListener(type, fn, opts);
    off.push(() => target.removeEventListener(type, fn, opts));
  };

  // --- باتری ---
  if (navigator.getBattery) {
    navigator
      .getBattery()
      .then((b) => {
        const read = () => {
          system.batteryKnown = true;
          system.battery = { level: b.level, charging: b.charging };
        };
        read();
        add(b, "levelchange", read);
        add(b, "chargingchange", read);
      })
      .catch(() => {});
  }

  // --- شبکه ---
  const readNet = () => {
    system.online = navigator.onLine !== false;
    const c = navigator.connection;
    system.netType = c?.type || (system.online ? "wifi" : "none");
    system.netLabel = c?.effectiveType || "";
  };
  readNet();
  add(window, "online", readNet);
  add(window, "offline", readNet);
  add(navigator.connection, "change", readNet);

  // --- خروجی صوتی ---
  if (navigator.mediaDevices?.enumerateDevices) {
    navigator.mediaDevices
      .enumerateDevices()
      .then((list) => {
        system.audioOut = list.some((d) => d.kind === "audiooutput");
      })
      .catch(() => {});
    add(navigator.mediaDevices, "devicechange", () => {
      navigator.mediaDevices
        .enumerateDevices()
        .then((list) => {
          system.audioOut = list.some((d) => d.kind === "audiooutput");
        })
        .catch(() => {});
    });
  }

  return () => off.forEach((f) => f());
}

/** رشتهٔ کلید رندر؛ هر تغییر سیستم باید بوم را دوباره بکشد. */
function systemKey() {
  const b = system.battery;
  return [
    b ? `${Math.round(b.level * 100)}${b.charging ? "c" : ""}` : "-",
    system.online ? "1" : "0",
    system.netType,
    system.netLabel,
    system.audioOut ? "a" : "-",
  ].join("|");
}

/**
 * ساعت و تاریخ همین لحظه، با تقویم و ارقام فارسی.
 *
 * شکل‌دهنده‌ها یک‌بار ساخته و نگه داشته می‌شوند؛ ساختن دوبارهٔ آن‌ها در هر
 * فریم گران است. اگر مرورگر دادهٔ محلی نداشته باشد، به متن خالی برمی‌گردیم.
 */
let clockFormats = null;

function readClock(now = new Date()) {
  if (clockFormats === null) {
    try {
      clockFormats = {
        time: new Intl.DateTimeFormat("fa-IR", {
          hour: "2-digit",
          minute: "2-digit",
          hourCycle: "h23",
        }),
        date: new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      };
    } catch {
      clockFormats = false;
    }
  }
  if (!clockFormats) return { time: "", date: "" };
  return {
    time: clockFormats.time.format(now),
    date: clockFormats.date.format(now),
  };
}

/* ---------- ساخت رندر ---------- */

export function createDesktopRenderer() {
  const canvas = document.createElement("canvas");
  canvas.width = SW;
  canvas.height = SH;
  const g = canvas.getContext("2d", { alpha: false });

  const editor = createScreenRenderer();

  // تصاویر واقعی پروژه‌ها برای پیش‌نمایش داخل برنامه
  const images = new Map();
  for (const p of projects) {
    if (!p.image) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = p.image;
    images.set(p.slug, img);
  }

  let lastKey = "";

  /* ---------- دسکتاپ ---------- */
  function drawWallpaper() {
    const grad = g.createLinearGradient(0, 0, SW * 0.4, SH);
    grad.addColorStop(0, W.wallTop);
    grad.addColorStop(0.5, W.wallMid);
    grad.addColorStop(1, W.wallBot);
    g.fillStyle = grad;
    g.fillRect(0, 0, SW, SH);

    // درخشش‌های نرم مثل والپیپر پیش‌فرض
    const blob = (x, y, r, color) => {
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, color);
      rg.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = rg;
      g.fillRect(0, 0, SW, SH);
    };
    blob(SW * 0.74, SH * 0.24, 620, "rgba(77,124,255,0.20)");
    blob(SW * 0.22, SH * 0.82, 560, "rgba(139,92,246,0.18)");
    blob(SW * 0.5, SH * 0.5, 420, "rgba(34,211,238,0.07)");
  }

  function drawIcon(key, icon, st) {
    const { x, y, label } = icon;
    const isComp = key === "computer";
    const isProj = key === "projects";

    // منوی راست‌کلیک روی My Computer
    const menuSel = isComp ? st.menu.open : 0;
    // نشانگر که روی آیکون قرار گرفته
    const near =
      st.cursor.appear *
      clamp01(1 - Math.hypot(st.cursor.x - x, st.cursor.y - y) / 46);
    // فشار لحظه‌ای هنگام کلیک
    const click = isProj
      ? st.cursor.clickProjects
      : isComp
        ? st.cursor.clickComputer
        : 0;

    const sel = Math.max(menuSel * 0.9, near * 0.6);

    if (sel > 0.02) {
      g.save();
      g.globalAlpha = sel;
      g.fillStyle = "rgba(130,175,255,0.22)";
      rr(g, x - 46, y - 48, 92, 104, 10);
      g.fill();
      g.strokeStyle = "rgba(150,190,255,0.35)";
      g.lineWidth = 1.5;
      g.stroke();
      g.restore();
    }

    // حلقهٔ کلیک روی آیکون
    if (click > 0.01 && click < 0.995) {
      g.save();
      g.globalAlpha = (1 - click) * 0.75;
      g.strokeStyle = "#8ab4ff";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(x, y + 8, 30 + click * 34, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }

    const draw = ICONS[key];
    // کمی فشردگی هنگام کلیک، مثل فشردن واقعی آیکون
    const squash = 1 - Math.sin(click * Math.PI) * 0.08;
    g.save();
    g.translate(x, y);
    g.scale(squash, squash);
    draw(g, 0, 0, 78);
    g.restore();

    g.direction = "ltr";
    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = `600 20px ${UI}`;
    g.shadowColor = "rgba(0,0,0,0.65)";
    g.shadowBlur = 5;
    g.fillStyle = sel > 0.3 ? "#ffffff" : "#f0f2f7";
    g.fillText(label, x, y + 74);
    g.shadowBlur = 0;
  }

  function drawDesktopIcons(st) {
    for (const [key, icon] of Object.entries(LAYOUT.icons)) {
      drawIcon(key, icon, st);
    }
  }

  /* ---------- نوار وظیفه ---------- */

  /** لوگوی ویندوز: چهار مربع. */
  function drawWindowsLogo(cx, cy, s, color) {
    const q = s * 0.42;
    const gap = s * 0.1;
    const total = q * 2 + gap;
    g.fillStyle = color;
    for (const [ox, oy] of [
      [0, 0],
      [q + gap, 0],
      [0, q + gap],
      [q + gap, q + gap],
    ]) {
      g.beginPath();
      g.roundRect(cx - total / 2 + ox, cy - total / 2 + oy, q, q, s * 0.06);
      g.fill();
    }
  }

  /**
   * آیکون‌های سیستمی سمت راست نوار وظیفه.
   *
   * هر کدام از وضعیت واقعی سیستم کاربر می‌خواند: باتری از Battery API،
   * شبکه از Network Information API و آنلاین‌بودن، و صدا فقط از
   * وجود خروجی صوتی — چون بلندی صدا در وب قابل خواندن نیست.
   */
  function drawTrayIcon(cx, cy, kind) {
    g.lineCap = "round";

    if (kind === "wifi") {
      if (!system.online) {
        // آنتن ندارد: فقط یک نقطه، مثل ویندوز وقتی آفلاین است
        g.fillStyle = "#7d7d85";
        g.beginPath();
        g.arc(cx, cy + 7, 3, 0, Math.PI * 2);
        g.fill();
        return;
      }
      g.strokeStyle = W.taskFg;
      g.lineWidth = 2.2;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(cx, cy + 9, 4 + i * 5, -Math.PI * 0.75, -Math.PI * 0.25);
        g.stroke();
      }
      g.fillStyle = W.taskFg;
      g.beginPath();
      g.arc(cx, cy + 10, 2, 0, Math.PI * 2);
      g.fill();
      return;
    }

    if (kind === "volume") {
      g.strokeStyle = system.audioOut ? W.taskFg : "#7d7d85";
      g.fillStyle = system.audioOut ? W.taskFg : "#7d7d85";
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx - 8, cy - 3);
      g.lineTo(cx - 4, cy - 3);
      g.lineTo(cx + 1, cy - 8);
      g.lineTo(cx + 1, cy + 8);
      g.lineTo(cx - 4, cy + 3);
      g.lineTo(cx - 8, cy + 3);
      g.closePath();
      g.fill();
      if (system.audioOut) {
        g.beginPath();
        g.arc(cx + 2, cy, 7, -Math.PI * 0.35, Math.PI * 0.35);
        g.stroke();
      } else {
        // خط مورب: خروجی صوتی در دسترس نیست
        g.strokeStyle = "#7d7d85";
        g.beginPath();
        g.moveTo(cx + 4, cy - 7);
        g.lineTo(cx + 12, cy + 7);
        g.stroke();
      }
      return;
    }

    // --- باتری ---
    const level = system.battery?.level ?? 1;
    const charging = system.battery?.charging ?? false;
    const known = system.batteryKnown;
    const dim = known && !charging && level <= 0.2 ? "#e6a23c" : W.taskFg;

    g.strokeStyle = dim;
    g.fillStyle = dim;
    g.lineWidth = 1.8;
    // بدنهٔ باتری + قطب
    g.beginPath();
    g.roundRect(cx - 11, cy - 6, 19, 12, 3);
    g.stroke();
    g.beginPath();
    g.roundRect(cx + 9, cy - 2.5, 2.5, 5, 1.5);
    g.fill();

    if (known) {
      // پرشدگی واقعی
      const inner = Math.max(0, Math.min(1, level)) * 15;
      g.fillStyle = dim;
      g.beginPath();
      g.roundRect(cx - 9.5, cy - 4.5, inner, 9, 1.6);
      g.fill();

      if (charging) {
        // صاعقهٔ شارژ، مثل ویندوز
        g.fillStyle = "#18181a";
        g.beginPath();
        g.moveTo(cx + 1, cy - 8);
        g.lineTo(cx - 4, cy + 1);
        g.lineTo(cx - 0.5, cy + 1);
        g.lineTo(cx - 2.5, cy + 8);
        g.lineTo(cx + 4, cy - 1);
        g.lineTo(cx + 0.5, cy - 1);
        g.closePath();
        g.fill();
      }
    }
  }

  function drawTaskbar(st) {
    const H = LAYOUT.taskbar.h;
    const y = SH - H;

    g.fillStyle = "rgba(20, 20, 25, 0.86)";
    g.fillRect(0, y, SW, H);
    g.fillStyle = "rgba(255,255,255,0.07)";
    g.fillRect(0, y, SW, 1);

    const slot = 48;
    const startX = Math.round(SW / 2 - 34);

    // دکمهٔ Start
    drawWindowsLogo(startX, y + H / 2 - 1, 22, "#f4f4f6");

    // قرص شیشه‌ای وسط نوار
    const apps = [
      { key: "computer", open: st.about.open > 0.05 || st.menu.open > 0.05 },
      { key: "projects", open: st.projects.open > 0.05 },
    ];
    const pillX = startX + 30;
    const pillW = apps.length * slot + 12;
    g.fillStyle = "rgba(255,255,255,0.08)";
    g.beginPath();
    g.roundRect(pillX, y + 7, pillW, H - 14, 10);
    g.fill();

    apps.forEach((app, i) => {
      const cx = pillX + 6 + slot * i + slot / 2;
      const cy = y + H / 2 - 1;
      if (app.open) {
        g.fillStyle = "rgba(255,255,255,0.12)";
        g.beginPath();
        g.roundRect(cx - 19, y + 11, 38, H - 22, 8);
        g.fill();
      }
      const s = 34;
      if (app.key === "projects") {
        iconProjects(g, cx, cy, s);
      } else {
        iconMonitor(g, cx, cy, s);
      }
      if (app.open) {
        g.fillStyle = "#7fb4ff";
        g.beginPath();
        g.roundRect(cx - 7, y + H - 9, 14, 3.5, 2);
        g.fill();
      }
    });

    // کادر «همه‌برنامه‌ها» کنار قرص
    const ox = pillX + pillW + 22;
    g.strokeStyle = "rgba(255,255,255,0.4)";
    g.lineWidth = 1.6;
    g.beginPath();
    g.roundRect(ox - 7, y + H / 2 - 7, 14, 14, 2);
    g.stroke();

    // سیستم تری + ساعت لحظه‌ای
    let tx = SW - 26;
    g.direction = "ltr";
    g.textAlign = "right";
    g.textBaseline = "alphabetic";
    const ck = readClock();
    g.fillStyle = W.taskFg;
    g.font = `600 17px ${UI}`;
    g.fillText(ck.time, tx, y + 24);
    g.font = `400 15px ${UI}`;
    g.fillStyle = "rgba(242,242,245,0.7)";
    g.fillText(ck.date, tx, y + 43);

    tx -= 92;
    drawTrayIcon(tx, y + H / 2, "wifi");
    tx -= 34;
    drawTrayIcon(tx, y + H / 2, "volume");
    tx -= 34;
    drawTrayIcon(tx, y + H / 2, "battery");

    g.strokeStyle = "rgba(255,255,255,0.14)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(tx - 20.5, y + 14);
    g.lineTo(tx - 20.5, y + H - 14);
    g.stroke();
  }

  /* ---------- منوی راست‌کلیک ---------- */
  function drawContextMenu(st) {
    if (st.menu.open <= 0.01) return;
    const m = LAYOUT.menu;
    const items = m.items;
    let h = m.padTop;
    for (const it of items) h += it.sep ? 12 : m.itemH;
    h += 8;

    g.save();
    g.globalAlpha = st.menu.open;
    g.translate(0, 0);
    g.shadowColor = "rgba(0,0,0,0.5)";
    g.shadowBlur = 26;
    g.shadowOffsetY = 8;
    g.fillStyle = "rgba(252,252,253,0.98)";
    rr(g, m.x, m.y, m.w, h, 10);
    g.fill();
    g.shadowBlur = 0;
    g.shadowOffsetY = 0;
    g.strokeStyle = "rgba(0,0,0,0.12)";
    g.lineWidth = 1;
    g.stroke();

    let y = m.y + m.padTop;
    g.direction = "ltr";
    g.textAlign = "left";
    g.textBaseline = "middle";
    for (const it of items) {
      if (it.sep) {
        g.fillStyle = "rgba(0,0,0,0.09)";
        g.fillRect(m.x + 10, y + 5, m.w - 20, 1);
        y += 12;
        continue;
      }
      const isManage = it.label === "Manage";
      if (isManage && st.menu.hover > 0.02) {
        g.save();
        g.globalAlpha = st.menu.open * st.menu.hover;
        g.fillStyle = W.sel;
        rr(g, m.x + 6, y, m.w - 12, m.itemH, 6);
        g.fill();
        g.restore();
      }
      g.fillStyle = "#3a3a42";
      g.font = `400 21px ${UI}`;
      g.fillText(it.label, m.x + 18, y + m.itemH / 2);

      // آیکون کوچک سمت چپ
      g.save();
      g.globalAlpha = 0.55;
      g.fillStyle = W.accent;
      g.beginPath();
      g.arc(m.x + m.w - 30, y + m.itemH / 2, 4, 0, Math.PI * 2);
      g.fill();
      g.restore();

      y += m.itemH;
    }
    g.restore();
  }

  /* ---------- قاب پنجره ---------- */
  function winFrame(r, title, { accent = W.accent, dark = false } = {}) {
    shadowed(g, r, 40, 14);

    const tb = TITLEBAR_H;
    g.save();
    g.fillStyle = dark ? "#202024" : W.winTitle;
    rr(g, r.x, r.y, r.w, tb + 14, 14);
    g.fill();
    g.fillRect(r.x, r.y + tb - 6, r.w, 20);
    g.restore();

    g.fillStyle = accent;
    g.fillRect(r.x, r.y, r.w, 3);

    g.direction = "ltr";
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.font = `600 22px ${UI}`;
    g.fillStyle = dark ? "#e9e9ee" : "#2b2b32";
    g.fillText(title, r.x + 70, r.y + tb / 2 + 4);

    g.fillStyle = accent;
    rr(g, r.x + 20, r.y + tb / 2 - 11, 22, 22, 5);
    g.fill();

    // دکمه‌های پنجره
    const bw = 46;
    let bx = r.x + r.w - 18;
    const cy = r.y + tb / 2 + 4;
    const buttons = [
      { c: "transparent", s: "rgba(0,0,0,0.45)", kind: "min" },
      { c: "transparent", s: "rgba(0,0,0,0.45)", kind: "max" },
      { c: "#c42b1c", s: "#ffffff", kind: "close" },
    ];
    for (const b of buttons) {
      g.fillStyle = b.c;
      if (b.kind === "close") {
        g.beginPath();
        g.moveTo(bx - bw, r.y + 3);
        g.lineTo(bx, r.y + 3 + bw);
        g.lineTo(bx, r.y + 3 + bw - 1);
        g.lineTo(bx - bw, r.y + 3);
        g.closePath();
        g.fill();
      }
      g.strokeStyle = b.s;
      g.lineWidth = 1.6;
      const cx = bx - bw / 2;
      if (b.kind === "min") {
        g.beginPath();
        g.moveTo(cx - 6, cy + 4);
        g.lineTo(cx + 6, cy + 4);
        g.stroke();
      } else if (b.kind === "max") {
        g.strokeRect(cx - 6, cy - 5, 12, 11);
      } else {
        g.beginPath();
        g.moveTo(cx - 6, cy - 6);
        g.lineTo(cx + 6, cy + 6);
        g.moveTo(cx + 6, cy - 6);
        g.lineTo(cx - 6, cy + 6);
        g.stroke();
      }
      bx -= bw;
    }

    g.strokeStyle = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(r.x, r.y + tb);
    g.lineTo(r.x + r.w, r.y + tb);
    g.stroke();

    return r.y + tb;
  }

  /* ---------- پنجره‌ی VS Code ---------- */
  function drawVsCode(st) {
    const r = LAYOUT.windows.vscode;
    if (st.vscode.open <= 0.01) return;
    g.save();
    g.globalAlpha = clamp01(st.vscode.open);

    // VS Code نوار عنوان و دکمه‌های پنجرهٔ خودش را دارد، پس اینجا فقط سایه و
    // گردی گوشه‌ها کشیده می‌شود تا با بقیهٔ پنجره‌های ویندوز هم‌خوان بماند.
    g.save();
    g.shadowColor = W.winShadow;
    g.shadowBlur = 40;
    g.shadowOffsetY = 14;
    g.fillStyle = "#181818";
    rr(g, r.x, r.y, r.w, r.h, 10);
    g.fill();
    g.restore();

    const body = {
      x: r.x + 2,
      y: r.y + 2,
      w: r.w - 4,
      h: r.h - 4,
    };

    g.save();
    rr(g, body.x, body.y, body.w, body.h, 8);
    g.clip();
    g.fillStyle = "#181818";
    g.fillRect(body.x, body.y, body.w, body.h);

    g.save();
    g.translate(body.x, body.y);
    g.scale(body.w / SCREEN_W, body.h / SCREEN_H);

    // صفحه‌ی راه‌اندازی هنگام باز شدن برنامه
    if (st.vscode.boot > 0.01) {
      g.save();
      g.globalAlpha = clamp01(st.vscode.open * st.vscode.boot);
      editor.drawSplash(st.vscode.boot);
      g.restore();
    }

    // خودِ ویرایشگر، هم‌پوشان با صفحه‌ی راه‌اندازی.
    // editor.draw بومِ جداگانه‌ی خودش را می‌کشد؛ باید آن را روی بوم
    // دسکتاپ کپی کنیم وگرنه بدنه‌ی پنجره خالی می‌ماند.
    const ready = clamp01((1 - st.vscode.boot) * 1.5);
    if (ready > 0.01) {
      editor.draw({
        typed: Math.round(st.vscode.typed * totalChars),
        caret: true,
      });
      g.save();
      g.globalAlpha = clamp01(st.vscode.open * ready);
      g.drawImage(editor.canvas, 0, 0, SCREEN_W, SCREEN_H);
      g.restore();
    }
    g.restore();

    g.restore();
    g.restore();
  }

  /* ---------- پنجرهٔ «دربارهٔ من» — چیدمان مینیمال ---------- */

  /** جداکنندهٔ افقی نازک. */
  function hairline(x1, x2, y) {
    g.strokeStyle = "rgba(20,20,26,0.08)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x1, y + 0.5);
    g.lineTo(x2, y + 0.5);
    g.stroke();
  }

  const ABOUT_STATS = [
    { v: "۶", l: "پروژهٔ وب" },
    { v: "۱", l: "پروژهٔ هوش مصنوعی" },
    { v: "۱۲", l: "مخزن عمومی" },
  ];

  /**
   * یک ستون باریک و وسط‌چین با فاصله‌های سخاوتمندانه.
   * سابقهٔ شغلی و تحصیلی عمداً اینجا نیست؛ همین صفحه در صحنهٔ کوتاهی باز
   * می‌شود و هرچه خلوت‌تر باشد، خواناتر.
   */
  function drawAbout(st) {
    if (st.about.open <= 0.01) return;
    const r = LAYOUT.windows.about;
    g.save();
    g.globalAlpha = clamp01(st.about.open);
    const top = winFrame(r, "System — About", { accent: W.accent });

    g.save();
    g.beginPath();
    g.rect(r.x + 2, top, r.w - 4, r.y + r.h - top);
    g.clip();

    g.fillStyle = "#ffffff";
    g.fillRect(r.x + 2, top, r.w - 4, r.y + r.h - top);

    const cx = r.x + r.w / 2;
    const w = 760;
    const x = cx - w / 2;
    let y = top + 46;

    const N = 4;
    const rev = (i) => {
      const v = stepReveal(st.about.reveal, i, N);
      return { a: v, dy: (1 - v) * 26 };
    };

    /** جداکننده با فاصلهٔ یکسان بالا و پایین. */
    const rule = (gap) => {
      hairline(x, x + w, y + gap);
      y += gap * 2;
    };

    /* ۱) هویت — آواتار، نام، نقش، مکان */
    {
      const s = rev(0);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      g.textAlign = "center";
      g.textBaseline = "middle";

      const av = 66;
      const ax = cx - av / 2;
      const ag = g.createLinearGradient(ax, y, ax + av, y + av);
      ag.addColorStop(0, "#4d7cff");
      ag.addColorStop(1, "#8b5cf6");
      g.fillStyle = ag;
      g.beginPath();
      g.arc(cx, y + av / 2, av / 2, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = "#ffffff";
      g.font = `800 25px ${UI}`;
      g.direction = "ltr";
      g.fillText(profile.initials, cx, y + av / 2 + 1);

      g.direction = "rtl";
      g.textBaseline = "alphabetic";
      y += av + 24;

      g.fillStyle = "#14141a";
      g.font = `800 38px ${UI}`;
      g.fillText(profile.name, cx, y);

      y += 32;
      g.fillStyle = "#5f5f6a";
      g.font = `500 21px ${UI}`;
      g.fillText(profile.role, cx, y);

      y += 27;
      g.fillStyle = "#a0a0a9";
      g.font = `400 18px ${UI}`;
      g.fillText(`${profile.location} · ${profile.locationEn}`, cx, y);

      g.restore();
    }

    /* ۲) معرفی کوتاه */
    {
      const s = rev(1);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      rule(38);
      g.direction = "rtl";
      g.textAlign = "right";
      g.fillStyle = "#3d3d45";
      g.font = `400 21px ${UI}`;
      for (const l of wrap(g, profile.summary, w).slice(0, 3)) {
        g.fillText(l, x + w, y);
        y += 32;
      }
      g.restore();
    }

    /* ۳) آمار — یک ردیف ساده، بدون کارت */
    {
      const s = rev(2);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      rule(40);
      const gap = 32;
      const cw = (w - gap * (ABOUT_STATS.length - 1)) / ABOUT_STATS.length;
      ABOUT_STATS.forEach((it, i) => {
        const bx = x + w - cw - i * (cw + gap); // چیدمان راست‌به‌چپ
        g.direction = "rtl";
        g.textAlign = "center";
        g.fillStyle = "#14141a";
        g.font = `700 32px ${UI}`;
        g.fillText(it.v, bx + cw / 2, y + 24);
        g.fillStyle = "#8a8a93";
        g.font = `400 18px ${UI}`;
        g.fillText(it.l, bx + cw / 2, y + 50);
      });
      y += 62;
      g.restore();
    }

    /* ۴) مهارت‌ها — عنوان راست، توضیح چپ، فهرست زیر آن */
    {
      const s = rev(3);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      rule(40);

      for (const group of skillGroups) {
        g.textBaseline = "alphabetic";
        g.direction = "rtl";
        g.textAlign = "right";
        g.fillStyle = "#14141a";
        g.font = `700 20px ${UI}`;
        g.fillText(group.title, x + w, y);

        g.direction = "ltr";
        g.textAlign = "left";
        g.fillStyle = "#b0b0b8";
        g.font = `400 17px ${UI}`;
        g.fillText(group.caption, x, y);

        // نام مهارت‌ها به‌صورت یک ردیف متنی ساده — بدون چیپ و بدون شلوغی
        y += 30;
        g.direction = "rtl";
        g.textAlign = "right";
        g.fillStyle = "#55555e";
        g.font = `400 18px ${UI}`;
        const list = group.skills
          .slice(0, 6)
          .map((sk) => sk.name)
          .join("  ·  ");
        for (const l of wrap(g, list, w)) {
          g.fillText(l, x + w, y);
          y += 27;
        }
        y += 22;
      }
      g.restore();
    }

    g.restore();
    g.restore();
  }


  /* ---------- برنامه‌ی پروژه‌ها ---------- */
  function drawProjects(st) {
    if (st.projects.open <= 0.01) return;
    const geo = projectsGeometry();
    const r = geo.r;
    g.save();
    g.globalAlpha = clamp01(st.projects.open);
    const top = winFrame(r, "Projects — Portfolio", { accent: "#8b5cf6" });

    const { cx, cy, cw, ch, prevW, gap, pagerH, stageX, stageY, stageH } = geo;

    g.fillStyle = "#eceef2";
    rr(g, cx, cy, cw, ch, 10);
    g.fill();

    g.save();
    rr(g, stageX, stageY, prevW, stageH, 8);
    g.clip();

    const n = projects.length;
    const pos = st.projects.pos;
    const step = prevW + gap;
    for (let i = Math.floor(pos) - 1; i <= Math.floor(pos) + 1; i++) {
      if (i < 0 || i >= n) continue;
      drawProjectCard(i, stageX + (i - pos) * step, prevW, stageH);
    }
    g.restore();

    g.strokeStyle = "rgba(0,0,0,0.10)";
    g.lineWidth = 1;
    rr(g, stageX, stageY, prevW, stageH, 8);
    g.stroke();

    // اطلاعات سمت راست
    const idx = clamp(Math.round(pos), 0, n - 1);
    drawProjectInfo(projects[idx], geo, idx, n);

    // صفحه‌بندی
    const pagerY = r.y + r.h - 22 - pagerH / 2;
    g.direction = "ltr";
    g.textBaseline = "middle";
    const dotGap = 22;
    const startX = cx + cw / 2 - ((n - 1) * dotGap) / 2;
    for (let i = 0; i < n; i++) {
      const on = i === idx;
      g.fillStyle = on ? W.accent : "rgba(0,0,0,0.18)";
      g.beginPath();
      g.arc(startX + i * dotGap, pagerY, on ? 6 : 4, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = W.fg3;
    g.font = `600 19px ${UI}`;
    g.textAlign = "right";
    g.fillText(`${idx + 1} / ${n}`, cx + cw - 6, pagerY);

    g.restore();
  }

  function drawProjectCard(i, bx, w, h) {
    const p = projects[i];
    const { stageY } = projectsGeometry();
    const { pad, urlPad, tabH, urlBarH: urlH, headH } = CARD;
    // ‌bx و ‌stageY هر دو مطلق‌اند؛ کارت باید داخل پنجرهٔ پروژه بنشیند،
    // نه اینکه از بالای نوار عنوان بیرون بزند.
    const x = bx + pad;
    const y = stageY + pad;
    const cw = w - pad * 2;
    const ch = h - pad * 2;

    // قاب مرورگر
    g.save();
    g.shadowColor = "rgba(0,0,0,0.22)";
    g.shadowBlur = 22;
    g.shadowOffsetY = 6;
    g.fillStyle = "#ffffff";
    rr(g, x, y, cw, ch, 10);
    g.fill();
    g.restore();

    g.fillStyle = "#eef0f4";
    rr(g, x, y, cw, headH, 10);
    g.fill();
    g.fillRect(x, y + headH - 12, cw, 12);

    // تب مرورگر
    g.fillStyle = "#ffffff";
    rr(g, x + 12, y + 8, cw * 0.42, 30, 6);
    g.fill();
    g.fillStyle = "#8a5cf6";
    g.beginPath();
    g.arc(x + 30, y + 23, 7, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#55555f";
    g.font = `500 16px ${UI}`;
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.direction = "ltr";
    g.fillText(p.slug, x + 44, y + 23);

    // نوار آدرس
    const ux = x + urlPad;
    const uy = y + tabH + 5;
    const uw = cw - urlPad * 2;
    g.fillStyle = "#ffffff";
    g.strokeStyle = "rgba(0,0,0,0.10)";
    g.lineWidth = 1;
    rr(g, ux, uy, uw, urlH - 12, 16);
    g.fill();
    g.stroke();
    g.strokeStyle = "#34a853";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(ux + 24, uy + (urlH - 12) / 2, 7, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(ux + 24, uy + (urlH - 12) / 2);
    g.lineTo(ux + 24, uy + (urlH - 12) / 2 - 15);
    g.stroke();
    g.fillStyle = "#7a7a85";
    g.font = `400 16px ${UI}`;
    g.direction = "ltr";
    g.textAlign = "left";
    g.fillText(p.url || "confidential", ux + 42, uy + (urlH - 12) / 2 + 1);

    // محتوای صفحه
    const vx = ux;
    const vy = y + headH;
    const vw = uw;
    const vh = ch - headH;

    g.save();
    rr(g, vx, vy, vw, vh, 0);
    g.clip();
    g.fillStyle = "#05060c";
    g.fillRect(vx, vy, vw, vh);

    const img = p.image ? images.get(p.slug) : null;
    if (img && img.complete && img.naturalWidth) {
      const scale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      g.drawImage(img, vx + (vw - dw) / 2, vy + (vh - dh) / 2, dw, dh);
    } else {
      // جایگزین برای پروژه‌های بدون تصویر یا تصویر بارگذاری‌نشده
      g.fillStyle = "rgba(139,92,246,0.14)";
      g.fillRect(vx, vy, vw, vh);
      g.textAlign = "center";
      g.fillStyle = "#c9cbe0";
      g.font = `700 30px ${UI}`;
      g.fillText(p.confidential ? "پروژهٔ محرمانه" : p.title, vx + vw / 2, vy + vh / 2 + 8);
      g.fillStyle = "#7d86a6";
      g.font = `400 22px ${UI}`;
      g.fillText(p.confidential ? "بدون تصویر عمومی" : "در حال بارگذاری…", vx + vw / 2, vy + vh / 2 + 48);
    }
    g.restore();
  }

  function drawProjectInfo(p, geo, idx, n) {
    const x = geo.infoX;
    const y = geo.infoY;
    const w = geo.infoW;
    const h = geo.infoH;
    const btn = geo.viewBtn;

    g.direction = "rtl";
    g.textAlign = "right";
    g.textBaseline = "alphabetic";

    let cy = y + 26;
    g.fillStyle = W.fg3;
    g.font = `700 16px ${UI}`;
    g.fillText(
      p.category === "ai" ? "هوش مصنوعی" : p.category === "os" ? "متن‌باز" : "توسعهٔ وب",
      x + w,
      cy,
    );

    cy += 42;
    g.fillStyle = W.fg;
    g.font = `800 34px ${UI}`;
    g.fillText(p.title, x + w, cy);

    cy += 32;
    g.fillStyle = W.fg2;
    g.font = `600 20px ${UI}`;
    g.fillText(p.subtitle, x + w, cy);

    cy += 28;
    g.fillStyle = W.fg3;
    g.font = `400 18px ${UI}`;
    g.direction = "ltr";
    g.textAlign = "right";
    g.fillText([p.employer, p.date].filter(Boolean).join("  ·  "), x + w, cy);
    g.direction = "rtl";

    cy += 26;
    g.strokeStyle = "rgba(0,0,0,0.09)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, cy);
    g.lineTo(x + w, cy);
    g.stroke();

    cy += 30;
    g.fillStyle = W.fg2;
    g.font = `400 19px ${UI}`;
    for (const l of wrap(g, p.summary, w)) {
      g.fillText(l, x + w, cy);
      cy += 30;
    }

    cy += 16;
    g.direction = "ltr";
    g.textAlign = "right";
    g.font = `600 17px ${UI}`;
    let chipX = x + w;
    for (const t of p.tech) {
      const tw = g.measureText(t).width + 24;
      g.fillStyle = "rgba(0,103,192,0.10)";
      rr(g, chipX - tw, cy, tw, 30, 15);
      g.fill();
      g.fillStyle = W.accent;
      g.textAlign = "center";
      g.fillText(t, chipX - tw / 2, cy + 21);
      chipX -= tw + 8;
    }

    // دکمهٔ «مشاهدهٔ سایت» — مختصاتش از projectsGeometry می‌آید تا
    // تست کلیک دقیقاً روی همین کادر بیفتد.
    g.direction = "ltr";
    const grad = g.createLinearGradient(btn.x, btn.y, btn.x + btn.w, btn.y + btn.h);
    grad.addColorStop(0, "#7c3aed");
    grad.addColorStop(1, "#2563eb");
    g.fillStyle = grad;
    rr(g, btn.x, btn.y, btn.w, btn.h, 10);
    g.fill();

    // متن دکمه فارسی است، پس راست‌به‌چپ
    g.direction = "rtl";
    g.fillStyle = "#ffffff";
    g.font = `700 21px ${UI}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(
      p.url ? "مشاهدهٔ سایت" : "پروژهٔ محرمانه",
      btn.x + btn.w / 2,
      btn.y + btn.h / 2 + 1,
    );
  }

  /* ---------- لایه‌های صفحه ---------- */
  function drawScreenFx() {
    g.save();
    g.globalAlpha = 0.045;
    g.fillStyle = "#000";
    for (let y = 0; y < SH; y += 4) g.fillRect(0, y, SW, 1);
    g.restore();

    const grad = g.createRadialGradient(SW / 2, SH / 2, SH * 0.45, SW / 2, SH / 2, SW * 0.78);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.34)");
    g.fillStyle = grad;
    g.fillRect(0, 0, SW, SH);
  }

  /* ---------- باز-رسم ---------- */

  function draw(state) {
    const st = state;
    const typed = Math.round(st.vscode.typed * totalChars);
    // ساعت نوار وظیفه هر دقیقه و وضعیت سیستم هر وقت عوض می‌شود؛ پس باید بخشی از
    // کلید باشند وگرنه بوم تا تغییر چیز دیگری دوباره کشیده نمی‌شود.
    const clock = st.desktop > 0.01 ? readClock() : null;
    const sys = st.desktop > 0.01 ? systemKey() : "";
    const key =
      `${typed}|${st.power.toFixed(3)}|${st.desktop.toFixed(3)}` +
      `|${st.vscode.open.toFixed(3)}|${st.vscode.boot.toFixed(3)}|${st.vscode.shut.toFixed(3)}` +
      `|${st.menu.open.toFixed(3)}|${st.menu.hover.toFixed(3)}` +
      `|${st.about.open.toFixed(3)}|${st.about.reveal.toFixed(3)}|${st.about.shut.toFixed(3)}` +
      `|${st.projects.open.toFixed(3)}|${st.projects.pos.toFixed(3)}|${st.fade.toFixed(3)}` +
      `|${clock ? `${clock.time} ${clock.date}` : ""}|${sys}`;
    if (key === lastKey) return false;
    lastKey = key;

    // صفحه خاموش
    g.fillStyle = "#000000";
    g.fillRect(0, 0, SW, SH);
    if (st.power <= 0.002) return true;

    g.save();
    g.globalAlpha = st.power;

    drawWallpaper();
    if (st.desktop > 0.01) {
      g.save();
      g.globalAlpha = st.power * st.desktop;
      drawDesktopIcons(st);
      g.restore();
    }
    drawVsCode(st);
    drawAbout(st);
    drawProjects(st);
    drawTaskbar(st);
    drawContextMenu(st);
    drawScreenFx();

    g.restore();
    return true;
  }

  return { canvas, draw, editor };
}