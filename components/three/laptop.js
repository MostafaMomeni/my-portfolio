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
import { createDesktopRenderer } from "./desktop";
import { makeKeyboardTexture } from "./keyboard";
import { makeCursorTexture, makeClickTexture } from "./cursor";
import { quadToMatrix3d } from "./homography";
import { projects } from "../../data/site";
import { SW, SH, T, computeState, clamp, smooth, seg } from "./timeline";

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

/** بازه‌هایی که فقط به دوربین مربوط‌اند؛ بقیه در timeline.js است. */
const CAM = {
  blend: [0.045, 0.085],
  dolly: [0.955, 1.0],
};

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
  { p: 0.025, pos: [2.0, 3.5, 7.6], look: [1.5, 0.35, -0.25] },
  { p: 0.05, pos: [1.25, 2.5, 6.1], look: [0.6, 0.9, -0.9] },
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

  // نور بالای صفحه‌کلید تا کلیدها و ترک‌پد واضح دیده شوند
  const deckLight = new THREE.PointLight(0xdce8ff, 5.5, 5.5, 2);
  deckLight.position.set(0.6, 1.5, 1.1);
  scene.add(deckLight);

  // نوری که از صفحه‌ی روشن لپ‌تاپ روی بدنه و کیبورد می‌افتد
  const screenLight = new THREE.PointLight(0x7aa2ff, 0, 5, 2);
  scene.add(screenLight);

  /* ---------- لپ‌تاپ ---------- */
  const laptop = new THREE.Group();
  scene.add(laptop);

  const alu = track(
    new THREE.MeshStandardMaterial({
      color: 0x9aa2b2,
      metalness: 0.78,
      roughness: 0.34,
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
        roughness: 0.48,
        metalness: 0.1,
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

  // درگاه‌های کناری — دو مستطیل تیره روی لبه‌های پایه
  const portGeo = track(new THREE.PlaneGeometry(0.16, 0.045));
  const portMat = track(
    new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.8 }),
  );
  for (const [side, z, depth] of [
    [-1, 0.42, 0],
    [-1, 0.18, 0],
    [1, 0.3, 0],
  ]) {
    const port = new THREE.Mesh(portGeo, portMat);
    port.rotation.y = (side * Math.PI) / 2;
    port.position.set(
      side * (BASE_W / 2 + 0.001),
      BASE_T / 2,
      z,
    );
    laptop.add(port);
  }

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

  // صفحه — بافت از بوم دسکتاپ ویندوز
  const desktop = createDesktopRenderer();
  const screenTex = track(new THREE.CanvasTexture(desktop.canvas));
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

  /* ---------- نشانگر موس روی صفحه ---------- */

  const CUR_H = 0.2; // ارتفاع نشانگر در جهان
  const cursorArt = track(makeCursorTexture());
  const cursor = new THREE.Mesh(
    track(new THREE.PlaneGeometry(CUR_H * cursorArt.aspect, CUR_H)),
    track(
      new THREE.MeshBasicMaterial({
        map: cursorArt.texture,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
  );
  cursor.rotation.x = Math.PI / 2;
  cursor.position.set(0, -0.031, 0);
  cursor.renderOrder = 2;
  lidPivot.add(cursor);

  const RIPPLE = 0.42;
  const ripple = new THREE.Mesh(
    track(new THREE.PlaneGeometry(RIPPLE, RIPPLE)),
    track(
      new THREE.MeshBasicMaterial({
        map: track(makeClickTexture()),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    ),
  );
  ripple.rotation.x = Math.PI / 2;
  ripple.position.set(0, -0.033, 0);
  ripple.renderOrder = 1;
  ripple.visible = false;
  lidPivot.add(ripple);

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
  let lastState = null;

  // قلاب‌های اختیاری برای پیش‌نمایش زندهٔ پروژه‌ها
  let onScreenTap = null;
  let onLiveTransform = null;

  /* ---------- کلیک روی صفحه ---------- */

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  /** مختصات کلیک را به فضای ۱۶۰۰×۱۰۰۰ صفحه تبدیل می‌کند. */
  function screenPointFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(screen, false);
    if (!hits.length || !hits[0].uv) return null;
    return {
      x: hits[0].uv.x * SW,
      y: (1 - hits[0].uv.y) * SH,
    };
  }

  function handlePointerDown(e) {
    if (!onScreenTap || !lastState) return;
    if (lastState.projects.open < 0.6) return;
    const pt = screenPointFromEvent(e);
    if (pt) onScreenTap(pt, lastState);
  }
  canvas.addEventListener("pointerdown", handlePointerDown);

  /* ---------- ماتریس نمایش زنده ---------- */

  const _q = new THREE.Vector3();

  /**
   * چهار گوشهٔ صفحه را در مختصات مرورگر برمی‌گرداند.
   * ترتیب: بالا‌چپ، بالا‌راست، پایین‌راست، پایین‌چپ
   */
  function screenQuad() {
    const hw = LAPTOP.SCREEN_W / 2;
    const hh = LAPTOP.SCREEN_H / 2;
    const cz = LID_H / 2;
    const rect = canvas.getBoundingClientRect();
    // ترتیب حتماً باید «بالا‌چپ، بالا‌راست، پایین‌راست، پایین‌چپ» باشد.
    // بالای بوم روی لبهٔ دورتر درِ لپ‌تاپ می‌افتد، یعنی cz + hh.
    const pts = [
      [-hw, cz + hh],
      [hw, cz + hh],
      [hw, cz - hh],
      [-hw, cz - hh],
    ];
    const out = [];
    for (const [lx, lz] of pts) {
      _q.set(lx, -0.02, lz);
      lidPivot.localToWorld(_q);
      _q.project(camera);
      out.push([
        rect.left + ((_q.x + 1) / 2) * rect.width,
        rect.top + ((1 - _q.y) / 2) * rect.height,
      ]);
    }
    return out;
  }

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
    const lidT = seg(p, T.lid);
    let lidOpen = smooth(lidT);
    lidOpen += 0.035 * Math.sin(lidT * Math.PI * 3) * (1 - lidT);
    lidPivot.rotation.x = LAPTOP.OPEN_ANGLE * clamp(lidOpen);

    /* کل حالت دسکتاپ از پیشرفت اسکرول ساخته می‌شود */
    const st = computeState(p, projects.length);
    lastState = st;

    // CanvasTexture خودش تغییر بافت را تشخیص نمی‌دهد؛ هر بار که بوم دوباره
    // رسم شد باید صریحاً برای ارسال دوباره به GPU علامت‌گذاری شود.
    if (desktop.draw(st)) screenTex.needsUpdate = true;

    /* نشانگر موس */
    const c = st.cursor;
    cursor.visible = c.appear > 0.01;
    cursor.material.opacity = c.appear;
    if (cursor.visible) {
      const cxp = (c.x / SW - 0.5) * LAPTOP.SCREEN_W;
      const czp =
        LID_H / 2 + LAPTOP.SCREEN_H / 2 - (c.y / SH) * LAPTOP.SCREEN_H;
      cursor.position.set(cxp, -0.031, czp);

      const click = Math.max(
        c.clickComputer,
        c.clickManage,
        c.clickProjects,
      );
      cursor.scale.setScalar(1 - Math.sin(click * Math.PI) * 0.14);

      const live = click > 0.002 && click < 0.998;
      ripple.visible = live;
      if (live) {
        ripple.position.set(cxp, -0.033, czp);
        ripple.material.opacity = (1 - click) * 0.85;
        ripple.scale.setScalar(0.4 + click * 1.5);
      }
    } else {
      ripple.visible = false;
    }

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
    const blend = smooth(seg(p, CAM.blend));
    const dollyT = smooth(seg(p, CAM.dolly));
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
    const glow = st.power * (0.4 + 0.6 * st.desktop) * 9;
    screenLight.position.copy(screenCenter).addScaledVector(dir, 0.85);
    screenLight.intensity = glow;
    halo.material.opacity = 0.25 + 0.75 * blend;

    /* محو شدن در انتها */
    canvas.style.opacity = String(1 - st.fade);

    // ماتریس هم‌ترازی iframe روی صفحه (فقط وقتی پیش‌نمایش زنده باز است)
    if (onLiveTransform) {
      const m = quadToMatrix3d(SW, SH, screenQuad());
      if (m) onLiveTransform(m);
    }

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
    /** کلیک کاربر روی صفحه → مختصات در فضای ۱۶۰۰×۱۰۰۰ */
    onScreenTap(fn) {
      onScreenTap = fn;
    },
    /** هر فریم ماتریس هم‌ترازی پیش‌نمایش زنده را می‌دهد؛ null یعنی خاموش */
    onLiveTransform(fn) {
      onLiveTransform = fn;
    },
    resize,
    dispose() {
      running = false;
      cancelAnimationFrame(frameId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
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