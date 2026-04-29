import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { getLocale } from "../lib/locale.js";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";

export const metadata = {
  title: "Artifact Museum",
  description: "Browse and scan our artifact collection",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            right: "1rem",
            zIndex: 1000,
          }}
        >
          <LanguageSwitcher currentLocale={locale} />
        </div>
        {children}
      </body>
    </html>
  );
}
