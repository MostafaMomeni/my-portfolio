/**
 * نشانگر موس و اثر کلیک روی صفحه‌ی لپ‌تاپ.
 *
 * این‌ها به‌صورت بافت روی دو صفحه‌ی کوچکِ سه‌بعدی سوار می‌شوند که کمی
 * جلوتر از صفحه‌ی لپ‌تاپ قرار می‌گیرند تا مثل موس واقعی روی تصویر بیفتند.
 */

import * as THREE from "three";

/** پیکان کلاسیک ویندوز با حاشیه‌ی تیره و سایه. */
export function makeCursorTexture(size = 128) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = Math.round(size * 1.3);
  const g = c.getContext("2d");
  const s = size / 64;

  const path = new Path2D(
    "M3 2 L3 60 L17 47 L27 70 L38 64 L28 43 L45 43 Z",
  );

  // سایه
  g.save();
  g.translate(2.5 * s, 3 * s);
  g.fillStyle = "rgba(0,0,0,0.35)";
  g.fill(path);
  g.restore();

  // بدنه
  g.fillStyle = "#ffffff";
  g.fill(path);
  g.strokeStyle = "#15151a";
  g.lineWidth = 2.1 * s;
  g.lineJoin = "round";
  g.stroke(path);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return { texture: tex, aspect: c.width / c.height };
}

/** حلقه‌ی کلیک. */
export function makeClickTexture(size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const r = size / 2;

  const grad = g.createRadialGradient(r, r, r * 0.25, r, r, r);
  grad.addColorStop(0, "rgba(255,255,255,0)");
  grad.addColorStop(0.6, "rgba(140,190,255,0.55)");
  grad.addColorStop(0.85, "rgba(120,170,255,0.35)");
  grad.addColorStop(1, "rgba(120,170,255,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(r, r, r, 0, Math.PI * 2);
  g.fill();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}