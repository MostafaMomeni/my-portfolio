/**
 * تنها منبع حقیقت برای محتوای سایت.
 *
 * هر مقدار این فایل از یکی از این منابع واقعی آمده است:
 *  - رزومه فرانت‌اند (final-front-rsume.pdf)
 *  - رزومه هوش مصنوعی (ai_resume.pdf)
 *  - پروفایل و مخازن عمومی GitHub: github.com/MostafaMomeni
 *  - خودِ وب‌سایت پروژه‌ها (عنوان، توضیحات، هدرهای فنی)
 *
 * هیچ عدد، آمار، مشتری، نتیجه یا فناوری بدون منبع معتبر اینجا نیامده است.
 */

export const profile = {
  name: "مصطفی مومنی",
  nameEn: "Mostafa Momeni",
  initials: "MM",
  role: "برنامه‌نویس Frontend و هوش مصنوعی",
  roleEn: "Frontend Developer & AI Developer",
  tagline: "Frontend × Artificial Intelligence",
  location: "قم، پردیسان، ایران",
  locationEn: "Qom, Iran",
  email: "https://mail.google.com/mail/?view=cm&to=mustafamomeni1359@gmail.com",
  emailName: "mustafamomeni1359@gmail.com",
  phone: "+989100952046",
  phoneDisplay: "۰۹۱۰-۰۹۵-۲۰۴۶",
  birthDate: "۱۳۸۴/۱۰/۲۵",
  summary:
    "از حدود ۱۵ سالگی وارد دنیای برنامه‌نویسی شدم و مسیرم را با Frontend شروع کردم. امروز در کنار توسعه رابط‌های کاربری، روی پروژه‌های هوش مصنوعی، یادگیری ماشین و مدل‌های زبانی کار می‌کنم.",
  shortBio:
    "برنامه‌نویس Frontend و هوش مصنوعی از قم. رابط‌های کاربری مدرن می‌سازم و در کنارش روی مدل‌های یادگیری ماشین و بینایی ماشین کار می‌کنم.",
  github: "https://github.com/MostafaMomeni",
  githubHandle: "MostafaMomeni",
  telegram: "https://t.me/m_dev_m",
  telegramHandle: "@m_dev_m",
  instagram: "https://instagram.com/m0stafa_m0meni",
  instagramHandle: "@m0stafa_m0meni",
  englishLevel: "متوسط",
};

/** دسته‌بندی پروژه‌ها — بدون تصویر ساختگی، فقط پروژه‌های واقعی. */
export const categories = {
  web: "توسعه وب",
  ai: "هوش مصنوعی",
  os: "متن‌باز",
};

/**
 * پروژه‌ها.
 *
 * تصویرها همگی تصویر واقعی همان پروژه‌اند (اسکرین‌شات از خود سایت زنده
 * یا لوگوی رسمی همان سایت). برای پروژه‌هایی که تصویر واقعی در دسترس نبوده،
 * به‌جای تصویر ساختگی از کارت گرافیکی اختصاصی استفاده شده است.
 */
export const projects = [
  {
    slug: "9falak",
    title: "سایت ۹ فلک",
    subtitle: "وب‌سایت اصلی ۹ فلک",
    category: "web",
    employer: "شرکت طلوع نجم",
    date: "مهر ۱۴۰۴",
    url: "https://9falak.com",
    featured: true,
    image: "/projects/9falak.png",
    imageKind: "screenshot",
    tech: ["Next.js", "React", "Material UI"],
    summary:
      "وبسایت اصلی 9 فلک که مدیریت و پل ارتباطی بین ابزار هایی هست که زیرمجموعه همین سایت هستند ",
    overview:
      "۹ فلک یک مرجع تخصصی نجوم ایرانی است. این پروژه وب‌سایت اصلی آن مجموعه است که علاوه بر معرفی، بخش‌های ابزار چارت و تفسیر را مدیریت و معرفی می‌کند.",
    problem:
      "مجموعه ۹ فلک چند سرویس جداگانه داشت که معرفی یکپارچه‌ای برای آن‌ها وجود نداشت.",
    goal: "ساخت وب‌سایت اصلی که مجموعه و ابزارهای آن را یکجا معرفی کند.",
    role: "توسعه‌دهنده Frontend",
    result:
      "وب‌سایت اصلی ۹ فلک با ساختار Next.js و رابط کاربری Material UI راه‌اندازی شد.",
    details: [
      "معرفی و مدیریت ابزارهای چارت و تفسیر در یک سایت واحد",
      "بخش اشتراک و راهنمای سایت برای کاربران",
      "صفحه‌های محتوایی و مقالات تخصصی نجوم",
    ],
  },
  {
    slug: "chart-9falak",
    title: "ابزار رسم چارت ۹ فلک",
    subtitle: "ابزار محاسبات نجومی",
    category: "web",
    employer: "شرکت طلوع نجم",
    date: "مهر ۱۴۰۳",
    url: "https://chart.9falak.com",
    featured: true,
    image: "/projects/chart-9falak.png",
    imageKind: "brand",
    accent: "violet",
    tech: ["Frontend Development"],
    summary:
      "وب‌سایتی برای محققان نجوم که به‌عنوان ابزار کار آن‌ها طراحی شده تا محاسبات نجومی خود را انجام دهند. (زیر مجموعه 9 فلک)",
    overview:
      "این پروژه ابزار کاری محققان نجوم است؛ جایی که می‌توانند محاسبات نجومی خود را انجام دهند.",
    problem: "محققان نجوم برای انجام محاسبات نجومی به ابزار اختصاصی نیاز داشتند.",
    goal: "ساخت ابزار محاسبات نجومی در بستر وب برای محققان.",
    role: "توسعه‌دهنده Frontend",
    result: "ابزار رسم چارت برای محققان نجوم طراحی و پیاده‌سازی شد.",
    details: [
      "طراحی به‌عنوان ابزار کاری روزانه محققان نجوم",
      "رابط کاربری فارسی و راست‌به‌چپ",
      "محاسبات نجومی در مرورگر",
    ],
  },
  {
    slug: "tafsir-9falak",
    title: "سایت تفسیر چارت ۹ فلک",
    subtitle: "تفسیر زایچه نجومی",
    category: "web",
    employer: "شرکت طلوع نجم",
    date: "اردیبهشت ۱۴۰۵",
    url: "https://tafsir.9falak.com",
    featured: true,
    image: "/projects/tafsir-brand.webp",
    imageKind: "brand",
    accent: "indigo",
    tech: ["Next.js", "React"],
    summary:
      "سایتی که کاربران می‌توانند از طریق آن هم تفسیر چارت نجومی خود هم تفسیر چارت دو نفر با یکدیگر را دریافت بکنند (زیر مجموعه 9 فلک)",
    overview:
      "در این سایت کاربران می‌توانند چارت نجومی خود را بسازند و تفسیر آن را دریافت کنند. این سایت بر اساس استانداردهای نجوم ایرانی و با تلفیق سایر مکاتب نجومی طراحی شده است.",
    problem: "کاربران برای دریافت تفسیر چارت نجومی به این سرویس نیاز داشتند.",
    goal: "ارائه سرویس آنلاین تفسیر چارت نجومی به زبان فارسی.",
    role: "توسعه‌دهنده Frontend",
    result:
      "سایت تفسیر ۹ فلک با رابط کاربری فارسی راه‌اندازی شد.",
    details: [
      "صفحه تفسیر جدید، تفسیرهای من و تحلیل سازگاری دو نفر",
      "رابط کاربری کاملاً فارسی و راست‌به‌چپ",
      "بیش از ۵۰ صفحه خودشناسی نجومی (طبق توضیحات خود سایت)",
    ],
  },
  {
    slug: "ai-stock-market",
    title: "هوش مصنوعی پیش‌بینی بازار بورس",
    subtitle: "پروژه محرمانه",
    category: "ai",
    employer: "شرکت طلوع نجم",
    date: "مهر ۱۴۰۴",
    url: null,
    featured: true,
    confidential: true,
    image: null,
    imageKind: "brand",
    accent: "blue",
    tech: ["Python", "Machine Learning"],
    summary:
      "پروژه‌ای برای حدس قیمت بازار بورس ایران با دقت ۸۰ درصد",
    overview:
      "یک پروژه هوش مصنوعی برای پیش‌بینی قیمت بازار بورس ایران ساخته شده است. این مدل با دقت ۸۰ درصد عمل کرده است.",
    problem: "پیش‌بینی روند قیمت در بازار بورس ایران.",
    goal: "ساخت مدلی برای برآورد قیمت بازار بورس ایران.",
    role: "توسعه‌دهنده هوش مصنوعی",
    result: "مدل با دقت ۸۰ درصد.",
    details: [
      "کارفرما: شرکت طلوع نجم",
      "تاریخ: مهر ۱۴۰۴",
      "زبان: Python — حوزه Machine Learning",
    ],
    note: "این پروژه محرمانه است و اجازه انتشار کد یا دمو آن را ندارم؛ به همین دلیل تصویری از آن نمایش داده نشده است.",
  },
  {
    slug: "chipyab",
    title: "فروشگاه اینترنتی چیپ‌ یاب",
    subtitle: "فروش عمده قطعات الکترونیکی",
    category: "web",
    employer: "شرکت چیپ یاب",
    date: "مرداد ۱۴۰۳",
    url: "https://chipyab.com",
    featured: false,
    image: "/projects/chipyab.png",
    imageKind: "screenshot",
    tech: ["Next.js"],
    summary: "سایت فروش قطعات الکترونیکی به صورت عمده.",
    overview:
      "وب‌سایت فروش قطعات الکترونیکی چیپ‌یاب؛ سفارش آنلاین و معرفی خدمات آزمایشگاهی و کالیبراسیون.",
    problem: "نیاز به فروشگاهی برای عرضه و سفارش قطعات الکترونیکی.",
    goal: "راه‌اندازی سایت فروشگاهی برای قطعات الکترونیکی.",
    role: "توسعه‌دهنده Frontend",
    result: "سایت فروشگاهی چیپ‌ یاب با سفارش آنلاین.",
    details: [
      "سفارش آنلاین قطعات",
      "خدمات آزمایشگاهی و کالیبراسیون",
      "اطلاعات تماس و فاکتور",
    ],
  },
  {
    slug: "ir-zar",
    title: "سایت معرفی ابزار گلد",
    subtitle: "مدیریت مشتریان طلافروشان",
    category: "web",
    employer: "شرکت طلای گلد",
    date: null,
    url: "https://ir-zar.ir",
    featured: false,
    image: "/projects/irzar.webp",
    imageKind: "screenshot",
    tech: ["Next.js"],
    summary:
      "معرفی ابزاری که در آن طلافروشان می‌توانند مشتریان خود را مدیریت کنند.",
    overview:
      "سایت معرفی ابزاری برای طلافروشان که امکان مدیریت مشتریان را فراهم می‌کند. سایت با نمایش قیمت لحظه‌ای طلا و امکان ثبت سفارش کار می‌کند.",
    problem: "مدیریت مشتریان برای طلافروشان.",
    goal: "ساخت ابزاری برای مدیریت مشتریان طلافروشان.",
    role: "توسعه‌دهنده Frontend",
    result: "وب‌سایت معرفی ابزار مدیریت مشتریان طلافروشان.",
    details: [
      "نمایش قیمت لحظه‌ای طلا و سکه",
      "ثبت سفارش و شروع رایگان",
      "بخش مقالات و ارتباط با ما",
    ],
  },
  {
    slug: "nextafzar",
    title: "سایت معرفی طلوع نجم",
    subtitle: "وب‌سایت شرکتی",
    category: "web",
    employer: "شرکت طلوع نجم",
    date: "بهمن ۱۴۰۴",
    url: "https://nextafzar.ir",
    featured: false,
    image: "/projects/nextafzar.png",
    imageKind: "screenshot",
    tech: ["Next.js"],
    summary: "سایت معرفی شرکت طلوع نجم.",
    overview:
      "وب‌سایت معرفی شرکت طلوع نجم. در حال حاضر محتوای نهایی شرکت روی سایت قرار نگرفته و نسخه‌ی نمایشی آن فعال است.",
    problem: "نیاز به یک وب‌سایت معرفی برای شرکت طلوع نجم.",
    goal: "طراحی و پیاده‌سازی وب‌سایت شرکتی.",
    role: "توسعه‌دهنده Frontend",
    result: "وب‌سایت شرکتی راه‌اندازی شد.",
    details: [
      "ساختار چندصفحه‌ای شرکتی",
      "بخش‌های خانه، درباره ما، پروژه‌ها، محصولات، مقالات و تیم",
      "نسخه فعلی، نسخه‌ی نمایشی است و در انتظار محتوای نهایی شرکت",
    ],
    note: "این پروژه در مرحله‌ی نسخه‌ی نمایشی است و محتوای نهایی آن هنوز از سوی شرکت تعویض نشده است.",
  },
];

/** مخازن عمومی واقعی GitHub — فقط پروژه‌های مرتبط و مناسب برای معرفی. */
export const repos = [
  {
    name: "hand-controller",
    language: "Python",
    desc: "کنترل با حرکات دست با استفاده از پردازش تصویر و MediaPipe",
    tech: ["Python", "OpenCV", "MediaPipe"],
    category: "ai",
    url: "https://github.com/MostafaMomeni/hand-controller",
  },
  {
    name: "ml-practice",
    language: "Jupyter Notebook",
    desc: "مجموعه‌ای از نوت‌بوک‌های تمرینی یادگیری ماشین روی دیتاست‌های واقعی",
    tech: ["Machine Learning", "Data Analysis"],
    category: "ai",
    url: "https://github.com/MostafaMomeni/ml-practice",
  },
  {
    name: "trade",
    language: "Jupyter Notebook",
    desc: "سرویس FastAPI برای ارائه پیش‌بینی مدل یادگیری ماشین",
    tech: ["Python", "FastAPI", "Machine Learning"],
    category: "ai",
    url: "https://github.com/MostafaMomeni/trade",
  },
  {
    name: "recommender-system-model",
    language: "Jupyter Notebook",
    desc: "پیاده‌سازی سیستم پیشنهاددهنده",
    tech: ["Machine Learning", "Python"],
    category: "ai",
    url: "https://github.com/MostafaMomeni/recommender-system-model",
  },
  {
    name: "three-js",
    language: "JavaScript",
    desc: "پروژه‌های سه‌بعدی با Three.js از جمله منظومه شمسی",
    tech: ["Three.js", "JavaScript"],
    category: "web",
    url: "https://github.com/MostafaMomeni/three-js",
  },
  {
    name: "mostafa-website",
    language: "JavaScript",
    desc: "وب‌سایت شخصی با Next.js، انیمیشن و پشتیبانی کامل RTL",
    tech: ["Next.js", "React", "RTL"],
    category: "web",
    url: "https://github.com/MostafaMomeni/mostafa-website",
  },
  {
    name: "szstore",
    language: "JavaScript",
    desc: "فروشگاه اینترنتی با React، Material UI و طراحی واکنش‌گرا",
    tech: ["React", "Material UI"],
    category: "web",
    url: "https://github.com/MostafaMomeni/szstore",
  },
  {
    name: "iranify",
    language: "TypeScript",
    desc: "وب‌سایت شخصی با Next.js و TypeScript",
    tech: ["Next.js", "TypeScript"],
    category: "web",
    url: "https://github.com/MostafaMomeni/iranify",
  },
];

/** مهارت‌ها — ادغام دو رزومه و حذف موارد تکراری. بدون درصد ساختگی. */
export const skillGroups = [
  {
    id: "frontend",
    title: "Frontend",
    caption: "رابط کاربری و تجربه وب",
    icon: "code",
    skills: [
      { name: "HTML", note: "ساختار صفحه و محتوا" },
      { name: "CSS", note: "استایل و چیدمان" },
      { name: "JavaScript", note: "زبان اصلی فرانت" },
      { name: "React", note: "کتابخانه رابط کاربری" },
      { name: "Next.js", note: "فریم‌ورک مبتنی بر React" },
      { name: "TypeScript", note: "جاوااسکریپت با نوع‌دهی" },
      { name: "Three.js", note: "گرافیک سه‌بعدی در وب" },
      { name: "Material UI", note: "کتابخانه کامپوننت" },
      { name: "REST API", note: "ارتباط با سرویس‌ها" },
      { name: "Responsive Design", note: "واکنش‌گرایی" },
      { name: "SEO", note: "بهینه‌سازی موتور جستجو" },
    ],
  },
  {
    id: "ai",
    title: "Artificial Intelligence",
    caption: "یادگیری ماشین و مدل‌های هوشمند",
    icon: "brain",
    skills: [
      { name: "Python", note: "زبان اصلی هوش مصنوعی" },
      { name: "Machine Learning", note: "یادگیری ماشین" },
      { name: "Deep Learning", note: "یادگیری عمیق" },
      { name: "Computer Vision", note: "بینایی ماشین" },
      { name: "LLM", note: "مدل‌های زبانی بزرگ" },
      { name: "NLP", note: "پردازش زبان طبیعی" },
      { name: "Data Analysis", note: "تحلیل داده" },
      { name: "FastAPI", note: "سرویس‌دهی به مدل‌ها" },
    ],
  },
  {
    id: "tools",
    title: "Tools & Workflow",
    caption: "ابزارها و گردش کار",
    icon: "tool",
    skills: [
      { name: "Git", note: "مدیریت نسخه" },
      { name: "GitHub", note: "میزبانی کد" },
      { name: "Jupyter", note: "محیط تحلیل داده" },
      { name: "Vite", note: "ابزار ساخت پروژه" },
    ],
  },
];

/** مسیر حرفه‌ای — فقط تاریخ‌های موجود در منابع. */
export const timeline = [
  {
    period: "۱۵ سالگی",
    title: "شروع برنامه‌نویسی",
    text: "ورود به دنیای برنامه‌نویسی با تمرکز بر Frontend Development.",
  },
  {
    period: "مهر ۱۴۰۳",
    title: "شروع تحصیل مهندسی کامپیوتر",
    text: "دانشگاه آزاد اسلامی قم — کارشناسی مهندسی کامپیوتر، گرایش برنامه‌نویسی وب.",
  },
  {
    period: "خرداد ۱۴۰۳",
    title: "شروع فعالیت حرفه‌ای",
    text: "پیوستن به شرکت طلوع نجم به‌عنوان برنامه‌نویس Frontend و هوش مصنوعی در قم.",
  },
  {
    period: "مهر ۱۴۰۴",
    title: "پروژه هوش مصنوعی بازار بورس",
    text: "ساخت پروژه‌ای برای حدس قیمت بازار بورس ایران با دقت ۸۰ درصد (پروژه محرمانه).",
  },
  {
    period: "اکنون",
    title: "Frontend + Artificial Intelligence",
    text: "ادامه فعالیت در توسعه وب و هوش مصنوعی به‌صورت هم‌زمان.",
  },
];

export const experience = [
  {
    role: "برنامه‌نویس Frontend و هوش مصنوعی",
    company: "شرکت طلوع نجم",
    location: "قم",
    period: "خرداد ۱۴۰۳ — اکنون",
    text: "توسعه وب‌سایت‌ها و ابزارهای اختصاصی مجموعه ۹ فلک در کنار توسعه پروژه‌های هوش مصنوعی.",
    points: [
      "توسعه رابط‌های کاربری و ابزارهای وب مجموعه ۹ فلک",
      "پیاده‌سازی پروژه هوش مصنوعی پیش‌بینی بازار بورس",
      "توسعه وب‌سایت‌های شرکتی و فروشگاهی",
    ],
  },
];

export const education = [
  {
    degree: "کارشناسی مهندسی کامپیوتر",
    // field: "گرایش: برنامه‌نویسی وب",
    school: "دانشگاه آزاد اسلامی قم",
    location: "قم",
    period: "مهر ۱۴۰۳ — اکنون",
    grade: "معدل: ۱۶",
    text:"دانشجوی مهندسی کامپیوتر هستم که همزمان در بازار کار نیز فعالیت میکنم",
  },
];

/** خدمات — متن‌ها بر پایه مهارت‌ها و پروژه‌های واقعی. */
export const services = [
  {
    icon: "layout",
    title: "Frontend Development",
    text: "طراحی و توسعه رابط‌های کاربری مدرن، واکنش‌گرا و حرفه‌ای با تمرکز روی تجربه کاربری.",
  },
  {
    icon: "react",
    title: "React & Next.js",
    text: "ساخت وب‌اپلیکیشن‌های مدرن و سئو‌پسند با اکوسیستم React و Next.js.",
  },
  {
    icon: "brain",
    title: "AI Development",
    text: "توسعه پروژه‌های هوش مصنوعی و یادگیری ماشین با زبان Python.",
  },
  {
    icon: "eye",
    title: "Computer Vision",
    text: "کار با پروژه‌های پردازش و تحلیل تصویر، از جمله کنترل با حرکات دست.",
  },
  {
    icon: "chat",
    title: "LLM ",
    text: "کار با مدل‌های زبانی بزرگ.",
  },
  {
    icon: "data",
    title: "Data Analysis",
    text: "تحلیل داده و آماده‌سازی دیتاست برای آموزش و ارزیابی مدل‌ها.",
  },
];

/**
 * آمار — فقط اعدادی که مستقیماً از منابع قابل استخراج‌اند.
 * بدون هیچ عدد ساختگی.
 */
export const stats = [
  { value: "۲", label: "حوزه تخصصی", hint: "Frontend و هوش مصنوعی" },
  { value: "۶", label: "پروژه وب", hint: "برای کارفرماهای واقعی" },
  { value: "۱", label: "پروژه هوش مصنوعی", hint: "پیش‌بینی بازار بورس" },
  { value: "۱۲", label: "مخزن عمومی", hint: "در GitHub" },
];

export const navItems = [
  { href: "#home", label: "خانه" },
  { href: "#about", label: "درباره من" },
  { href: "#skills", label: "مهارت‌ها" },
  { href: "#projects", label: "پروژه‌ها" },
  { href: "#experience", label: "تجربه" }, 
  { href: "#contact", label: "تماس" },
];

export const socials = [
  { key: "github", label: "GitHub", handle: profile.githubHandle, url: profile.github },
  { key: "telegram", label: "Telegram", handle: profile.telegramHandle, url: profile.telegram },
  { key: "instagram", label: "Instagram", handle: profile.instagramHandle, url: profile.instagram },
  { key: "email", label: "Email", handle: profile.email, url: profile.email },
];

export function getProject(slug) {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);