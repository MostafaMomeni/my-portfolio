/**
 * پنجره‌ی VS Code به‌صورت DOM واقعی.
 *
 * دو کار می‌کند:
 *  ۱) خروجی سمت سرور برای کاربران بدون WebGL، بدون جاوااسکریپت و
 *     کسانی که «حرکت کمتر» را ترجیح داده‌اند.
 *  ۲) متن واقعی کد برای موتورهای جست‌وجو و صفحه‌خوان‌ها.
 *
 * کدِ نمایش‌داده‌شده از data/code.js می‌آید؛ همان کدی که روی صفحه‌ی
 * لپ‌تاپ سه‌بعدی تایپ می‌شود.
 */

import { codeLines, editorFile } from "../data/code";

const TOK_CLASS = {
  com: "vc-com",
  kw: "vc-kw",
  fn: "vc-fn",
  num: "vc-num",
  str: "vc-str",
  prop: "vc-prop",
  p: "vc-p",
  sp: "vc-p",
};

const TREE = [
  { label: "developer.py", kind: "py", depth: 1, active: true },
  { label: "app", kind: "folder", depth: 1 },
  { label: "components", kind: "folder", depth: 1 },
  { label: "data", kind: "folder", depth: 1 },
  { label: "public", kind: "folder", depth: 1 },
  { label: "package.json", kind: "file", depth: 1 },
];

function ActivityIcon({ name }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  const paths = {
    files: <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9zM13 3v6h6" />,
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),
    git: (
      <>
        <circle cx="7" cy="6" r="2.6" />
        <circle cx="7" cy="18" r="2.6" />
        <circle cx="17" cy="10" r="2.6" />
        <path d="M7 8.6v6.8M9.6 6h3.2a2 2 0 0 1 2 2v2M9.6 18h3.2a2 2 0 0 0 2-2v-3.4" />
      </>
    ),
    debug: (
      <>
        <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
        <path d="M12 14v4M9 20h6" />
      </>
    ),
    extensions: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7" />
      </>
    ),
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function CodeWindow() {
  return (
    <div className="vc" role="img" aria-label={`کد ${editorFile.file} در ویرایشگر کد`}>
      <div className="vc-bar">
        <span className="vc-dot vc-dot-r" />
        <span className="vc-dot vc-dot-y" />
        <span className="vc-dot vc-dot-g" />
        <span className="vc-title ltr">
          {editorFile.file} — {editorFile.project}
        </span>
      </div>

      <div className="vc-body">
        <div className="vc-activity" aria-hidden="true">
          <ActivityIcon name="files" />
          <ActivityIcon name="search" />
          <ActivityIcon name="git" />
          <ActivityIcon name="debug" />
          <ActivityIcon name="extensions" />
          <span className="vc-activity-spacer" />
          <ActivityIcon name="settings" />
        </div>

        <div className="vc-side" aria-hidden="true">
          <div className="vc-side-title ltr">EXPLORER</div>
          <ul>
            <li className="vc-side-root ltr">{editorFile.project.toUpperCase()}</li>
            {TREE.map((item) => (
              <li
                key={item.label}
                className={`vc-tree ltr${item.active ? " is-active" : ""}`}
                style={{ paddingInlineStart: 16 + item.depth * 14 }}
              >
                {item.kind === "folder" && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="m9 6 6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {item.kind === "py" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <rect width="24" height="24" rx="5" fill="#4b8bbe" />
                    <ellipse cx="12" cy="9.5" rx="4" ry="3.2" fill="#fdd043" />
                  </svg>
                ) : (
                  <svg width="14" height="16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="3"
                      y="2"
                      width="18"
                      height="20"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="vc-main">
          <div className="vc-tabs ltr">
            <span className="vc-tab is-active">
              <svg width="16" height="16" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="5" fill="#4b8bbe" />
                <ellipse cx="12" cy="9.5" rx="4" ry="3.2" fill="#fdd043" />
              </svg>
              {editorFile.file}
            </span>
          </div>
          <ol className="vc-code ltr">
            {codeLines.map((line, i) => (
              <li key={i}>
                <span className="vc-ln" aria-hidden="true">
                  {i + 1}
                </span>
                <code>
                  {line.length === 0 ? (
                    " "
                  ) : (
                    line.map((token, j) => (
                      <span key={j} className={TOK_CLASS[token.t] || "vc-p"}>
                        {token.v}
                      </span>
                    ))
                  )}
                </code>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="vc-status ltr">
        <span className="vc-status-branch">{editorFile.branch}</span>
        <span className="vc-status-right">{editorFile.language}</span>
      </div>
    </div>
  );
}