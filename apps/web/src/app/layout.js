import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Local Background Remover",
  description:
    "Local-first background removal for creators and teams. Buy App, CLI, or Both and activate with Polar license keys.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container nav-wrap">
            <Link href="/" className="brand">
              Local Background Remover
            </Link>
            <nav className="nav-links">
              <Link href="/pricing">Pricing</Link>
              <Link href="/downloads">Downloads</Link>
              <Link href="/thank-you">Activation</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
