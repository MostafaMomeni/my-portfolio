/**
 * خط زمانی و چیدمان محیط ویندوز داخل صفحه‌ی لپ‌تاپ.
 *
 * همه‌چیز از یک عدد «پیشرفت» (۰ تا ۱) مشتق می‌شود. این فایل هم زمان‌بندی
 * را نگه می‌دارد و هم مختصات عناصر محیط دسکتاپ را، تا هم رندر صفحه و هم
 * مدل سه‌بعدی موس دقیقاً روی همان نقاط بنشینند.
 */

/** فضای طراحی صفحه (هم‌اندازه‌ی بوم رندر). */
export const SW = 1600;
export const SH = 1000;

/* ---------- نقاط زمانی روایت ---------- */

export const T = {
  lid: [0.0, 0.055],
  power: [0.05, 0.08],
  desktop: [0.075, 0.11],
  vscodeOpen: [0.11, 0.15],
  vscodeBoot: [0.124, 0.166],
  typing: [0.158, 0.31],
  vscodeShut: [0.31, 0.342],
  cursorIn: [0.34, 0.362],
  toComputer: [0.362, 0.402],
  ctxMenu: [0.4, 0.42],
  manageHover: [0.42, 0.452],
  manageClick: [0.452, 0.472],
  aboutOpen: [0.472, 0.516],
  aboutReveal: [0.508, 0.64],
  aboutShut: [0.636, 0.668],
  toProjects: [0.668, 0.71],
  projClick: [0.71, 0.728],
  projOpen: [0.728, 0.772],
  carousel: [0.772, 0.96],
  fade: [0.962, 1.0],
};

/* ---------- چیدمان دسکتاپ ---------- */

export const LAYOUT = {
  /** آیکون‌های دسکتاپ — ستون چپ، مثل ویندوز واقعی. */
  icons: {
    computer: { x: 88, y: 104, label: "My Computer", icon: "computer" },
    recycle: { x: 88, y: 226, label: "Recycle Bin", icon: "recycle" },
    projects: { x: 88, y: 348, label: "Projects", icon: "projects" },
  },

  /** منوی راست‌کلیک روی My Computer. */
  menu: {
    x: 156,
    y: 150,
    w: 250,
    itemH: 48,
    padTop: 10,
    items: [
      { label: "Open", icon: "open" },
      { label: "Manage", icon: "manage" },
      { label: "Pin to Start", icon: "pin" },
      { sep: true },
      { label: "Properties", icon: "props" },
      { label: "Delete", icon: "delete" },
      { label: "Rename", icon: "rename" },
    ],
  },

  /** پنجره‌ها. */
  windows: {
    vscode: { x: 96, y: 46, w: 1408, h: 872, title: "Visual Studio Code" },
    about: { x: 150, y: 32, w: 1300, h: 906, title: "System — About" },
    projects: { x: 78, y: 40, w: 1444, h: 884, title: "Projects — Portfolio" },
  },

  /** نوار وظیفه. */
  taskbar: { h: 56, startX: 700, iconGap: 62 },
};

/** مختصات پنجره‌ها بعد از کوچک/بزرگ شدن هنگام باز و بسته شدن. */
export function windowRect(box, open, { scale = 0.94, from = "bottom" } = {}) {
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const w = box.w * (1 - (1 - open) * (1 - scale));
  const h = box.h * (1 - (1 - open) * (1 - scale));
  let y = cy - h / 2;
  if (from === "bottom") y = cy - h / 2 + (1 - open) * box.h * 0.18;
  return { x: cx - w / 2, y, w, h };
}

/** ارتفاع نوار عنوان پنجره‌ها (باید با winFrame هماهنگ باشد). */
export const TITLEBAR_H = 54;

/**
 * چیدمان داخلی برنامه‌ی پروژه‌ها.
 *
 * هم رندرکننده و هم تستِ کلیک از همین تابع استفاده می‌کنند تا دکمهٔ
 * «مشاهدهٔ سایت» هیچ‌وقت از جای خود جابه‌جا نشود.
 */
export function projectsGeometry() {
  const r = LAYOUT.windows.projects;
  const top = r.y + TITLEBAR_H;
  const pad = 22;
  const cx = r.x + pad;
  const cy = top + pad;
  const cw = r.w - pad * 2;
  const ch = r.y + r.h - cy - pad;

  const prevW = Math.round(cw * 0.63);
  const gap = 22;
  const pagerH = 56;

  const infoX = cx + prevW + gap + 8;
  const infoY = cy + 10;
  const infoW = cw - prevW - gap;
  const infoH = ch - pagerH - 16 - 10;

  const bw = 196;
  const bh = 50;
  return {
    r,
    top,
    cx,
    cy,
    cw,
    ch,
    prevW,
    gap,
    pagerH,
    stageX: cx + 8,
    stageY: cy + 8,
    stageH: ch - pagerH - 16,
    infoX,
    infoY,
    infoW,
    infoH,
    viewBtn: {
      x: infoX + infoW - bw,
      y: infoY + infoH - bh - 6,
      w: bw,
      h: bh,
    },
  };
}

/* ---------- ابزارها ---------- */

export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const smooth = (t) => t * t * (3 - 2 * t);
/** بازه‌ی ۰ تا ۱ بین دو نقطه‌ی زمانی. */
export const seg = (p, [a, b]) => clamp((p - a) / (b - a));

/**
 * شیب کلیک فقط داخل بازه‌اش معتبر است و بیرون از آن صفر می‌شود.
 * بدون این محدودیت، مقدار کلیک برای همیشه ۱ می‌ماند و چون بیشینه گرفته
 * می‌شود، انیمیشن کلیک بقیهٔ لحظه‌ها را از کار می‌اندازد.
 */
export const clickPulse = (p, range) => {
  const t = seg(p, range);
  return t > 0 && t < 1 ? t : 0;
};

/**
 * کل حالت صفحه را از پیشرفت اسکرول می‌سازد.
 * @param {number} p پیشرفت ۰ تا ۱
 * @param {number} projectCount تعداد پروژه‌ها برای اسلایدر
 */
export function computeState(p, projectCount = 1) {
  const s = {};
  s.progress = p;

  s.power = smooth(seg(p, T.power));
  s.desktop = smooth(seg(p, T.desktop));

  // پنجره‌ی VS Code
  s.vscode = {
    open: smooth(seg(p, T.vscodeOpen)),
    boot: 1 - smooth(seg(p, T.vscodeBoot)),
    typed: seg(p, T.typing),
    shut: smooth(seg(p, T.vscodeShut)),
  };
  // وقتی در حال بسته شدن است، پنجره جمع می‌شود
  s.vscode.open = s.vscode.open * (1 - s.vscode.shut);

  // منو بعد از کلیک روی Manage بسته می‌شود
  const menuClose = seg(p, [T.manageClick[1], T.aboutOpen[0]]);
  s.menu = {
    open: smooth(seg(p, T.ctxMenu)) * (1 - smooth(menuClose)),
    hover: smooth(seg(p, T.manageHover)) * (1 - smooth(menuClose)),
    click: seg(p, T.manageClick),
  };

  s.about = {
    open: smooth(seg(p, T.aboutOpen)) * (1 - smooth(seg(p, T.aboutShut))),
    reveal: smooth(seg(p, T.aboutReveal)),
    shut: smooth(seg(p, T.aboutShut)),
  };

  const open = smooth(seg(p, T.projOpen)) * (1 - smooth(seg(p, T.fade)));
  const slide = seg(p, T.carousel);
  s.projects = {
    open,
    pos: slide * Math.max(0, projectCount - 1),
    index: Math.round(slide * Math.max(0, projectCount - 1)),
  };

  /* مسیر موس — موقعیت آن در فضای ۱۶۰۰×۱۰۰۰ صفحه */
  const ic = LAYOUT.icons.computer;
  const ip = LAYOUT.icons.projects;

  let cx = SW / 2;
  let cy = SH / 2;
  let appear = 1;

  const menuItems = LAYOUT.menu.items;
  let y = LAYOUT.menu.y + LAYOUT.menu.padTop;
  let manageY = 0;
  for (const it of menuItems) {
    if (it.sep) {
      y += 12;
      continue;
    }
    if (it.label === "Manage") manageY = y + LAYOUT.menu.itemH / 2;
    y += LAYOUT.menu.itemH;
  }
  const manageX = LAYOUT.menu.x + 120;

  const stages = [
    { at: T.cursorIn, from: [SW / 2, SH / 2] },
    { at: T.toComputer, from: [ic.x, ic.y + 10] },
    { at: T.manageHover, from: [manageX, manageY] },
    { at: T.aboutOpen, from: [manageX, manageY] },
    { at: T.aboutShut, from: [manageX, manageY] },
    { at: T.toProjects, from: [ip.x, ip.y + 10] },
  ];

  // آخرین مرحله‌ای که شروع شده، مبنای درون‌یابی است.
  // نباید با رسیدن به یک مرحله حلقه را متوقف کنیم، وگرنه نشانگر
  // همان‌جا می‌ماند و هرگز به آیکون پروژه‌ها نمی‌رسد.
  let cur = stages[0].from;
  for (let i = 1; i < stages.length; i++) {
    const t = smooth(seg(p, stages[i].at));
    if (t <= 0) continue;
    const a = stages[i - 1].from;
    const b = stages[i].from;
    cur = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }
  // بعد از باز شدن پنجره‌ی پروژه، موس روی دکمهٔ «مشاهدهٔ سایت» می‌نشیند
  const geo = projectsGeometry();
  const btn = geo.viewBtn;
  const preview = [
    geo.stageX + geo.prevW * 0.5,
    geo.stageY + geo.stageH * 0.5,
  ];
  const btnPoint = [btn.x + btn.w / 2, btn.y + btn.h / 2];

  // پیش از باز شدن پروژه‌ها، موس روی پیش‌نمایش می‌ماند و بعد روی دکمه می‌رود
  const toBtn = smooth(seg(p, [T.projOpen[1], T.carousel[0] + 0.02]));
  const anchor = [
    preview[0] + (btnPoint[0] - preview[0]) * toBtn,
    preview[1] + (btnPoint[1] - preview[1]) * toBtn,
  ];
  const toPreview = smooth(seg(p, T.projOpen));
  cx = cur[0] + (anchor[0] - cur[0]) * toPreview;
  cy = cur[1] + (anchor[1] - cur[1]) * toPreview;

  appear = smooth(seg(p, T.cursorIn));

  s.cursor = {
    x: cx,
    y: cy,
    appear,
    // شیب‌های کلیک — فقط داخل بازهٔ خودشان
    clickComputer: clickPulse(p, T.ctxMenu),
    clickManage: clickPulse(p, T.manageClick),
    clickProjects: clickPulse(p, T.projClick),
  };

  s.fade = smooth(seg(p, T.fade));
  return s;
}