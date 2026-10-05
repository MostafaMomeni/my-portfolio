/**
 * رندر صفحه‌ی VS Code روی یک canvas دو بعدی.
 *
 * خروجی این ماژول به‌عنوان بافت روی صفحه‌ی لپ‌تاپ سه‌بعدی سوار می‌شود.
 * چون فقط متن و شکل‌های ساده است، canvas دو بعدی از نظر کیفیت متن و
 * سبک‌بودن خیلی بهتر از رندر سه‌بعدیِ متن است.
 */

import { codeLines, codeText, lineOffsets, editorFile } from "../../data/code";

export const SCREEN_W = 1600;
export const SCREEN_H = 1000;

/* ---------- ابعاد چیدمان ---------- */

const TITLE_H = 66;
const TABS_H = 58;
const STATUS_H = 44;
const ACTIVITY_W = 70;
const SIDEBAR_W = 340;
const GUTTER_W = 80;

const EDITOR_X = ACTIVITY_W + SIDEBAR_W;
const EDITOR_Y = TITLE_H + TABS_H;
const EDITOR_W = SCREEN_W - EDITOR_X;
const EDITOR_H = SCREEN_H - EDITOR_Y - STATUS_H;

const FONT_SIZE = 26;
const LINE_H = 42;
const CODE_X = EDITOR_X + GUTTER_W + 22;
const CODE_TOP = EDITOR_Y + 58;

const MONO = '"JetBrains Mono", "Cascadia Code", Consolas, "SF Mono", ui-monospace, monospace';
const SANS = '"Vazirmatn", "Segoe UI", Tahoma, sans-serif';

/* ---------- رنگ‌ها (تم تیره VS Code) ---------- */

const C = {
  editor: "#1f1f1f",
  sidebar: "#181818",
  activity: "#181818",
  border: "#2b2b2b",
  fg: "#cccccc",
  lineNum: "#5a5f6b",
  lineNumActive: "#c9c9c9",
  activeLine: "#2a2d2e",
  titlebar: "#181818",
  tabActive: "#1f1f1f",
  tabActiveFg: "#ffffff",
  tabInactive: "#2d2d2d",
  tabInactiveFg: "#8f8f8f",
  status: "#007acc",
  statusFg: "#ffffff",
  accent: "#4d7cff",
  section: "#bbbbbb",
};

const TOK = {
  com: "#6a9955",
  kw: "#569cd6",
  fn: "#dcdcaa",
  num: "#b5cea8",
  str: "#ce9178",
  prop: "#9cdcfe",
  p: "#d4d4d4",
  sp: "#d4d4d4",
};

/* ---------- برنامه‌ریزی خطوط برای تایپ شدن ---------- */

const LINE_PLANS = (() => {
  let cursor = 0;
  return codeLines.map((line) => {
    const start = cursor;
    let x = 0;
    const toks = line.map((token) => {
      const item = { ...token, start: x, len: token.v.length };
      x += token.v.length;
      return item;
    });
    cursor += x + 1;
    return { toks, len: x, start };
  });
})();

/* ---------- ابزارهای کمکی ---------- */

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smoothstep = (t) => t * t * (3 - 2 * t);

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function blob(g, x, y, r, color) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

/* ---------- ساخت رندر ---------- */

/**
 * @param {object} [opts]
 * @returns {{ canvas: HTMLCanvasElement, draw: (state: object) => void }}
 */
export function createScreenRenderer(opts = {}) {
  const canvas = opts.canvas || document.createElement("canvas");
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const g = canvas.getContext("2d", { alpha: false });

  g.direction = "ltr";
  g.textBaseline = "alphabetic";

  // عرض متن‌ها یک‌بار محاسبه و کش می‌شود تا هر باز-رسم سبک بماند.
  const widthCache = new Map();
  const widthOf = (text) => {
    let w = widthCache.get(text);
    if (w === undefined) {
      w = g.measureText(text).width;
      widthCache.set(text, w);
    }
    return w;
  };

  /* ---------- نوار عنوان ---------- */
  function drawTitleBar() {
    g.fillStyle = C.titlebar;
    g.fillRect(0, 0, SCREEN_W, TITLE_H);

    const dotY = TITLE_H / 2;
    const dots = ["#ff5f57", "#febc2e", "#28c840"];
    dots.forEach((color, i) => {
      g.fillStyle = color;
      g.beginPath();
      g.arc(34 + i * 32, dotY, 9, 0, Math.PI * 2);
      g.fill();
    });

    g.font = `500 21px ${SANS}`;
    g.fillStyle = "#b4b4b4";
    g.textAlign = "center";
    g.fillText(
      `${editorFile.file} — ${editorFile.project}`,
      SCREEN_W / 2,
      dotY + 8,
    );
    g.textAlign = "left";

    // دکمه‌های پنجره در سمت چپ
    g.strokeStyle = "#8a8a8a";
    g.lineWidth = 2;
    const bx = SCREEN_W - 40;
    g.strokeRect(bx - 46, dotY - 10, 20, 20);
    g.beginPath();
    g.moveTo(bx - 52, dotY - 10);
    g.lineTo(bx - 52, dotY + 10);
    g.stroke();
    g.beginPath();
    g.moveTo(bx - 40, dotY - 18);
    g.lineTo(bx - 28, dotY - 18);
    g.lineTo(bx - 28, dotY - 2);
    g.stroke();

    g.strokeStyle = "#2b2b2b";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, TITLE_H - 0.5);
    g.lineTo(SCREEN_W, TITLE_H - 0.5);
    g.stroke();
  }

  /* ---------- نوار فعالیت ---------- */
  function drawActivityBar() {
    g.fillStyle = C.activity;
    g.fillRect(0, TITLE_H, ACTIVITY_W, SCREEN_H - TITLE_H);

    const cx = ACTIVITY_W / 2;
    let y = TITLE_H + 54;
    const step = 62;

    const stroke = (color) => {
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 2.4;
      g.lineCap = "round";
    };

    // فایل‌ها (فعال)
    stroke(C.fg);
    g.beginPath();
    g.moveTo(cx - 11, y - 12);
    g.lineTo(cx + 4, y - 12);
    g.lineTo(cx + 11, y - 6);
    g.lineTo(cx + 11, y + 14);
    g.lineTo(cx - 11, y + 14);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(cx - 11, y - 5);
    g.lineTo(cx + 2, y - 5);
    g.lineTo(cx + 11, y + 3);
    g.stroke();

    // نشان فعال
    g.fillStyle = C.fg;
    g.fillRect(0, y - 22, 3, 44);

    y += step;
    stroke("#868686");
    g.beginPath();
    g.arc(cx - 2, y - 3, 9, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(cx + 5, y + 5);
    g.lineTo(cx + 13, y + 13);
    g.stroke();

    y += step;
    stroke("#868686");
    [[0, -16], [0, 0], [0, 16]].forEach(([dx, dy]) => {
      g.beginPath();
      g.arc(cx + dx, y + dy, 4.5, 0, Math.PI * 2);
      g.fill();
    });
    g.beginPath();
    g.moveTo(cx, y - 11);
    g.lineTo(cx, y + 11);
    g.stroke();

    y += step;
    stroke("#868686");
    g.beginPath();
    g.moveTo(cx - 12, y - 9);
    g.lineTo(cx - 3, y);
    g.lineTo(cx - 12, y + 9);
    g.closePath();
    g.stroke();

    y += step;
    stroke("#868686");
    for (const [dx, dy] of [
      [-10, -10],
      [10, -10],
      [-10, 10],
      [10, 10],
    ]) {
      g.strokeRect(cx + dx - 5, y + dy - 5, 10, 10);
    }

    // چرخ‌دنده، پایین نوار
    const gy = SCREEN_H - STATUS_H - 46;
    stroke("#868686");
    g.beginPath();
    g.arc(cx, gy, 9, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * 9, gy + Math.sin(a) * 9);
      g.lineTo(cx + Math.cos(a) * 14, gy + Math.sin(a) * 14);
      g.stroke();
    }
  }

  /* ---------- نوار کناری (Explorer) ---------- */
  const TREE = [
    { label: "MOSTAFA-PORTFOLIO", depth: 0, kind: "root", open: true },
    { label: "developer.py", depth: 1, kind: "file", open: false, active: true },
    { label: "app", depth: 1, kind: "folder", open: false },
    { label: "components", depth: 1, kind: "folder", open: false },
    { label: "data", depth: 1, kind: "folder", open: false },
    { label: "public", depth: 1, kind: "folder", open: false },
    { label: "package.json", depth: 1, kind: "file", open: false },
    { label: "README.md", depth: 1, kind: "file", open: false },
  ];

  function drawSidebar() {
    const x0 = ACTIVITY_W;
    g.fillStyle = C.sidebar;
    g.fillRect(x0, TITLE_H, SIDEBAR_W, SCREEN_H - TITLE_H - STATUS_H);

    g.font = `700 17px ${SANS}`;
    g.fillStyle = C.section;
    g.fillText("EXPLORER", x0 + 26, TITLE_H + 44);

    g.strokeStyle = C.border;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x0 + 0.5, TITLE_H);
    g.lineTo(x0 + 0.5, SCREEN_H - STATUS_H);
    g.stroke();

    let y = TITLE_H + 88;
    for (const item of TREE) {
      if (item.active) {
        g.fillStyle = "#2a2d2e";
        g.fillRect(x0, y - 22, SIDEBAR_W, 36);
        g.fillStyle = "#04395e";
        g.fillRect(x0, y - 22, 2, 36);
      }

      const ix = x0 + 24 + item.depth * 20;

      // پیکان پوشه
      if (item.kind === "folder" || item.kind === "root") {
        g.strokeStyle = C.fg;
        g.lineWidth = 2;
        g.beginPath();
        if (item.open) {
          g.moveTo(ix, y - 6);
          g.lineTo(ix + 6, y);
          g.lineTo(ix, y + 6);
        } else {
          g.moveTo(ix - 4, y - 6);
          g.lineTo(ix + 2, y);
          g.lineTo(ix - 4, y + 6);
        }
        g.stroke();
      }

      const tx = ix + 16;

      // آیکون فایل پایتون
      if (item.kind === "file" && item.label.endsWith(".py")) {
        const fx = tx + 2;
        const fy = y - 12;
        g.fillStyle = "#4b8bbe";
        roundRect(g, fx, fy, 15, 19, 3);
        g.fill();
        g.fillStyle = "#fdd043";
        g.beginPath();
        g.ellipse(fx + 7.5, fy + 7, 4.5, 4, 0, 0, Math.PI * 2);
        g.fill();
      } else if (item.kind === "file") {
        g.strokeStyle = "#c5c5c5";
        g.lineWidth = 1.8;
        g.strokeRect(tx + 2, y - 12, 14, 17);
      }

      g.font = `500 20px ${SANS}`;
      g.fillStyle = item.active ? "#ffffff" : "#c8c8c8";
      g.fillText(item.label, tx + 26, y + 4);

      y += 36;
    }

    // پایین نوار کناری
    g.strokeStyle = C.border;
    g.beginPath();
    g.moveTo(x0, SCREEN_H - STATUS_H + 0.5);
    g.lineTo(SCREEN_W, SCREEN_H - STATUS_H + 0.5);
    g.stroke();
  }

  /* ---------- پس‌زمینه‌ی ویرایشگر ---------- */
  function drawEditorBackground() {
    g.fillStyle = C.editor;
    g.fillRect(EDITOR_X, TITLE_H, EDITOR_W, SCREEN_H - TITLE_H - STATUS_H);
  }

  /* ---------- تب‌ها ---------- */
  function drawTabs() {
    g.fillStyle = C.titlebar;
    g.fillRect(EDITOR_X, TITLE_H, EDITOR_W, TABS_H);

    // تب فعال
    g.fillStyle = C.tabActive;
    g.fillRect(EDITOR_X, TITLE_H, 250, TABS_H);
    g.fillStyle = C.border;
    g.fillRect(EDITOR_X + 250, TITLE_H + 8, 1, TABS_H - 8);

    // تب غیرفعال
    g.fillStyle = C.tabInactive;
    g.fillRect(EDITOR_X + 252, TITLE_H + 6, 190, TABS_H - 6);
    g.font = `400 19px ${SANS}`;
    g.fillStyle = C.tabInactiveFg;
    g.fillText("README.md", EDITOR_X + 300, TITLE_H + 36);
    g.strokeStyle = "#868686";
    g.lineWidth = 1.8;
    g.strokeRect(EDITOR_X + 272, TITLE_H + 18, 15, 17);

    // تب فعال: آیکون پایتون + نام فایل
    const ix = EDITOR_X + 30;
    const iy = TITLE_H + 17;
    g.fillStyle = "#4b8bbe";
    roundRect(g, ix, iy, 16, 20, 3);
    g.fill();
    g.fillStyle = "#fdd043";
    g.beginPath();
    g.ellipse(ix + 8, iy + 7.5, 4.8, 4.2, 0, 0, Math.PI * 2);
    g.fill();

    g.font = `400 20px ${SANS}`;
    g.fillStyle = C.tabActiveFg;
    g.fillText(editorFile.file, ix + 28, TITLE_H + 37);

    // دکمه بستن
    g.strokeStyle = "#cccccc";
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(EDITOR_X + 226, TITLE_H + 26);
    g.lineTo(EDITOR_X + 236, TITLE_H + 36);
    g.moveTo(EDITOR_X + 236, TITLE_H + 26);
    g.lineTo(EDITOR_X + 226, TITLE_H + 36);
    g.stroke();

    g.strokeStyle = C.border;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(EDITOR_X, TITLE_H + TABS_H - 0.5);
    g.lineTo(SCREEN_W, TITLE_H + TABS_H - 0.5);
    g.stroke();
  }

  /* ---------- نوار وضعیت ---------- */
  function drawStatusBar() {
    const y = SCREEN_H - STATUS_H;
    g.fillStyle = C.status;
    g.fillRect(0, y, SCREEN_W, STATUS_H);

    g.font = `400 18px ${SANS}`;
    g.fillStyle = C.statusFg;

    // آیکون شاخه
    g.strokeStyle = C.statusFg;
    g.lineWidth = 2;
    g.beginPath();
    g.arc(24, y + STATUS_H / 2, 4, 0, Math.PI * 2);
    g.moveTo(24, y + STATUS_H / 2 - 4);
    g.lineTo(24, y + STATUS_H / 2 - 11);
    g.moveTo(24, y + STATUS_H / 2 - 11);
    g.lineTo(33, y + STATUS_H / 2 - 11);
    g.stroke();
    g.beginPath();
    g.arc(33, y + STATUS_H / 2 - 11, 4, 0, Math.PI * 2);
    g.stroke();

    g.fillStyle = C.statusFg;
    g.fillText(editorFile.branch, 46, y + STATUS_H / 2 + 7);

    g.fillText("×", 150, y + STATUS_H / 2 + 7);
    g.strokeStyle = C.statusFg;
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(184, y + STATUS_H / 2 - 2, 3.5, 0, Math.PI * 2);
    g.moveTo(181, y + STATUS_H / 2 + 3);
    g.lineTo(187, y + STATUS_H / 2 + 9);
    g.moveTo(187, y + STATUS_H / 2 + 3);
    g.lineTo(181, y + STATUS_H / 2 + 9);
    g.stroke();
    g.fillStyle = C.statusFg;
    g.fillText("0", 196, y + STATUS_H / 2 + 7);

    // سمت راست نوار وضعیت
    g.textAlign = "right";
    const rightText = `${editorFile.language}   UTF-8   LF   Python   ☑  Go Live`;
    g.fillText(rightText, SCREEN_W - 26, y + STATUS_H / 2 + 7);
    g.textAlign = "left";
  }

  /* ---------- نقشه کوچک ---------- */
  function drawMinimap() {
    const mw = 132;
    const mx = SCREEN_W - mw - 18;
    let my = CODE_TOP + 4;

    g.save();
    for (const plan of LINE_PLANS) {
      if (!plan.toks.length) continue;
      let px = mx;
      for (const tk of plan.toks) {
        const w = Math.max(3, Math.min(widthOf(tk.v) * 0.42, 96));
        g.globalAlpha = tk.t === "sp" ? 0.3 : 0.75;
        g.fillStyle = TOK[tk.t] || "#888";
        g.fillRect(px, my, w, 6);
        px += w + 4;
        if (px > mx + mw) break;
      }
      my += 16;
    }
    g.restore();
  }

  /* ---------- کد ---------- */
  function drawCode(typed) {
    // خط فعال
    let activeLine = 0;
    for (let i = 0; i < LINE_PLANS.length; i++) {
      if (typed >= LINE_PLANS[i].start) activeLine = i;
    }

    const ay = CODE_TOP + activeLine * LINE_H;
    g.fillStyle = C.activeLine;
    g.fillRect(EDITOR_X, ay - FONT_SIZE, EDITOR_W, LINE_H);

    g.font = `${FONT_SIZE}px ${MONO}`;
    g.textBaseline = "alphabetic";

    for (let i = 0; i < LINE_PLANS.length; i++) {
      const plan = LINE_PLANS[i];
      const y = CODE_TOP + i * LINE_H + FONT_SIZE;

      // شماره خط
      g.font = `${FONT_SIZE}px ${MONO}`;
      g.fillStyle = i === activeLine ? C.lineNumActive : C.lineNum;
      g.textAlign = "right";
      g.fillText(String(i + 1), EDITOR_X + GUTTER_W - 16, y);
      g.textAlign = "left";

      if (!plan.toks.length) continue;

      const shown = clamp(typed - plan.start, 0, plan.len);
      let x = CODE_X;

      for (const tk of plan.toks) {
        const bright = clamp(shown - tk.start, 0, tk.len);
        if (bright > 0) {
          const head = tk.v.slice(0, bright);
          g.fillStyle = TOK[tk.t] || C.fg;
          g.fillText(head, x, y);
          x += widthOf(head);
        }
        const rest = tk.v.slice(bright);
        if (rest) {
          g.fillStyle = "rgba(212,212,212,0.15)";
          g.fillText(rest, x, y);
          x += widthOf(rest);
        }
      }
    }
  }

  /* ---------- مکان‌نما ---------- */
  function caretPoint(typed) {
    let x = CODE_X;
    let y = CODE_TOP + FONT_SIZE;
    for (let i = 0; i < LINE_PLANS.length; i++) {
      const plan = LINE_PLANS[i];
      const shown = clamp(typed - plan.start, 0, plan.len);
      y = CODE_TOP + i * LINE_H + FONT_SIZE;
      if (shown >= plan.len) {
        x = CODE_X + widthOf(codeText[i]);
      } else {
        let cx = CODE_X;
        for (const tk of plan.toks) {
          const bright = clamp(shown - tk.start, 0, tk.len);
          cx += widthOf(tk.v.slice(0, bright));
        }
        x = cx;
      }
      if (shown < plan.len) break;
    }
    return { x, y };
  }

  function drawCaret(typed) {
    const { x, y } = caretPoint(typed);
    g.fillStyle = "#aeafad";
    g.fillRect(x, y - FONT_SIZE + 3, 4, FONT_SIZE + 5);
  }

  /* ---------- صفحه‌ی راه‌اندازی (splash) ---------- */

  const VSCODE_PATH = new Path2D(
    "M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352Zm-5.146 14.861L10.826 12l7.178-5.448v10.896Z",
  );

  function drawSplash(boot) {
    g.fillStyle = "#181818";
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);

    const cx = SCREEN_W / 2;
    const cy = SCREEN_H / 2 - 40;

    // هاله‌ی پشت لوگو
    blob(g, cx, cy + 20, 260, "rgba(0,122,204,0.16)");
    blob(g, cx, cy + 20, 130, "rgba(77,124,255,0.14)");

    // لوگوی VS Code
    const s = 4.6;
    g.save();
    g.translate(cx - (24 * s) / 2, cy - (24 * s) / 2);
    g.scale(s, s);
    g.fillStyle = "#0098ff";
    g.fill(VSCODE_PATH);
    g.restore();

    g.font = `600 34px ${SANS}`;
    g.fillStyle = "#e7e7e7";
    g.textAlign = "center";
    g.fillText("Visual Studio Code", cx, cy + 130);

    g.font = `400 24px ${SANS}`;
    g.fillStyle = "#8a8a8a";
    g.fillText("Starting up...", cx, cy + 178);

    // نوار پیشرفت
    const bw = 340;
    const bh = 5;
    const bx = cx - bw / 2;
    const by = cy + 210;
    g.fillStyle = "#2a2d2e";
    roundRect(g, bx, by, bw, bh, 3);
    g.fill();
    const fill = clamp(smoothstep(boot));
    if (fill > 0.02) {
      const grad = g.createLinearGradient(bx, 0, bx + bw, 0);
      grad.addColorStop(0, "#4d7cff");
      grad.addColorStop(1, "#22d3ee");
      g.fillStyle = grad;
      roundRect(g, bx, by, Math.max(bh, bw * fill), bh, 3);
      g.fill();
    }

    g.textAlign = "left";
  }

  /* ---------- لایه‌های روی صفحه ---------- */
  function drawOverlay() {
    // خطوط اسکن
    g.save();
    g.globalAlpha = 0.04;
    g.fillStyle = "#000";
    for (let y = 0; y < SCREEN_H; y += 4) g.fillRect(0, y, SCREEN_W, 1);
    g.restore();

    // وینیت
    const grad = g.createRadialGradient(
      SCREEN_W / 2,
      SCREEN_H / 2,
      SCREEN_H * 0.45,
      SCREEN_W / 2,
      SCREEN_H / 2,
      SCREEN_W * 0.78,
    );
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(1, "rgba(0,0,0,0.34)");
    g.fillStyle = grad;
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  /* ---------- باز-رسم کامل ---------- */

  let lastKey = "";

/**
   * رابط ویرایشگر را می‌کشد.
   *
   * @param {{typed?:number, caret?:boolean, rect?:{x:number,y:number,w:number,h:number}}} state
   *   rect — اگر داده شود، کل رابط داخل این مستطیل مقیاس می‌خورد تا داخل
   *   پنجره‌ی ویندوز بنشیند؛ در غیر این صورت کل بوم پر می‌شود.
   * @returns {boolean} اگر واقعاً رسم تازه انجام شده باشد true — برای آنکه
   *   ساخنده‌ی صحنه بداند بافت باید دوباره به GPU فرستاده شود.
   */
  function draw(state = {}) {
    const typed = state.typed ?? 0;
    const caret = state.caret ?? true;
    const rect = state.rect;

    const key =
      `${typed}|${caret}|` +
      (rect
        ? `${Math.round(rect.x)}:${Math.round(rect.y)}:${Math.round(rect.w)}:${Math.round(rect.h)}`
        : "full");

    if (key === lastKey) return false;
    lastKey = key;

    g.fillStyle = "#000000";
    if (rect) g.fillRect(rect.x, rect.y, rect.w, rect.h);
    else g.fillRect(0, 0, SCREEN_W, SCREEN_H);

    g.save();
    if (rect) {
      g.translate(rect.x, rect.y);
      g.scale(rect.w / SCREEN_W, rect.h / SCREEN_H);
    }
    drawTitleBar();
    drawActivityBar();
    drawSidebar();
    drawEditorBackground();
    drawTabs();
    drawCode(typed);
    if (caret && typed > 0) drawCaret(typed);
    drawMinimap();
    drawStatusBar();
    g.restore();

    return true;
  }

  return { canvas, draw, drawSplash, drawOverlay };
}