import "./globals.css";
import I18nProvider from "@/i18n/I18nProvider";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import logo from "@/public/logo.png";
import {Metadata} from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const BP = process.env.NEXT_PUBLIC_BASE_PATH || "";

const abs = (p = "/") => `${SITE_URL}${BP}${p}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "SBOM to NOTICE Converter",
    template: "%s | SBOM to NOTICE"
  },
  description: "Convert SPDX/CycloneDX SBOMs to compliant NOTICE files.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: abs("/"),
    title: "SBOM to NOTICE Converter",
    description: "Generate NOTICE files from SPDX/CycloneDX JSON.",
    siteName: "NOTICE Builder",
    images: [
      { url: abs("/og.png"), width: 70, height: 30, alt: "SBOM to NOTICE" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [abs("/og.png")],
  },
  robots: { index: true, follow: true },
  manifest: `${BP}/icons/manifest.json`,
  icons: {
    apple: [
      { url: `${BP}/icons/apple-icon-57x57.png`, sizes: "57x57" },
      { url: `${BP}/icons/apple-icon-60x60.png`, sizes: "60x60" },
      { url: `${BP}/icons/apple-icon-72x72.png`, sizes: "72x72" },
      { url: `${BP}/icons/apple-icon-76x76.png`, sizes: "76x76" },
      { url: `${BP}/icons/apple-icon-114x114.png`, sizes: "114x114" },
      { url: `${BP}/icons/apple-icon-120x120.png`, sizes: "120x120" },
      { url: `${BP}/icons/apple-icon-144x144.png`, sizes: "144x144" },
      { url: `${BP}/icons/apple-icon-152x152.png`, sizes: "152x152" },
      { url: `${BP}/icons/apple-icon-180x180.png`, sizes: "180x180" },
    ],
    icon: [
      { url: `${BP}/icons/android-icon-192x192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BP}/icons/favicon-32x32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BP}/icons/favicon-96x96.png`, sizes: "96x96", type: "image/png" },
      { url: `${BP}/icons/favicon-16x16.png`, sizes: "16x16", type: "image/png" },
    ],
  },
  other: {
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": `${BP}/icons/ms-icon-144x144.png`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
    <I18nProvider>
      <div className="container mx-auto">
        <Navigation/>
        {children}
        <Footer/>
      </div>
    </I18nProvider>
    </body>
    </html>
  );
}
