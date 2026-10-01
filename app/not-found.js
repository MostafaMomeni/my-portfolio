import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Icon } from "../components/Icon";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="section" style={{ minHeight: "62vh", display: "grid", placeItems: "center" }}>
        <div className="shell" style={{ textAlign: "center" }}>
          <div
            className="grad-text"
            style={{ fontSize: "clamp(76px, 16vw, 150px)", fontWeight: 900, lineHeight: 1 }}
          >
            404
          </div>
          <h1 style={{ fontSize: "clamp(21px, 3.4vw, 30px)", margin: "14px 0 12px" }}>
            این صفحه پیدا نشد
          </h1>
          <p className="section-desc" style={{ margin: "0 auto 28px" }}>
            شاید نشانی را اشتباه وارد کرده‌اید یا این صفحه جابه‌جا شده است.
          </p>
          <Link href="/" className="btn btn-primary">
            <Icon name="arrow-left" size={17} />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}