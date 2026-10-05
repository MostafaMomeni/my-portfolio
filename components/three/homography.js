/**
 * تبدیل چهار گوشهٔ صفحه‌ی سه‌بعدی به ماتریس CSS.
 *
 * برای اینکه یک iframe واقعی داخل صفحه‌ی لپ‌تاپ بنشیند، باید دقیقاً با
 * چهار گوشه‌ی صفحه‌ی سه‌بعدی جور باشد. این کار با یک «هماگرافی» انجام
 * می‌شود: نگاشت چهار نقطه از فضای صفحه به مختصات مرورگر، که به‌صورت
 * matrix3d در CSS نوشته می‌شود.
 */

/**
 * حل هماگرافی برای چهار زوج نقطهٔ متناظر.
 *
 * @param {Array<[number,number]>} src چهار نقطهٔ مبدأ به‌صورت [u,v] نرمال‌شده
 * @param {Array<[number,number]>} dst چهار نقطهٔ مقصد به‌صورت [X,Y] پیکسل
 * @returns {number[]|null} هشت ضریب [h11..h13, h21..h23, h31, h32] یا null
 */
export function solveHomography(src, dst) {
  // هشت معادله برای هشت مجهول (h33 را ۱ می‌گیریم)
  const A = [];
  for (let i = 0; i < 4; i++) {
    const [u, v] = src[i];
    const [X, Y] = dst[i];
    A.push([u, v, 1, 0, 0, 0, -u * X, -v * X, X]);
    A.push([0, 0, 0, u, v, 1, -u * Y, -v * Y, Y]);
  }

  // حذف گاوسی با تفکیک جزئی
  const n = 8;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    }
    if (Math.abs(A[pivot][col]) < 1e-12) return null;
    if (pivot !== col) {
      const tmp = A[pivot];
      A[pivot] = A[col];
      A[col] = tmp;
    }
    const p = A[col][col];
    for (let c = col; c <= n; c++) A[col][c] /= p;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = A[r][col];
      if (!f) continue;
      for (let c = col; c <= n; c++) A[r][c] -= f * A[col][c];
    }
  }

  return [A[0][n], A[1][n], A[2][n], A[3][n], A[4][n], A[5][n], A[6][n], A[7][n]];
}

/**
 * ماتریس CSS برای نگاشت یک مستطیلٔ w×h به چهار گوشهٔ دلخواه.
 *
 * @param {number} w عرض فضای مبدأ
 * @param {number} h ارتفاع فضای مبدأ
 * @param {Array<[number,number]>} quad چهار گوشه به‌ترتیب:
 *        بالا‌چپ، بالا‌راست، پایین‌راست، پایین‌چپ
 * @returns {string|null} رشته‌ی matrix3d
 */
export function quadToMatrix3d(w, h, quad) {
  // اگر گوشه‌ها با ترتیب معکوس داده شوند، تصویر آینه می‌شود. مساحت علامت‌دار
  // را بررسی می‌کنیم و در صورت نیاز جای گوشه‌های بالا و پایین را عوض می‌کنیم.
  let area = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const ordered =
    area < 0
      ? [quad[0], quad[3], quad[2], quad[1]]
      : quad;

  const src = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  const s = solveHomography(src, ordered);
  if (!s) return null;

  const [h11, h12, h13, h21, h22, h23, h31, h32] = s;

  /*
   * با u = x/w و v = y/h داریم:
   *
   *   X = (h11·u + h12·v + h13) / (h31·u + h32·v + 1)
   *
   * صورت و مخرج را در w·h ضرب می‌کنیم تا به پیکسل برسیم:
   *
   *   X = (h11·h·x + h12·w·y + h13·w·h) / (h31·h·x + h32·w·y + w·h)
   *
   * در ماتریس CSS (ستون‌به‌ستون) ستون ۰ و ۱ صورت را می‌سازند و ستون ۳ مخرج
   * را. یعنی m11 = h11·h و m12 = h12·w و m14 = h13·w·h، و به همین ترتیب
   * برای Y. جابه‌جا گرفتن این جمله‌ها تصویر را له می‌کند و از قاب بیرون می‌برد.
   */
  const m = [
    h11 * h, h21 * h, 0, h31 * h,
    h12 * w, h22 * w, 0, h32 * w,
    0, 0, 1, 0,
    h13 * w * h, h23 * w * h, 0, w * h,
  ];

  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-9 ? 0 : v.toFixed(6))).join(",")})`;
}