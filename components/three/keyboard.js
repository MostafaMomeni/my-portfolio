/**
 * بافت کیبورد و ترک‌پد لپ‌تاپ.
 *
 * چیدمان کلیدها مثل کیبورد واقعی لپ‌تاپ است: ردیف تابع، ردیف اعداد با
 * علامت‌ها، چیدمان QWERTY، کلیدهای ترکیبی، کلید فاصلهٔ عریض و بلوک
 * کلیدهای جهت‌نما به‌همراه نوشتهٔ روی کلیدها.
 */

import * as THREE from "three";

const FONT = '"Segoe UI", Tahoma, sans-serif';

/* چیدمان واقعی؛ هر عدد «واحد» عرض کلید است. */
const ROWS = [
  // ردیف تابع
  [
    ["esc", 1], ["F1", 1], ["F2", 1], ["F3", 1], ["F4", 1], ["", 0.5],
    ["F5", 1], ["F6", 1], ["F7", 1], ["F8", 1], ["", 0.5],
    ["F9", 1], ["F10", 1], ["F11", 1], ["F12", 1], ["⏻", 1],
  ],
  // ردیف اعداد
  [
    ["~\n`", 1], ["!\n1", 1], ["@\n2", 1], ["#\n3", 1], ["$\n4", 1], ["%\n5", 1],
    ["^\n6", 1], ["&\n7", 1], ["*\n8", 1], ["(\n9", 1], [")\n0", 1],
    ["_\n-", 1], ["+\n=", 1], ["⌫", 2],
  ],
  // ردیف Q
  [
    ["Tab", 1.5], ["Q", 1], ["W", 1], ["E", 1], ["R", 1], ["T", 1], ["Y", 1],
    ["U", 1], ["I", 1], ["O", 1], ["P", 1], ["{\n[", 1], ["}\n]", 1], ["|\n\\", 1.5],
  ],
  // ردیف A
  [
    ["Caps", 1.75], ["A", 1], ["S", 1], ["D", 1], ["F", 1], ["G", 1], ["H", 1],
    ["J", 1], ["K", 1], ["L", 1], [":\n;", 1], ["\"\n'", 1], ["Enter", 2.25],
  ],
  // ردیف Z
  [
    ["Shift", 2.25], ["Z", 1], ["X", 1], ["C", 1], ["V", 1], ["B", 1], ["N", 1],
    ["M", 1], ["<\n,", 1], [">\n.", 1], ["?\n/", 1], ["Shift", 2.75],
  ],
];

/* ردیف پایین: کنترل‌ها + فاصله + بلوک جهت‌نما */
const BOTTOM_LEFT = [
  ["Ctrl", 1.3], ["Fn", 1], ["Win", 1.2], ["Alt", 1.3],
  ["", 5.6],
  ["Alt", 1.3], ["Win", 1.2], ["Menu", 1.2], ["Ctrl", 1.3],
];

/**
 * @param {number} w پهنای بوم
 * @param {number} h ارتفاع بوم
 */
export function makeKeyboardTexture(w = 1800, h = 1150) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");

  // بدنه‌ی آلومینیومی اطراف کیبورد
  const body = g.createLinearGradient(0, 0, 0, h);
  body.addColorStop(0, "#8a91a3");
  body.addColorStop(0.5, "#6e7484");
  body.addColorStop(1, "#565c6b");
  g.fillStyle = body;
  g.fillRect(0, 0, w, h);

  const PAD_X = w * 0.035;
  const GRILLE_H = h * 0.052;
  const PAD_TOP = GRILLE_H + h * 0.018;
  const UNIT = (w - PAD_X * 2) / 15; // عرض یک کلید معمولی
  const GAP = Math.max(4, UNIT * 0.06);
  const KEY_H = UNIT * 0.92;
  const ROW_GAP = GAP;

  /* بلندگوهای بالای کیبورد */
  {
    const gy = h * 0.016;
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.roundRect(PAD_X, gy, w - PAD_X * 2, GRILLE_H, 6);
    g.fill();
    const dot = GRILLE_H / 9;
    g.fillStyle = "rgba(0,0,0,0.55)";
    for (let y = gy + dot; y < gy + GRILLE_H - dot * 0.4; y += dot) {
      for (let x = PAD_X + dot; x < w - PAD_X - dot * 0.4; x += dot) {
        g.beginPath();
        g.arc(x, y, dot * 0.26, 0, Math.PI * 2);
        g.fill();
      }
    }
  }

  /** یک کلید با نوشته. */
  const key = (x, y, kw, kh, label, opts = {}) => {
    const r = Math.min(7, kh * 0.22);
    // سایه‌ی فرورفتگی
    g.fillStyle = "rgba(0,0,0,0.62)";
    g.beginPath();
    g.roundRect(x, y + 2, kw, kh, r);
    g.fill();

    // سطح کلید
    const top = opts.top || "#3a3f4c";
    const bot = opts.bottom || "#22252d";
    const grad = g.createLinearGradient(x, y, x, y + kh);
    grad.addColorStop(0, top);
    grad.addColorStop(1, bot);
    g.fillStyle = grad;
    g.beginPath();
    g.roundRect(x, y, kw, kh, r);
    g.fill();

    // لبه‌ی بالایی روشن
    g.strokeStyle = "rgba(255,255,255,0.22)";
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(x + r * 0.6, y + 1.2);
    g.lineTo(x + kw - r * 0.6, y + 1.2);
    g.stroke();

    if (!label) return;

    // نوشته — کلیدهای دوحرفی از بالا به پایین
    const lines = label.split("\n");
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillStyle = opts.bold ? "#eef1f7" : "#c3c9d6";
    g.font = `${opts.bold ? 700 : 600} ${Math.round(kh * (lines.length > 1 ? 0.3 : 0.38))}px ${FONT}`;

    if (lines.length > 1) {
      lines.forEach((ln, i) => {
        const yOff = (i - (lines.length - 1) / 2) * kh * 0.36;
        g.fillText(ln, x + kw / 2, y + kh / 2 + yOff);
      });
    } else {
      const isIcon = /[⌫⏻↑↓←→]/.test(label);
      g.font = `${opts.bold ? 700 : 600} ${Math.round(kh * (isIcon ? 0.5 : 0.4))}px ${FONT}`;
      g.fillText(label, x + kw / 2, y + kh / 2 + 1);
    }
  };

  /** یک ردیف کامل را می‌چیند. */
  const row = (items, y, startX = PAD_X) => {
    let x = startX;
    for (const [label, units] of items) {
      if (units === 0) {
        x += UNIT * 0.5;
        continue;
      }
      const kw = UNIT * units - GAP;
      key(x, y, kw, KEY_H, label, { bold: units >= 1.7 });
      x += UNIT * units;
    }
  };

  let y = PAD_TOP;
  for (const items of ROWS) {
    row(items, y);
    y += KEY_H + ROW_GAP;
  }
  y += KEY_H * 0.22;

  // ردیف پایین با جهت‌نماها در سمت راست
  const arrowW = UNIT * 1;
  const clusterW = arrowW * 3 + GAP * 2;
  const spaceUnits = 5.6;
  const bottomTotal = BOTTOM_LEFT.reduce((s, [, u]) => s + u, 0);
  const freeUnits = 15 - bottomTotal - 3 - 0.6;
  const space = BOTTOM_LEFT[4];
  space[1] = Math.max(3, freeUnits);

  let bx = PAD_X;
  for (const [label, units] of BOTTOM_LEFT) {
    if (units === 0) continue;
    const kw = UNIT * units - GAP;
    key(bx, y, kw, KEY_H, label, { bold: units >= 5 });
    bx += UNIT * units;
  }

  // بلوک جهت‌نما: بالا وسط، پایین چپ/پایین/راست
  const ax = w - PAD_X - clusterW;
  key(ax + arrowW + GAP, y - KEY_H - ROW_GAP, arrowW, KEY_H, "↑");
  key(ax, y, arrowW, KEY_H, "←");
  key(ax + arrowW + GAP, y, arrowW, KEY_H, "↓");
  key(ax + (arrowW + GAP) * 2, y, arrowW, KEY_H, "→");

  // ترک‌پد
  const tpTop = y + KEY_H + KEY_H * 0.5;
  const tpH = h - tpTop - h * 0.07;
  const tpW = w * 0.3;
  const tpX = (w - tpW) / 2;

  g.fillStyle = "rgba(0,0,0,0.42)";
  g.beginPath();
  g.roundRect(tpX, tpTop, tpW, tpH, 10);
  g.fill();

  const tpGrad = g.createLinearGradient(0, tpTop, 0, tpTop + tpH);
  tpGrad.addColorStop(0, "#6d7484");
  tpGrad.addColorStop(1, "#5a606f");
  g.fillStyle = tpGrad;
  g.beginPath();
  g.roundRect(tpX + 2, tpTop + 2, tpW - 4, tpH - 4, 9);
  g.fill();

  g.strokeStyle = "rgba(255,255,255,0.14)";
  g.lineWidth = 1.4;
  g.beginPath();
  g.roundRect(tpX + 2.5, tpTop + 2.5, tpW - 5, tpH - 5, 9);
  g.stroke();

  // نوارهای اسکرول لبه‌ی ترک‌پد
  g.fillStyle = "rgba(0,0,0,0.18)";
  g.fillRect(tpX + tpW * 0.44, tpTop + 6, 1.5, 22);
  g.fillRect(tpX + tpW * 0.55, tpTop + 6, 1.5, 22);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}