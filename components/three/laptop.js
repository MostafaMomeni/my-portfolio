/**
 * صحنه‌ی سه‌بعدی لپ‌تاپ.
 *
 * کل انیمیشن از یک عدد ساده به اسم «پیشرفت» (۰ تا ۱) مشتق می‌شود که از
 * اسکرول کاربر می‌آید:
 *
 *   ۰.۰۰ → ۰.۱۳   لپ‌تاپ بسته است و متن معرفی روی صفحه
 *   ۰.۱۳ → ۰.۴۰   درِ لپ‌تاپ باز می‌شود
 *   ۰.۳۶ → ۰.۴۷   صفحه روشن می‌شود
 *   ۰.۴۲ → ۰.۵۸   صفحه‌ی راه‌اندازی VS Code محو می‌شود و ویرایشگر می‌آید
 *   ۰.۵۶ → ۰.۹۰   کد تایپ می‌شود
 *   ۰.۹۰ → ۱.۰۰   دوربین زوم می‌شود و صحنه محو می‌شود
 */

import * as THREE from "three";
import { createScreenRenderer, SCREEN_W, SCREEN_H } from "./vscodeScreen";
import { totalChars } from "../../data/code";

/* ---------- ابعاد لپ‌تاپ (واحد: جهانی) ---------- */

export const LAPTOP = {
  BASE_W: 3.3,
  BASE_D: 2.3,
  BASE_T: 0.14,
  LID_W: 3.12,
  LID_H: 2.02,
  LID_T: 0.105,
  BEZEL: 0.09,
  HINGE_Z: -1.04,
  OPEN_ANGLE: -1.92, // حدود ۱۱۰ درجه
};
LAPTOP.SCREEN_W = LAPTOP.LID_W - 2 * LAPTOP.BEZEL;
LAPTOP.SCREEN_H = LAPTOP.LID_H - 2 * LAPTOP.BEZEL;

/* ---------- نقاط کلیدی روایت ---------- */

const ACT = {
  lid: [0.13, 0.4],
  power: [0.36, 0.47],
  splash: [0.42, 0.58],
  type: [0.56, 0.9],
  blend: [0.34, 0.54],
  dolly: [0.9, 1.0],
  fade: [0.93, 1.0],
};

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const smooth = (t) => t * t * (3 - 2 * t);
const range = (p, [a, b]) => clamp((p - a) / (b - a));

/* ---------- شکل‌های کمکی ---------- */

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** یک صفحه‌ی تخت با گوشه‌های گرد؛ ضخامت روی محور Y و مرکز روی y=0. */
function roundedSlab(w, d, t, r, bevel = 0.01) {
  const geo = new THREE.ExtrudeGeometry(roundedRectShape(w, d, r), {
    depth: Math.max(0.001, t - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(0, -(bb.min.y + bb.max.y) / 2, 0);
  geo.computeVertexNormals();
  return geo;
}

/** بافت کیبورد و ترک‌پد روی سطح پایه. */
function makeKeyboardTexture() {
  const W = 1200;
  const H = 765;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");

  g.fillStyle = "#23252b";
  g.fillRect(0, 0, W, H);

  const pad = 26;
  const keyH = 54;
  const gap = 8;
  const rows = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.6], // ۱۴ کلید + بک‌اسپیس
    [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.7], // کپس‌لاک + ۱۲ کلید + اینتر
    [1.9, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.1], // شیفت + ۱۱ کلید + شیفت
    [2.3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.7], // کنترل + کلیدها + اسپیس + کلیدها
  ];

  let y = pad;
  for (const row of rows) {
    const units = row.reduce((a, b) => a + b, 0);
    const unit = (W - pad * 2 - gap * (row.length - 1)) / units;
    let x = pad;
    for (const u of row) {
      const kw = u * unit;
      g.fillStyle = "#141519";
      g.beginPath();
      g.roundRect(x, y, kw, keyH, 7);
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.05)";
      g.lineWidth = 1.5;
      g.stroke();
      x += kw + gap;
    }
    y += keyH + gap;
  }

  // ترک‌پد
  const tpW = W * 0.34;
  const tpH = H * 0.26;
  const tpX = (W - tpW) / 2;
  const tpY = H - tpH - 24;
  g.fillStyle = "#191b20";
  g.beginPath();
  g.roundRect(tpX, tpY, tpW, tpH, 12);
  g.fill();
  g.strokeStyle = "rgba(255,255,255,0.07)";
  g.lineWidth = 1.5;
  g.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** هاله‌ی نور پشت لپ‌تاپ. */
function makeHaloTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(256, 256, 0, 256, 256, 256);
  grad.addColorStop(0, "rgba(90,130,255,0.55)");
  grad.addColorStop(0.45, "rgba(80,90,220,0.2)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** سایه‌ی نرم زیر لپ‌تاپ. */
function makeShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(0,0,0,0.72)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.28)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** محیط نورانی برای بازتاب فلز — از یک equirect ساده. */
function makeEnvTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d");

  const sky = g.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, "#243063");
  sky.addColorStop(0.5, "#0c1128");
  sky.addColorStop(1, "#03040a");
  g.fillStyle = sky;
  g.fillRect(0, 0, 512, 256);

  const spot = (x, y, r, color) => {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 256);
  };
  spot(90, 62, 120, "rgba(130,170,255,0.75)");
  spot(330, 44, 100, "rgba(170,120,255,0.6)");
  spot(256, 210, 150, "rgba(50,80,160,0.3)");

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ---------- دوربین: مسیر کی‌فریم ---------- */

const SHOTS = [
  { p: 0.0, pos: [2.5, 4.3, 9.0], look: [2.0, 0.1, 0.0] },
  { p: 0.13, pos: [2.05, 3.7, 8.2], look: [1.62, 0.16, -0.05] },
  { p: 0.24, pos: [1.35, 2.85, 7.0], look: [0.92, 0.48, -0.45] },
  { p: 0.34, pos: [0.72, 1.9, 5.35], look: [0.2, 0.82, -0.85] },
];

function sampleShots(p, wide) {
  let a = SHOTS[0];
  let b = SHOTS[SHOTS.length - 1];
  for (let i = 0; i < SHOTS.length - 1; i++) {
    if (p >= SHOTS[i].p && p <= SHOTS[i + 1].p) {
      a = SHOTS[i];
      b = SHOTS[i + 1];
      break;
    }
  }
  const t = smooth(clamp((p - a.p) / (b.p - a.p || 1)));
  const lerp3 = (u, v) => u + (v - u) * t;

  // روی نمایشگرهای باریک، لپ‌تاپ به وسط کادر می‌آید و دوربین عقب‌تر می‌رود.
  const pull = 1 + (1 - wide) * 0.55;

  return {
    pos: new THREE.Vector3(
      lerp3(a.pos[0], b.pos[0]) * wide,
      lerp3(a.pos[1], b.pos[1]),
      lerp3(a.pos[2], b.pos[2]) * pull,
    ),
    look: new THREE.Vector3(
      lerp3(a.look[0], b.look[0]) * wide,
      lerp3(a.look[1], b.look[1]),
      lerp3(a.look[2], b.look[2]),
    ),
  };
}

/* ---------- ساخت صحنه ---------- */

/**
 * @param {HTMLCanvasElement} canvas
 * @returns {{
 *   setProgress:(p:number)=>void,
 *   setPointer:(x:number,y:number)=>void,
 *   setActive:(v:boolean)=>void,
 *   resize:()=>void,
 *   dispose:()=>void,
 * }}
 */
export function createLaptopScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x05060c, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  const disposables = [];
  const track = (x) => {
    disposables.push(x);
    return x;
  };

  /* ---------- محیط ---------- */
  scene.environment = track(makeEnvTexture());
  scene.environmentIntensity = 0.85;

  /* ---------- هاله و سایه ---------- */
  const halo = new THREE.Mesh(
    track(new THREE.PlaneGeometry(18, 12)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(makeHaloTexture()),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    ),
  );
  halo.position.set(0.2, 1.1, -5.5);
  scene.add(halo);

  const shadow = new THREE.Mesh(
    track(new THREE.PlaneGeometry(5.4, 3.6)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(makeShadowTexture()),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.72;
  scene.add(shadow);

  /* ---------- نورپردازی ---------- */
  scene.add(new THREE.AmbientLight(0x3a4a72, 0.7));

  const key = new THREE.DirectionalLight(0xcfdcff, 1.5);
  key.position.set(3.4, 5, 4.2);
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x8b5cf6, 0.85);
  rim.position.set(-4.5, 2.4, -3.2);
  scene.add(rim);

  const fill = new THREE.PointLight(0x22d3ee, 6, 9, 2);
  fill.position.set(-2.6, 0.5, 2.4);
  scene.add(fill);

  // نوری که از صفحه‌ی روشن لپ‌تاپ روی بدنه و کیبورد می‌افتد
  const screenLight = new THREE.PointLight(0x7aa2ff, 0, 5, 2);
  scene.add(screenLight);

  /* ---------- لپ‌تاپ ---------- */
  const laptop = new THREE.Group();
  scene.add(laptop);

  const alu = track(
    new THREE.MeshStandardMaterial({
      color: 0x767d8d,
      metalness: 0.92,
      roughness: 0.32,
    }),
  );
  const dark = track(
    new THREE.MeshStandardMaterial({
      color: 0x0a0c12,
      metalness: 0.45,
      roughness: 0.55,
    }),
  );

  const { BASE_W, BASE_D, BASE_T, LID_W, LID_H, LID_T } = LAPTOP;

  // پایه
  const base = new THREE.Mesh(
    track(roundedSlab(BASE_W, BASE_D, BASE_T, 0.16, 0.012)),
    alu,
  );
  base.position.y = BASE_T / 2;
  laptop.add(base);

  // کیبورد + ترک‌پد
  const kbTex = track(makeKeyboardTexture());
  const kbW = BASE_W - 0.3;
  const kbD = BASE_D - 0.4;
  const keyboard = new THREE.Mesh(
    track(new THREE.PlaneGeometry(kbW, kbD)),
    track(
      new THREE.MeshStandardMaterial({
        map: kbTex,
        roughness: 0.62,
        metalness: 0.18,
      }),
    ),
  );
  keyboard.rotation.x = -Math.PI / 2;
  keyboard.position.set(0, BASE_T / 2 + 0.002, 0.06);
  laptop.add(keyboard);

  // لولا
  const hinge = new THREE.Mesh(
    track(new THREE.CylinderGeometry(0.045, 0.045, BASE_W - 0.5, 20)),
    dark,
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, BASE_T / 2 + 0.02, LAPTOP.HINGE_Z);
  laptop.add(hinge);

  // درِ لپ‌تاپ
  const lidPivot = new THREE.Group();
  lidPivot.position.set(0, BASE_T / 2 + 0.012, LAPTOP.HINGE_Z);
  laptop.add(lidPivot);

  const lid = new THREE.Mesh(
    track(roundedSlab(LID_W, LID_H, LID_T, 0.14, 0.01)),
    alu,
  );
  lid.position.set(0, LID_T / 2, LID_H / 2);
  lidPivot.add(lid);

  // قاب مشکی دور صفحه
  const bezel = new THREE.Mesh(
    track(roundedSlab(LID_W - 0.02, LID_H - 0.02, 0.012, 0.12, 0.005)),
    dark,
  );
  bezel.position.set(0, -0.008, LID_H / 2);
  lidPivot.add(bezel);

  // صفحه — بافت از canvas ویرایشگر
  const screenRenderer = createScreenRenderer();
  const screenTex = track(
    new THREE.CanvasTexture(screenRenderer.canvas),
  );
  screenTex.colorSpace = THREE.SRGBColorSpace;
  screenTex.minFilter = THREE.LinearFilter;
  screenTex.magFilter = THREE.LinearFilter;
  screenTex.generateMipmaps = false;
  screenTex.anisotropy = Math.min(
    8,
    renderer.capabilities.getMaxAnisotropy(),
  );

  const screen = new THREE.Mesh(
    track(new THREE.PlaneGeometry(LAPTOP.SCREEN_W, LAPTOP.SCREEN_H)),
    track(
      new THREE.MeshBasicMaterial({
        map: screenTex,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    ),
  );
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.017, LID_H / 2);
  lidPivot.add(screen);

  // دوربین لپ‌تاپ روی قاب بالا
  const cam = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.018, 12, 12)),
    track(new THREE.MeshStandardMaterial({ color: 0x1b2230, roughness: 0.3 })),
  );
  cam.position.set(0, -0.016, LID_H - 0.045);
  lidPivot.add(cam);

  /* ---------- حالت ---------- */

  let targetProgress = 0;
  let progress = 0;
  let active = true;
  const pointer = new THREE.Vector2();
  const pointerSmooth = new THREE.Vector2();
  const screenCenter = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const camLook = new THREE.Vector3();
  const dir = new THREE.Vector3(0, 0.22, 1).normalize();
  let frame = 0;
  let running = true;

  function resize() {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 720 ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function update() {
    frame++;

    // نرم کردن اسکرول تا حرکت دوربین ناگهانی نباشد
    progress += (targetProgress - progress) * 0.14;
    const p = progress;

    pointerSmooth.x += (pointer.x - pointerSmooth.x) * 0.06;
    pointerSmooth.y += (pointer.y - pointerSmooth.y) * 0.06;

    /* درِ لپ‌تاپ */
    const lidT = range(p, ACT.lid);
    let lidOpen = smooth(lidT);
    lidOpen += 0.035 * Math.sin(lidT * Math.PI * 3) * (1 - lidT);
    lidPivot.rotation.x = LAPTOP.OPEN_ANGLE * clamp(lidOpen);

    /* صفحه */
    const power = smooth(range(p, ACT.power));
    const boot = 1 - smooth(range(p, ACT.splash));
    const typed = Math.round(clamp(range(p, ACT.type)) * totalChars);

    // CanvasTexture خودش تغییر بافت را تشخیص نمی‌دهد؛ هر بار که بوم دوباره
    // رسم شد باید صریحاً برای ارسال دوباره به GPU علامت‌گذاری شود.
    const redrew = screenRenderer.draw({
      typed,
      power,
      boot,
      caret: Math.floor(frame / 33) % 2 === 0,
    });
    if (redrew) screenTex.needsUpdate = true;

    /* دوربین */
    const aspect = camera.aspect;
    const wide = clamp((aspect - 0.95) / 0.55);
    const shot = sampleShots(Math.min(p, SHOTS[SHOTS.length - 1].p), wide);
    camPos.copy(shot.pos);
    camLook.copy(shot.look);

    screen.getWorldPosition(screenCenter);

    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    const dW = (LAPTOP.SCREEN_W / 2 * 1.06) / (tanHalf * aspect);
    const dH = (LAPTOP.SCREEN_H / 2 * 1.08) / tanHalf;
    const dType = Math.max(dW, dH);
    const dFill = Math.min(dW, dH);

    // از اینجا به بعد دوربین قاب صفحه را کاملاً پر می‌کند
    const blend = smooth(range(p, ACT.blend));
    const dollyT = smooth(range(p, ACT.dolly));
    const dist = dType + (dFill - dType) * dollyT;

    const framedPos = screenCenter.clone().addScaledVector(dir, dist);
    camPos.lerp(framedPos, blend);
    camLook.lerp(screenCenter, blend);

    // کمی پارالاکس با حرکت اشاره‌گر
    camPos.x += pointerSmooth.x * 0.18;
    camPos.y += pointerSmooth.y * 0.12;

    // تنفس آرام صحنه
    const t = frame / 60;
    laptop.rotation.y = Math.sin(t * 0.33) * 0.022 + pointerSmooth.x * 0.05;
    laptop.position.y = Math.sin(t * 0.62) * 0.016;

    camera.position.copy(camPos);
    camera.lookAt(camLook);

    /* نور صفحه */
    const glow = power * (0.35 + 0.65 * (1 - boot)) * 9;
    screenLight.position.copy(screenCenter).addScaledVector(dir, 0.85);
    screenLight.intensity = glow;
    halo.material.opacity = 0.25 + 0.75 * blend;

    /* محو شدن در انتها */
    canvas.style.opacity = String(1 - smooth(range(p, ACT.fade)));

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    if (active) update();
    frameId = requestAnimationFrame(loop);
  }

  let frameId = 0;

  resize();
  loop();

  return {
    setProgress(v) {
      targetProgress = clamp(v);
    },
    setPointer(x, y) {
      pointer.set(clamp(x, -1, 1), clamp(y, -1, 1));
    },
    setActive(v) {
      active = v;
    },
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      disposables.forEach((d) => d.dispose?.());
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const m = o.material;
        if (Array.isArray(m)) m.forEach((x) => x.dispose?.());
        else m?.dispose?.();
      });
      renderer.dispose();
    },
  };
}

export { SCREEN_W, SCREEN_H };