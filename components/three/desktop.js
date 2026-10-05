/**
 * محیط دسکتاپ ویندوز که روی صفحه‌ی لپ‌تاپ رندر می‌شود.
 *
 * این ماژول یک بوم ۱۶۰۰×۱۰۰۰ می‌سازد و بسته به پیشرفت اسکرول، دسکتاپ،
 * پنجره‌ی VS Code، منوی راست‌کلیک، پنجره‌ی «درباره من» و برنامه‌ی
 * پروژه‌ها با اسلایدر را می‌کشد.
 */

import { profile, skillGroups, education, experience, projects } from "../../data/site";
import { totalChars } from "../../data/code";
import { createScreenRenderer, SCREEN_W, SCREEN_H } from "./vscodeScreen";
import { SW, SH, LAYOUT, TITLEBAR_H, projectsGeometry, clamp } from "./timeline";

const UI = '"Segoe UI Variable Display", "Segoe UI", Tahoma, system-ui, sans-serif';
const MONO = '"Cascadia Code", Consolas, ui-monospace, monospace';

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

  /** آیکون‌های سیستمی سمت راست نوار وظیفه. */
  function drawTrayIcon(cx, cy, kind) {
    g.strokeStyle = W.taskFg;
    g.fillStyle = W.taskFg;
    g.lineWidth = 2;
    g.lineCap = "round";
    if (kind === "wifi") {
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(cx, cy + 9, 4 + i * 5, -Math.PI * 0.75, -Math.PI * 0.25);
        g.stroke();
      }
      g.beginPath();
      g.arc(cx, cy + 10, 1.8, 0, Math.PI * 2);
      g.fill();
    } else if (kind === "volume") {
      g.beginPath();
      g.moveTo(cx - 8, cy - 3);
      g.lineTo(cx - 4, cy - 3);
      g.lineTo(cx + 1, cy - 8);
      g.lineTo(cx + 1, cy + 8);
      g.lineTo(cx - 4, cy + 3);
      g.lineTo(cx - 8, cy + 3);
      g.closePath();
      g.fill();
      g.beginPath();
      g.arc(cx + 2, cy, 7, -Math.PI * 0.35, Math.PI * 0.35);
      g.stroke();
    } else {
      g.lineWidth = 1.8;
      g.beginPath();
      g.roundRect(cx - 9, cy - 5, 17, 10, 2.5);
      g.stroke();
      g.fillRect(cx - 7, cy - 3, 9, 6);
      g.fillRect(cx + 9, cy - 2, 2, 4);
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
        g.save();
        g.translate(cx - s / 2, cy - s / 2);
        g.translate(s / 2, s / 2);
        g.scale(0.44, 0.44);
        g.translate(-s / 2, -s / 2);
        iconProjects(g, 0, 0, s);
        g.restore();
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

    // سیستم تری + ساعت
    let tx = SW - 26;
    g.direction = "ltr";
    g.textAlign = "right";
    g.textBaseline = "alphabetic";
    g.fillStyle = W.taskFg;
    g.font = `600 17px ${UI}`;
    g.fillText("10:24", tx, y + 24);
    g.font = `400 15px ${UI}`;
    g.fillStyle = "rgba(242,242,245,0.7)";
    g.fillText("1404/10/05", tx, y + 43);

    tx -= 78;
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

    const contentTop = winFrame(r, "developer.py — mostafa-portfolio", {
      accent: "#0078d4",
    });

    // بدنه‌ی پنجره در فضای ۱۶۰۰×۱۰۰۰ کشیده می‌شود
    const body = {
      x: r.x + 2,
      y: contentTop,
      w: r.w - 4,
      h: r.y + r.h - contentTop - 2,
    };

    g.save();
    rr(g, body.x, body.y, body.w, body.h, 0);
    g.clip();
    g.fillStyle = "#1f1f1f";
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

  /* ---------- پنجره‌ی «دربارهٔ من» — چیدمان مینیمال ---------- */

  /** یک جداکنندهٔ افقی نازک. */
  function hairline(x1, x2, y) {
    g.strokeStyle = "rgba(0,0,0,0.08)";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x1, y + 0.5);
    g.lineTo(x2, y + 0.5);
    g.stroke();
  }

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

    // محتوا روی پس‌زمینهٔ سفید تمیز، بدون کارت و بدون نوار رنگی
    g.fillStyle = "#ffffff";
    g.fillRect(r.x + 2, top, r.w - 4, r.y + r.h - top);

    // فضای محتوا وسط‌چین و باریک — مینیمال
    const cx = r.x + r.w / 2;
    const w = 880;
    const x = cx - w / 2;
    let y = top + 44;

    const N = 5;
    const rev = (i) => {
      const v = stepReveal(st.about.reveal, i, N);
      return { a: v, dy: (1 - v) * 22 };
    };

    /* ۱) هویت — آواتار، نام، نقش، مکان */
    {
      const s = rev(0);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      g.direction = "rtl";
      g.textAlign = "right";

      const av = 72;
      const ax = cx - av / 2;
      const ag = g.createLinearGradient(ax, y, ax + av, y + av);
      ag.addColorStop(0, "#4d7cff");
      ag.addColorStop(1, "#8b5cf6");
      g.fillStyle = ag;
      g.beginPath();
      g.arc(ax + av / 2, y + av / 2, av / 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.font = `800 27px ${UI}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.direction = "ltr";
      g.fillText(profile.initials, ax + av / 2, y + av / 2 + 1);

      g.direction = "rtl";
      g.textBaseline = "alphabetic";
      g.textAlign = "center";
      y += av + 18;
      g.fillStyle = "#15151a";
      g.font = `800 37px ${UI}`;
      g.fillText(profile.name, cx, y);
      y += 29;
      g.fillStyle = "#6b6b74";
      g.font = `500 20px ${UI}`;
      g.fillText(profile.role, cx, y);
      y += 27;
      g.fillStyle = "#9a9aa3";
      g.font = `400 18px ${UI}`;
      g.fillText(`${profile.location} · ${profile.locationEn}`, cx, y);

      y += 29;
      hairline(x, x + w, y);
      y += 28;
      g.restore();
    }

    /* ۲) معرفی کوتاه */
    {
      const s = rev(1);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      g.direction = "rtl";
      g.textAlign = "right";
      g.fillStyle = "#3d3d45";
      g.font = `400 21px ${UI}`;
      for (const l of wrap(g, profile.summary, w).slice(0, 3)) {
        g.fillText(l, x + w, y);
        y += 31;
      }
      y += 24;
      hairline(x, x + w, y);
      y += 26;
      g.restore();
    }

    /* ۳) آمار — فقط یک ردیف ساده و بدون کارت */
    {
      const s = rev(2);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      g.direction = "rtl";
      g.textAlign = "center";

      const items = [
        { v: "۶", l: "پروژهٔ وب" },
        { v: "۱", l: "پروژهٔ هوش مصنوعی" },
        { v: "۱۲", l: "مخزن عمومی" },
      ];
      const gap = 40;
      const cw = (w - gap * (items.length - 1)) / items.length;
      items.forEach((it, i) => {
        // چیدمان راست‌به‌چپ
        const bx = x + w - cw - i * (cw + gap);
        g.fillStyle = "#15151a";
        g.font = `700 34px ${UI}`;
        g.textAlign = "center";
        g.fillText(it.v, bx + cw / 2, y + 30);
        g.fillStyle = "#8a8a93";
        g.font = `400 18px ${UI}`;
        g.fillText(it.l, bx + cw / 2, y + 57);
      });

      y += 74;
      hairline(x, x + w, y);
      y += 26;
      g.restore();
    }

    /* ۴) مهارت‌ها — گروه‌ها با عنوان و چیپ‌های کم‌رنگ */
    {
      const s = rev(3);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      g.direction = "rtl";
      g.textAlign = "right";

      for (const group of skillGroups) {
        g.fillStyle = "#15151a";
        g.font = `700 21px ${UI}`;
        g.fillText(group.title, x + w, y + 18);
        g.fillStyle = "#a2a2ab";
        g.font = `400 17px ${UI}`;
        g.direction = "ltr";
        g.textAlign = "left";
        g.fillText(group.caption, x, y + 18);
        g.direction = "rtl";

        // چیپ‌ها زیر عنوان، راست‌به‌چپ
        y += 28;
        const chips = group.skills.slice(0, 4);
        let cx2 = x + w;
        for (const sk of chips) {
          g.font = `500 17px ${UI}`;
          const tw = g.measureText(sk.name).width + 28;
          if (cx2 - tw < x) {
            cx2 = x + w;
            y += 32;
          }
          g.fillStyle = "#f2f3f7";
          g.beginPath();
          g.roundRect(cx2 - tw, y, tw, 30, 15);
          g.fill();
          g.fillStyle = "#3d3d45";
          g.textAlign = "center";
          g.direction = "ltr";
          g.fillText(sk.name, cx2 - tw / 2, y + 20);
          g.direction = "rtl";
          cx2 -= tw + 10;
        }
        y += 30;
      }
      hairline(x, x + w, y - 12);
      g.restore();
    }

    /* ۵) سابقه و تحصیلات — فهرست ساده با نقطهٔ تأکید */
    {
      const s = rev(4);
      g.save();
      g.globalAlpha = clamp01(st.about.open * s.a);
      g.translate(0, s.dy);
      g.direction = "rtl";
      g.textAlign = "right";

      const entries = [
        ...experience.map((e) => ({
          t: e.role,
          m: `${e.company} · ${e.period}`,
          d: e.text,
        })),
        ...education.map((e) => ({
          t: e.degree,
          m: `${e.school} · ${e.period}`,
          d: e.text,
        })),
      ];

      for (const en of entries) {
        g.fillStyle = W.accent;
        g.beginPath();
        g.arc(x + w - 6, y + 12, 4.5, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = "#15151a";
        g.font = `600 21px ${UI}`;
        g.fillText(en.t, x + w - 24, y + 18);
        g.fillStyle = "#a2a2ab";
        g.font = `400 17px ${UI}`;
        g.fillText(en.m, x + w - 24, y + 39);
        g.fillStyle = "#55555e";
        g.font = `400 18px ${UI}`;
        g.fillText(en.d, x + w - 24, y + 58);
        y += 66;
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
    const x = bx + 14;
    const y = 14;
    const cw = w - 28;
    const ch = h - 28;

    // قاب مرورگر
    g.save();
    g.shadowColor = "rgba(0,0,0,0.22)";
    g.shadowBlur = 22;
    g.shadowOffsetY = 6;
    g.fillStyle = "#ffffff";
    rr(g, x, y, cw, ch, 10);
    g.fill();
    g.restore();

    const tabH = 42;
    const urlH = 44;
    const headH = tabH + urlH;

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
    const ux = x + 14;
    const uy = y + tabH + 5;
    const uw = cw - 28;
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
    const key =
      `${typed}|${st.power.toFixed(3)}|${st.desktop.toFixed(3)}` +
      `|${st.vscode.open.toFixed(3)}|${st.vscode.boot.toFixed(3)}|${st.vscode.shut.toFixed(3)}` +
      `|${st.menu.open.toFixed(3)}|${st.menu.hover.toFixed(3)}` +
      `|${st.about.open.toFixed(3)}|${st.about.reveal.toFixed(3)}|${st.about.shut.toFixed(3)}` +
      `|${st.projects.open.toFixed(3)}|${st.projects.pos.toFixed(3)}|${st.fade.toFixed(3)}`;
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