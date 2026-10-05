/**
 * کد نمایشی سایت — تنها منبع حقیقت.
 *
 * همین کد قبلاً داخل کارت ترمینالِ هدر (components/Hero.js) نوشته می‌شد.
 * حالا از این فایل خوانده می‌شود تا همان کد، عیناً داخل صفحه‌ی VS Code
 * سه‌بعدیِ لپ‌تاپ هم نوشته شود و هر دو همیشه یکی بمانند.
 *
 * ساختار هر خط: آرایه‌ای از توکن‌های { t: نوع توکن, v: متن }.
 * انواع توکن: com (کامنت) · kw (کلیدواژه) · fn (تابع/کلاس) · num (عدد)
 *            str (رشته) · prop (نام متغیر) · p (نشانه‌گذاری و عملگر)
 */

export const editorFile = {
  file: "developer.py",
  project: "mostafa-portfolio",
  language: "Python 3.12.1",
  branch: "main",
};

/** خطوط فایل developer.py — دقیقاً همان چیزی که در هدر سایت بود. */
export const codeLines = [
  [{ t: "com", v: "# Frontend × Artificial Intelligence" }],
  [],
  [
    { t: "kw", v: "class" },
    { t: "sp", v: " " },
    { t: "fn", v: "Developer" },
    { t: "p", v: "(" },
    { t: "num", v: "3" },
    { t: "p", v: ", " },
    { t: "num", v: "16" },
    { t: "p", v: ", " },
    { t: "str", v: '"Qom"' },
    { t: "p", v: ", " },
    { t: "str", v: '"Iran"' },
    { t: "p", v: "):" },
  ],
  [
    { t: "prop", v: "name" },
    { t: "p", v: " = " },
    { t: "str", v: '"Mostafa Momeni"' },
  ],
  [
    { t: "prop", v: "focus" },
    { t: "p", v: " = [" },
    { t: "str", v: '"Frontend"' },
    { t: "p", v: ", " },
    { t: "str", v: '"AI"' },
    { t: "p", v: "]" },
  ],
  [
    { t: "prop", v: "stack" },
    { t: "p", v: " = [" },
    { t: "str", v: '"React"' },
    { t: "p", v: ", " },
    { t: "str", v: '"Next.js"' },
    { t: "p", v: ", " },
    { t: "str", v: '"Python"' },
    { t: "p", v: "]" },
  ],
  [],
  [
    { t: "kw", v: "def" },
    { t: "sp", v: " " },
    { t: "fn", v: "build" },
    { t: "p", v: "(" },
    { t: "prop", v: "self" },
    { t: "p", v: ", " },
    { t: "prop", v: "idea" },
    { t: "p", v: "):" },
  ],
  [
    { t: "kw", v: "return" },
    { t: "sp", v: " " },
    { t: "fn", v: "ship" },
    { t: "p", v: "(" },
    { t: "prop", v: "idea" },
    { t: "p", v: ", " },
    { t: "prop", v: "craft" },
    { t: "p", v: "=" },
    { t: "str", v: '"obsessed"' },
    { t: "p", v: ")" },
  ],
  [],
  [
    { t: "fn", v: "Developer" },
    { t: "p", v: "(" },
    { t: "num", v: "3" },
    { t: "p", v: ", " },
    { t: "num", v: "16" },
    { t: "p", v: ")." },
    { t: "fn", v: "build" },
    { t: "p", v: "(" },
    { t: "str", v: '"the next idea"' },
    { t: "p", v: ")" },
  ],
];

/** متن ساده هر خط — برای رسم متنی و برای محاسبه طول تایپ. */
export const codeText = codeLines.map((line) =>
  line.map((token) => token.v).join(""),
);

/** آفست هر خط در متن کل (شامل کاراکتر خط‌جدید بین خطوط). */
export const lineOffsets = (() => {
  const offsets = [];
  let cursor = 0;
  for (const line of codeText) {
    offsets.push(cursor);
    cursor += line.length + 1; // +1 برای \n
  }
  return offsets;
})();

/** تعداد کل کاراکترهای تایپ‌شونده. */
export const totalChars = codeText.reduce((n, l) => n + l.length, 0);

/** تعداد خط‌ها. */
export const totalLines = codeLines.length;