/**
 * رندر صفحه‌ی VS Code روی یک canvas دو بعدی.
 *
 * خروجی این ماژول به‌عنوان بافت روی صفحه‌ی لپ‌تاپ سه‌بعدی سوار می‌شود.
 * چون فقط متن و شکل‌های ساده است، canvas دو بعدی از نظر کیفیت متن و
 * سبک‌بودن خیلی بهتر از رندر سه‌بعدیِ متن است.
 *
 * چیدمان و رنگ‌ها از تم «Dark Modern» خودِ VS Code گرفته شده‌اند:
 * نوار عنوان با جعبهٔ فرمان وسط، نوار فعالیت، پنل Explorer، تب‌ها،
 * نوار مسیر، راهنمای تورفتگی، نقشهٔ کوچک و نوار وضعیت آبی.
 */

import { codeLines, codeText, editorFile } from "../../data/code";

export const SCREEN_W = 1600;
export const SCREEN_H = 1000;

/* ---------- ابعاد چیدمان ---------- */

const TITLE_H = 44; // نوار عنوان اختصاصی VS Code
const TABS_H = 42; // نوار تب‌ها
const CRUMB_H = 30; // نوار مسیر (breadcrumb)
const STATUS_H = 34; // نوار وضعیت
const ACTIVITY_W = 52; // نوار فعالیت
const SIDEBAR_W = 300; // پنل Explorer
const GUTTER_W = 74; // شماره خط‌ها + فاصله

const EDITOR_X = ACTIVITY_W + SIDEBAR_W;
const EDITOR_Y = TITLE_H + TABS_H + CRUMB_H;
const EDITOR_W = SCREEN_W - EDITOR_X;
const EDITOR_H = SCREEN_H - EDITOR_Y - STATUS_H;

const FONT_SIZE = 23;
const LINE_H = 40;
const CODE_X = EDITOR_X + GUTTER_W;
const CODE_TOP = EDITOR_Y + 32;
const INDENT = 34; // عرض یک سطح تورفتگی

const MONO = '"JetBrains Mono", "Cascadia Code", Consolas, "SF Mono", ui-monospace, monospace';
const SANS = '"Segoe UI", "Vazirmatn", Tahoma, sans-serif';

/* ---------- رنگ‌های تم Dark Modern ---------- */

const C = {
  titlebar: "#181818",
  titleFg: "#cccccc",
  titleDim: "#9d9d9d",
  activity: "#181818",
  activityBorder: "#2b2b2b",
  sidebar: "#181818",
  sidebarBorder: "#2b2b2b",
  section: "#cccccc",
  editor: "#1f1f1f",
  editorFg: "#cccccc",
  tabs: "#181818",
  tabActive: "#1f1f1f",
  tabActiveBorder: "#0078d4",
  tabInactiveFg: "#9d9d9d",
  border: "#2b2b2b",
  status: "#181818",
  statusFg: "#cccccc",
  lineNum: "#6e7681",
  lineNumActive: "#cccccc",
  activeLine: "#282828",
  indentGuide: "#404040",
  input: "#313131",
  inputBorder: "#3c3c3c",
  minimap: "#cccccc",
  iconDim: "#868686",
  iconOn: "#ffffff",
  accent: "#0078d4",
  warning: "#cca700",
  error: "#f14c4c",
  jsFile: "#e8c547",
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

/** آیکون فایل جاوااسکریپت: مربع «JS» زرد، درست مثل آیکون VS Code. */
function jsFileIcon(g, x, y, s) {
  g.save();
  g.translate(x, y);
  g.fillStyle = "#e8c547";
  g.beginPath();
  g.roundRect(-s / 2, -s / 2, s, s, 2);
  g.fill();
  g.fillStyle = "#1f1f1f";
  g.font = `700 ${Math.round(s * 0.66)}px ${SANS}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("JS", 0, s * 0.04);
  g.restore();
}

/* ---------- درخت فایل ---------- */

const TREE = [
  { label: "MOSTAFA-PORTFOLIO", depth: 0, kind: "root", open: true },
  { label: ".gitignore", depth: 1, kind: "file" },
  { label: "developer.js", depth: 1, kind: "js", active: true },
  { label: "app", depth: 1, kind: "folder" },
  { label: "components", depth: 1, kind: "folder" },
  { label: "data", depth: 1, kind: "folder" },
  { label: "public", depth: 1, kind: "folder" },
  { label: "next.config.js", depth: 1, kind: "js" },
  { label: "package.json", depth: 1, kind: "json" },
  { label: "README.md", depth: 1, kind: "md" },
];

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

  /* ---------- نوار عنوان اختصاصی VS Code ---------- */

  function drawTitleBar() {
    g.fillStyle = C.titlebar;
    g.fillRect(0, 0, SCREEN_W, TITLE_H);

    // لوگوی VS Code در چپ
    const logo = VSCODE_PATH;
    g.save();
    g.translate(20, TITLE_H / 2 - 11);
    g.scale(0.92, 0.92);
    g.fillStyle = "#0098ff";
    g.fill(logo);
    g.restore();

    g.font = `500 16px ${SANS}`;
    g.fillStyle = C.titleDim;
    g.textAlign = "left";
    g.fillText(editorFile.project, 44, TITLE_H / 2 + 6);

    // جعبهٔ فرمان وسط نوار عنوان — امضای ظاهری VS Code
    const cw = 460;
    const ch = 26;
    const cx = (SCREEN_W - cw) / 2;
    const cy = (TITLE_H - ch) / 2;
    g.fillStyle = C.input;
    roundRect(g, cx, cy, cw, ch, 6);
    g.fill();
    g.strokeStyle = C.inputBorder;
    g.lineWidth = 1;
    g.stroke();

    g.strokeStyle = C.iconDim;
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(cx + 16, cy + ch / 2, 5.5, 0, Math.PI * 2);
    g.moveTo(cx + 20, cy + ch / 2 + 5);
    g.lineTo(cx + 24, cy + ch / 2 + 9);
    g.stroke();

    g.font = `400 15px ${SANS}`;
    g.fillStyle = C.titleDim;
    g.textAlign = "left";
    g.fillText(`${editorFile.file} — ${editorFile.project}`, cx + 32, cy + ch / 2 + 5);

    // دکمه‌های پنجره در راست، مثل ویندوز
    const bw = 46;
    const by = TITLE_H / 2;
    let bx = SCREEN_W - bw / 2;
    const winButtons = [
      { kind: "close", hover: "#c42b1c" },
      { kind: "max", hover: "#313131" },
      { kind: "min", hover: "#313131" },
    ];
    for (const b of winButtons) {
      g.strokeStyle = b.kind === "close" ? "#cccccc" : "#d0d0d0";
      g.lineWidth = 1.2;
      if (b.kind === "min") {
        g.beginPath();
        g.moveTo(bx - 6, by + 5);
        g.lineTo(bx + 6, by + 5);
        g.stroke();
      } else if (b.kind === "max") {
        g.strokeRect(bx - 6, by - 6, 12, 12);
      } else {
        g.beginPath();
        g.moveTo(bx - 6, by - 6);
        g.lineTo(bx + 6, by + 6);
        g.moveTo(bx + 6, by - 6);
        g.lineTo(bx - 6, by + 6);
        g.stroke();
      }
      bx -= bw;
    }
  }

  /* ---------- نوار فعالیت ---------- */

  const ACTIVITY_ICONS = [
    "files",
    "search",
    "control",
    "debug",
    "extensions",
  ];

  function drawActivityBar() {
    g.fillStyle = C.activity;
    g.fillRect(0, TITLE_H, ACTIVITY_W, SCREEN_H - TITLE_H);

    const cx = ACTIVITY_W / 2;
    let y = TITLE_H + 34;
    const step = 56;

    for (let i = 0; i < ACTIVITY_ICONS.length; i++) {
      drawActivityIcon(cx, y, ACTIVITY_ICONS[i], i === 0);
      if (i === 0) {
        g.fillStyle = C.iconOn;
        g.fillRect(0, y - 15, 2, 30);
      }
      y += step;
    }

    // چرخ‌دندهٔ تنظیمات، پایین نوار
    drawGear(cx, SCREEN_H - STATUS_H - 34);

    g.strokeStyle = C.activityBorder;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(ACTIVITY_W - 0.5, TITLE_H);
    g.lineTo(ACTIVITY_W - 0.5, SCREEN_H - STATUS_H);
    g.stroke();
  }

  function drawActivityIcon(cx, cy, kind, active) {
    g.strokeStyle = active ? C.iconOn : C.iconDim;
    g.fillStyle = active ? C.iconOn : C.iconDim;
    g.lineWidth = 1.7;
    g.lineCap = "round";
    g.lineJoin = "round";

    if (kind === "files") {
      g.beginPath();
      g.moveTo(cx - 11, cy - 13);
      g.lineTo(cx + 2, cy - 13);
      g.lineTo(cx + 11, cy - 5);
      g.lineTo(cx + 11, cy + 13);
      g.lineTo(cx - 11, cy + 13);
      g.closePath();
      g.stroke();
      g.beginPath();
      g.moveTo(cx - 11, cy - 6);
      g.lineTo(cx, cy - 6);
      g.lineTo(cx + 11, cy + 4);
      g.stroke();
    } else if (kind === "search") {
      g.beginPath();
      g.arc(cx - 2, cy - 3, 8, 0, Math.PI * 2);
      g.stroke();
      g.beginPath();
      g.moveTo(cx + 4, cy + 3);
      g.lineTo(cx + 11, cy + 10);
      g.stroke();
    } else if (kind === "control") {
      const dots = [
        [-10, -6],
        [0, -6],
        [10, -6],
        [-10, 6],
        [0, 6],
        [10, 6],
      ];
      for (const [dx, dy] of dots) {
        g.beginPath();
        g.arc(cx + dx, cy + dy, 3, 0, Math.PI * 2);
        g.fill();
      }
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - 10, cy - 3);
      g.lineTo(cx - 10, cy + 3);
      g.moveTo(cx, cy - 3);
      g.lineTo(cx, cy + 3);
      g.moveTo(cx + 10, cy - 3);
      g.lineTo(cx + 10, cy + 3);
      g.stroke();
    } else if (kind === "debug") {
      g.beginPath();
      g.moveTo(cx - 6, cy - 13);
      g.lineTo(cx + 6, cy - 13);
      g.lineTo(cx + 6, cy - 3);
      g.lineTo(cx - 6, cy - 3);
      g.closePath();
      g.stroke();
      g.fillRect(cx - 2, cy - 3, 4, 9);
      g.fillRect(cx - 8, cy + 6, 16, 3);
    } else {
      // extensions: چهار قطعه، یکی جدا افتاده
      const blocks = [
        [-9, -11, 8, 8],
        [1, -11, 8, 8],
        [-9, 1, 8, 8],
        [3, 3, 7, 7],
      ];
      for (const [dx, dy, bw2, bh2] of blocks) {
        g.strokeRect(cx + dx, cy + dy, bw2, bh2);
      }
    }
  }

  function drawGear(cx, cy) {
    g.strokeStyle = C.iconDim;
    g.fillStyle = C.iconDim;
    g.lineWidth = 1.7;
    g.lineCap = "round";
    g.beginPath();
    g.arc(cx, cy, 6, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9);
      g.lineTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13);
      g.stroke();
    }
  }

  /* ---------- پنل Explorer ---------- */

  function fileIcon(g2, x, y, kind) {
    if (kind === "js") {
      jsFileIcon(g2, x + 8, y - 5, 17);
    } else if (kind === "json") {
      g2.fillStyle = "#cbcb41";
      g2.beginPath();
      g2.roundRect(x, y - 13, 13, 15, 2);
      g2.fill();
      g2.strokeStyle = "#1f1f1f";
      g2.lineWidth = 1.4;
      g2.beginPath();
      g2.moveTo(x + 3, y - 8);
      g2.quadraticCurveTo(x + 7, y - 6, x + 10, y - 8);
      g2.moveTo(x + 3, y - 4);
      g2.quadraticCurveTo(x + 7, y - 2, x + 10, y - 4);
      g2.stroke();
    } else if (kind === "md") {
      g2.fillStyle = "#519aba";
      g2.beginPath();
      g2.roundRect(x, y - 13, 14, 16, 2);
      g2.fill();
      g2.fillStyle = "#1f1f1f";
      g2.font = `700 9px ${SANS}`;
      g2.textAlign = "center";
      g2.textBaseline = "middle";
      g2.fillText("M↓", x + 7, y - 5);
    } else if (kind === "folder") {
      g2.fillStyle = "#dcb67a";
      g2.beginPath();
      g2.moveTo(x, y - 5);
      g2.lineTo(x, y - 11);
      g2.lineTo(x + 6, y - 11);
      g2.lineTo(x + 8, y - 8);
      g2.lineTo(x + 14, y - 8);
      g2.lineTo(x + 14, y - 5);
      g2.closePath();
      g2.fill();
    } else if (kind === "root") {
      g2.strokeStyle = "#c5c5c5";
      g2.lineWidth = 1.6;
      g2.beginPath();
      g2.moveTo(x + 1, y - 8);
      g2.lineTo(x + 5, y - 4);
      g2.lineTo(x + 1, y);
      g2.stroke();
    } else {
      g2.fillStyle = "#c5c5c5";
      g2.beginPath();
      g2.roundRect(x + 1, y - 12, 13, 14, 2);
      g2.fill();
    }
  }

  function drawSidebar() {
    const x0 = ACTIVITY_W;
    g.fillStyle = C.sidebar;
    g.fillRect(x0, TITLE_H, SIDEBAR_W, SCREEN_H - TITLE_H - STATUS_H);

    // عنوان بخش، با دکمه‌های کنارش مثل Explorer واقعی
    g.font = `400 11px ${SANS}`;
    g.fillStyle = C.section;
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillText("EXPLORER", x0 + 22, TITLE_H + 26);

    g.strokeStyle = C.iconDim;
    g.fillStyle = C.iconDim;
    g.lineWidth = 1.5;
    // سه نقطهٔ بالا
    for (let i = 0; i < 3; i++) {
      g.fillRect(x0 + SIDEBAR_W - 56 + i * 14, TITLE_H + 23, 3, 3);
    }
    // آیکون فایل‌های جدید
    g.beginPath();
    g.moveTo(x0 + SIDEBAR_W - 32, TITLE_H + 20);
    g.lineTo(x0 + SIDEBAR_W - 20, TITLE_H + 20);
    g.lineTo(x0 + SIDEBAR_W - 20, TITLE_H + 32);
    g.stroke();

    g.strokeStyle = C.sidebarBorder;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x0, TITLE_H + TABS_H + CRUMB_H - 0.5);
    g.lineTo(x0 + SIDEBAR_W, TITLE_H + TABS_H + CRUMB_H - 0.5);
    g.stroke();

    let y = TITLE_H + TABS_H + CRUMB_H + 26;
    for (const item of TREE) {
      if (item.active) {
        g.fillStyle = "#37373d";
        g.fillRect(x0, y - 12, SIDEBAR_W, 24);
        g.fillStyle = C.accent;
        g.fillRect(x0, y - 12, 2, 24);
      }

      const ix = x0 + 16 + item.depth * 14;

      // پیکان باز/بستهٔ پوشه
      if (item.kind === "folder" || item.kind === "root") {
        g.strokeStyle = "#cccccc";
        g.lineWidth = 1.6;
        g.beginPath();
        if (item.open) {
          g.moveTo(ix - 4, y - 8);
          g.lineTo(ix + 1, y - 3);
          g.lineTo(ix - 4, y + 2);
        } else {
          g.moveTo(ix - 7, y - 5);
          g.lineTo(ix - 2, y);
          g.lineTo(ix - 7, y + 5);
        }
        g.stroke();
      }

      const labelX = ix + 14;
      if (item.kind !== "root" && item.kind !== "folder") {
        fileIcon(g, labelX, y + 2, item.kind);
      }

      g.font = `${item.active ? 400 : 400} 15px ${SANS}`;
      g.fillStyle = item.active ? "#ffffff" : "#cccccc";
      g.textAlign = "left";
      g.textBaseline = "middle";
      const tx = item.kind === "root" || item.kind === "folder" ? labelX : labelX + 22;
      g.fillText(item.label, tx, y);

      y += 24;
    }

    // بخش OUTLINE خالی، پایین Explorer
    g.font = `400 11px ${SANS}`;
    g.fillStyle = C.section;
    g.textAlign = "left";
    g.fillText("OUTLINE", x0 + 22, y + 14);

    g.strokeStyle = C.iconDim;
    g.fillStyle = C.iconDim;
    for (let i = 0; i < 3; i++) {
      g.fillRect(x0 + SIDEBAR_W - 56 + i * 14, y + 11, 3, 3);
    }
    g.beginPath();
    g.arc(x0 + 32, y + 13, 6, 0, Math.PI * 2);
    g.stroke();

    g.strokeStyle = C.sidebarBorder;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x0, SCREEN_H - STATUS_H + 0.5);
    g.lineTo(SCREEN_W, SCREEN_H - STATUS_H + 0.5);
    g.stroke();
  }

  /* ---------- ویرایشگر ---------- */

  function drawEditorBackground() {
    g.fillStyle = C.editor;
    g.fillRect(EDITOR_X, EDITOR_Y, EDITOR_W, EDITOR_H);
  }

  function drawTabs() {
    g.fillStyle = C.tabs;
    g.fillRect(EDITOR_X, TITLE_H, EDITOR_W, TABS_H);

    // تب فعال
    g.fillStyle = C.tabActive;
    g.fillRect(EDITOR_X, TITLE_H, 240, TABS_H);
    g.fillStyle = C.tabActiveBorder; // نوار آبی بالای تب فعال
    g.fillRect(EDITOR_X, TITLE_H, 240, 1.5);

    // تب غیرفعال
    g.fillStyle = "#2d2d2d";
    g.beginPath();
    g.roundRect(EDITOR_X + 242, TITLE_H + 5, 150, TABS_H - 5, 6);
    g.fill();

    // --- تب فعال: developer.js ---
    jsFileIcon(g, EDITOR_X + 24, TITLE_H + TABS_H / 2, 16);
    g.font = `400 15px ${SANS}`;
    g.fillStyle = "#ffffff";
    g.textAlign = "left";
    g.textBaseline = "middle";
    g.fillText(editorFile.file, EDITOR_X + 40, TITLE_H + TABS_H / 2 + 1);

    // × بستن تب فعال
    g.strokeStyle = "#cccccc";
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(EDITOR_X + 208, TITLE_H + TABS_H / 2 - 5);
    g.lineTo(EDITOR_X + 218, TITLE_H + TABS_H / 2 + 5);
    g.moveTo(EDITOR_X + 218, TITLE_H + TABS_H / 2 - 5);
    g.lineTo(EDITOR_X + 208, TITLE_H + TABS_H / 2 + 5);
    g.stroke();

    // --- تب غیرفعال: README.md ---
    fileIcon(g, EDITOR_X + 260, TITLE_H + TABS_H / 2 + 2, "md");
    g.font = `400 15px ${SANS}`;
    g.fillStyle = C.tabInactiveFg;
    g.fillText("README.md", EDITOR_X + 284, TITLE_H + TABS_H / 2 + 1);

    // خط جداکنندهٔ تب‌ها
    g.strokeStyle = C.border;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(EDITOR_X, TITLE_H + TABS_H - 0.5);
    g.lineTo(SCREEN_W, TITLE_H + TABS_H - 0.5);
    g.stroke();
  }

  function drawBreadcrumb() {
    g.fillStyle = C.editor;
    g.fillRect(EDITOR_X, TITLE_H + TABS_H, EDITOR_W, CRUMB_H);

    const cy = TITLE_H + TABS_H + CRUMB_H / 2;
    g.font = `400 14px ${SANS}`;
    g.textBaseline = "middle";
    g.textAlign = "left";

    // نمادهای مسیر: ‹ › و ·
    g.fillStyle = C.titleDim;
    g.fillText(editorFile.project, EDITOR_X + 20, cy);
    let x = EDITOR_X + 20 + g.measureText(editorFile.project).width;
    g.fillStyle = "#5a5a5a";
    g.fillText("›", x + 8, cy);
    x += 16;
    g.fillStyle = "#cccccc";
    g.fillText("developer.js", x + 6, cy);
    x += 6 + g.measureText("developer.js").width;
    g.fillStyle = "#5a5a5a";
    g.fillText("›", x + 8, cy);
    x += 16;
    g.fillStyle = "#cccccc";
    g.fillText("build", x + 6, cy);

    g.strokeStyle = C.border;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(EDITOR_X, TITLE_H + TABS_H + CRUMB_H - 0.5);
    g.lineTo(SCREEN_W, TITLE_H + TABS_H + CRUMB_H - 0.5);
    g.stroke();
  }

  /* ---------- نوار وضعیت ---------- */

  function drawStatusBar() {
    const y = SCREEN_H - STATUS_H;
    g.fillStyle = C.status;
    g.fillRect(0, y, SCREEN_W, STATUS_H);

    const cy = y + STATUS_H / 2 + 1;
    g.font = `400 14px ${SANS}`;
    g.textBaseline = "middle";
    g.textAlign = "left";

    // شاخهٔ گیت
    g.strokeStyle = C.statusFg;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(18, cy + 2, 4, 0, Math.PI * 2);
    g.moveTo(18, cy - 2);
    g.lineTo(18, cy - 9);
    g.moveTo(18, cy - 9);
    g.lineTo(27, cy - 9);
    g.stroke();
    g.beginPath();
    g.arc(27, cy - 9, 4, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = C.statusFg;
    g.fillText(editorFile.branch, 36, cy);

    // خطا و هشدار
    g.strokeStyle = C.statusFg;
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(112, cy + 1, 6.5, 0, Math.PI * 2);
    g.moveTo(109, cy + 4);
    g.lineTo(115, cy + 10);
    g.moveTo(115, cy + 4);
    g.lineTo(109, cy + 10);
    g.stroke();
    g.fillStyle = C.statusFg;
    g.fillText("0", 122, cy);
    g.fillText("0", 152, cy);

    // سمت راست
    g.textAlign = "right";
    g.fillStyle = C.statusFg;
    const right = `Ln 9, Col 18   Spaces: 2   UTF-8   LF   { }   ${editorFile.language}   Prettier`;
    g.fillText(right, SCREEN_W - 22, cy);
  }

  /* ---------- نقشه کوچک ---------- */

  function drawMinimap() {
    const mw = 96;
    const mx = SCREEN_W - mw - 18;
    let my = CODE_TOP + 4;

    g.save();
    for (const plan of LINE_PLANS) {
      if (!plan.toks.length) {
        my += 15;
        continue;
      }
      let px = mx;
      for (const tk of plan.toks) {
        const w = Math.max(3, Math.min(widthOf(tk.v) * 0.36, 70));
        g.globalAlpha = tk.t === "sp" ? 0.25 : 0.72;
        g.fillStyle = TOK[tk.t] || "#888";
        g.fillRect(px, my, w, 5);
        px += w + 3;
        if (px > mx + mw) break;
      }
      my += 15;
    }
    g.restore();

    // نوار پوشش بالای نقشه، مثل اسکرول‌بار
    g.fillStyle = "rgba(120,120,120,0.18)";
    g.fillRect(SCREEN_W - mw - 14, CODE_TOP, 12, EDITOR_H - 40);
    g.fillStyle = "rgba(120,120,120,0.4)";
    g.fillRect(SCREEN_W - mw - 14, CODE_TOP + 10, 12, 120);
  }

  /* ---------- تورفتگی و خط فعال ---------- */

  /** عمق تورفتگی هر خط، از روی فاصلهٔ اولین توکن غیرخالی. */
  function indentOf(line) {
    let lead = "";
    for (const tk of line) {
      if (tk.t === "sp") lead += tk.v;
      else break;
    }
    return (lead.match(/ {1,}/g) || []).reduce((n, m) => n + m.length, 0);
  }

  const INDENTS = codeLines.map(indentOf);

  function drawIndentGuides(activeIndex) {
    g.save();
    g.strokeStyle = C.indentGuide;
    g.lineWidth = 1;
    for (let i = 0; i < LINE_PLANS.length; i++) {
      const base = CODE_TOP + i * LINE_H - FONT_SIZE + 4;
      const depth = INDENTS[i];
      for (let d = 1; d <= depth; d++) {
        const x = CODE_X + d * INDENT - 12;
        // خط تورفتگی کنار خط فعال روشن‌تر است، مثل VS Code
        g.globalAlpha = i === activeIndex ? 1 : 0.5;
        g.beginPath();
        g.moveTo(x + 0.5, base);
        g.lineTo(x + 0.5, base + LINE_H);
        g.stroke();
      }
    }
    g.restore();
  }

  function drawActiveLine(activeIndex) {
    const y = CODE_TOP + activeIndex * LINE_H - FONT_SIZE + 4;
    g.fillStyle = C.activeLine;
    g.fillRect(EDITOR_X, y, EDITOR_W, LINE_H);
    // خط عمودی کنار شمارهٔ خط، مثل lineHighlightBorder
    g.fillStyle = "#282828";
    g.fillRect(EDITOR_X, y, 2, LINE_H);
  }

  /* ---------- کد ---------- */

  function drawCode(typed) {
    let activeLine = 0;
    for (let i = 0; i < LINE_PLANS.length; i++) {
      if (typed >= LINE_PLANS[i].start) activeLine = i;
    }

    drawActiveLine(activeLine);
    drawIndentGuides(activeLine);

    g.font = `${FONT_SIZE}px ${MONO}`;
    g.textBaseline = "alphabetic";

    for (let i = 0; i < LINE_PLANS.length; i++) {
      const plan = LINE_PLANS[i];
      const y = CODE_TOP + i * LINE_H + FONT_SIZE - 4;

      // شماره خط، راست‌چین در گودال
      g.font = `${FONT_SIZE}px ${MONO}`;
      g.fillStyle = i === activeLine ? C.lineNumActive : C.lineNum;
      g.textAlign = "right";
      g.fillText(String(i + 1), EDITOR_X + GUTTER_W - 22, y);
      g.textAlign = "left";

      if (!plan.toks.length) continue;

      const shown = clamp(typed - plan.start, 0, plan.len);
      let x = CODE_X;

      for (const tk of plan.toks) {
        const bright = clamp(shown - tk.start, 0, tk.len);
        if (bright > 0) {
          const head = tk.v.slice(0, bright);
          g.fillStyle = TOK[tk.t] || C.editorFg;
          g.fillText(head, x, y);
          x += widthOf(head);
        }
        const rest = tk.v.slice(bright);
        if (rest) {
          // متنِ هنوز تایپ‌نشده کم‌رنگ است، مثل انتخاب نوشتهٔ در حال تایپ
          g.fillStyle = "rgba(212,212,212,0.16)";
          g.fillText(rest, x, y);
          x += widthOf(rest);
        }
      }
    }
  }

  /* ---------- مکان‌نما ---------- */

  function caretPoint(typed) {
    let x = CODE_X;
    let y = CODE_TOP + FONT_SIZE - 4;
    for (let i = 0; i < LINE_PLANS.length; i++) {
      const plan = LINE_PLANS[i];
      const shown = clamp(typed - plan.start, 0, plan.len);
      y = CODE_TOP + i * LINE_H + FONT_SIZE - 4;
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
    g.fillRect(x, y - FONT_SIZE + 3, 2.5, FONT_SIZE + 4);
  }

  /* ---------- صفحه‌ی راه‌اندازی (splash) ---------- */

  const VSCODE_PATH = new Path2D(
    "M23.15 2.587 18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352Zm-5.146 14.861L10.826 12l7.178-5.448v10.896Z",
  );

  function drawSplash(boot) {
    g.fillStyle = "#181818";
    g.fillRect(0, 0, SCREEN_W, SCREEN_H);

    const cx = SCREEN_W / 2;
    const cy = SCREEN_H / 2 - 30;

    blob(g, cx, cy + 20, 280, "rgba(0,120,212,0.16)");

    const s = 5;
    g.save();
    g.translate(cx - (24 * s) / 2, cy - (24 * s) / 2);
    g.scale(s, s);
    g.fillStyle = "#0098ff";
    g.fill(VSCODE_PATH);
    g.restore();

    g.textAlign = "center";
    g.textBaseline = "alphabetic";
    g.font = `300 40px ${SANS}`;
    g.fillStyle = "#e7e7e7";
    g.fillText("Visual Studio Code", cx, cy + 140);

    g.font = `400 22px ${SANS}`;
    g.fillStyle = "#8a8a8a";
    g.fillText("Starting up...", cx, cy + 184);

    // نوار پیشرفت باریک وسط، مثل صفحهٔ راه‌اندازی واقعی
    const bw = 220;
    const bh = 3;
    const bx = cx - bw / 2;
    const by = cy + 216;
    g.fillStyle = "#2a2d2e";
    roundRect(g, bx, by, bw, bh, 2);
    g.fill();
    const fill = clamp(smoothstep(boot));
    if (fill > 0.02) {
      const grad = g.createLinearGradient(bx, 0, bx + bw, 0);
      grad.addColorStop(0, "#0098ff");
      grad.addColorStop(1, "#4d7cff");
      g.fillStyle = grad;
      roundRect(g, bx, by, Math.max(bh, bw * fill), bh, 2);
      g.fill();
    }

    g.textAlign = "left";
  }

  /* ---------- لایه‌های روی صفحه ---------- */
  function drawOverlay() {
    g.save();
    g.globalAlpha = 0.04;
    g.fillStyle = "#000";
    for (let y = 0; y < SCREEN_H; y += 4) g.fillRect(0, y, SCREEN_W, 1);
    g.restore();

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
    drawBreadcrumb();
    drawCode(typed);
    if (caret && typed > 0) drawCaret(typed);
    drawMinimap();
    drawStatusBar();
    g.restore();

    return true;
  }

  return { canvas, draw, drawSplash, drawOverlay };
}