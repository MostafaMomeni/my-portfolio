import { navItems, profile, socials } from "../data/site";
import { Icon } from "./Icon";

export default function Footer() {
  const year = 1405; // سال جاری شمسی — ۲۰۲۶

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <a href="#home" className="brand">
            <span className="brand-mark" aria-hidden="true">
              {profile.initials}
            </span>
            <span className="brand-text">
              {profile.name}
              <small className="ltr">{profile.nameEn.toUpperCase()}</small>
            </span>
          </a>

          <nav className="footer-links" aria-label="ناوبری فوتر">
            {navItems.map((n) => (
              <a className="nav-link" href={n.href} key={n.href}>
                {n.label}
              </a>
            ))}
          </nav>

          <div style={{ display: "flex", gap: 9 }}>
            {socials.map((s) => (
              <a
                className="chip"
                href={s.url}
                key={s.key}
                target={s.url.startsWith("http") ? "_blank" : undefined}
                rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                aria-label={s.label}
              >
                <Icon name={s.key} size={15} />
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {year} — {profile.name} · {profile.role}
          </span>
          <span>
            ساخته شده با <span className="footer-heart">♥</span>
          </span>
        </div>
      </div>
    </footer>
  );
}