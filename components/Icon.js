/** آیکون‌های SVG درون‌خطی — بدون کتابخانه خارجی. */

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

export function Icon({ name, size = 20, ...rest }) {
  const p = { ...base, width: size, height: size, ...rest };

  switch (name) {
    case "code":
      return (
        <svg {...p}>
          <path d="m16 18 6-6-6-6M8 6l-6 6 6 6" />
        </svg>
      );
    case "brain":
      return (
        <svg {...p}>
          <path d="M12 5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 9 19a3 3 0 0 0 3-1.5V5Z" />
          <path d="M12 5a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3 3 0 0 1 15 19a3 3 0 0 1-3-1.5V5Z" />
          <path d="M9 19v1.5A1.5 1.5 0 0 1 7.5 22H6M15 19v1.5a1.5 1.5 0 0 0 1.5 1.5H18" />
        </svg>
      );
    case "tool":
      return (
        <svg {...p}>
          <path d="M14.7 6.3a4 4 0 0 0 5 5L21 21H3l9.3-9.7" />
          <path d="m6 6 3 3" />
        </svg>
      );
    case "layout":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "react":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        </svg>
      );
    case "eye":
      return (
        <svg {...p}>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "chat":
      return (
        <svg {...p}>
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z" />
          <path d="M9 11h6M9 15h4" />
        </svg>
      );
    case "data":
      return (
        <svg {...p}>
          <ellipse cx="12" cy="6" rx="8" ry="3" />
          <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
          <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
        </svg>
      );
    case "github":
      return (
        <svg {...p}>
          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19.8 4.6 4.9 4.9 0 0 0 19.7.6S18.4.1 15 2.1a13.4 13.4 0 0 0-6 0C5.6.1 4.3.6 4.3.6a4.9 4.9 0 0 0-.1 4A5.2 5.2 0 0 0 2.9 8.6c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...p}>
          <path d="M21.9 4.3 2.9 11.6c-1.3.5-1.3 1.3-.2 1.6l4.9 1.5 1.9 5.8c.2.7.1 1 .8 1 .5 0 .7-.2 1-.5l2.4-2.3 5 3.7c.9.5 1.6.2 1.8-.9l3.3-15.5c.3-1.3-.5-1.8-1.4-1.4Z" />
          <path d="m7.6 14.6 11-6.9-8.8 8.3" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "mail":
      return (
        <svg {...p}>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m3 7 8.1 5.6a2 2 0 0 0 2.2 0L21 7" />
        </svg>
      );
    case "phone":
      return (
        <svg {...p}>
          <path d="M21.5 16.9v2.6a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3 19.3 19.3 0 0 1-6-6 19.6 19.6 0 0 1-3-8.6A2 2 0 0 1 3.8 2h2.6a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L7.5 9.8a16 16 0 0 0 6 6l1.2-1.1a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.9 2Z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...p}>
          <path d="M20 10.5c0 5.4-8 12-8 12s-8-6.6-8-12a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10.5" r="2.8" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="16" rx="2.5" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg {...p}>
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
      );
    case "arrow-up-left":
      return (
        <svg {...p}>
          <path d="M17 17 7 7M7 7h10M7 7v10" />
        </svg>
      );
    case "external":
      return (
        <svg {...p}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6M10 14 21 3" />
        </svg>
      );
    case "check":
      return (
        <svg {...p}>
          <path d="m20 6-11 11-5-5" />
        </svg>
      );
    case "lock":
      return (
        <svg {...p}>
          <rect x="4" y="10.5" width="16" height="11" rx="2.5" />
          <path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...p}>
          <rect x="2.5" y="7" width="19" height="13" rx="2.5" />
          <path d="M8.5 7V5.5A2.5 2.5 0 0 1 11 3h2a2.5 2.5 0 0 1 2.5 2.5V7M2.5 12.5h19" />
        </svg>
      );
    case "cap":
      return (
        <svg {...p}>
          <path d="m12 4 10 5-10 5L2 9l10-5Z" />
          <path d="M6 11.2V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.8" />
        </svg>
      );
    case "sparkle":
      return (
        <svg {...p}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.2 6.2l2.8 2.8M15 15l2.8 2.8M17.8 6.2 15 9M9 15l-2.8 2.8" />
        </svg>
      );
    case "layers":
      return (
        <svg {...p}>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
        </svg>
      );
    case "star":
      return (
        <svg {...p}>
          <path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3Z" />
        </svg>
      );
    case "user":
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
    default:
      return null;
  }
}