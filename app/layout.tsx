import "./globals.css";
import I18nProvider from "@/i18n/I18nProvider";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "SBOM to NOTICE Converter",
    template: "%s | SBOM to NOTICE"
  },
  description: "Convert SPDX/CycloneDX SBOMs to compliant NOTICE files.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "SBOM to NOTICE Converter",
    description: "Generate NOTICE files from SPDX/CycloneDX JSON.",
    siteName: "NOTICE Builder"
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
    <head>
      <meta name="robots" content="index, follow"/>
      <link rel="apple-touch-icon" sizes="57x57" href="/icons/apple-icon-57x57.png"/>
      <link rel="apple-touch-icon" sizes="60x60" href="/icons/apple-icon-60x60.png"/>
      <link rel="apple-touch-icon" sizes="72x72" href="/icons/apple-icon-72x72.png"/>
      <link rel="apple-touch-icon" sizes="76x76" href="/icons/apple-icon-76x76.png"/>
      <link rel="apple-touch-icon" sizes="114x114" href="/icons/apple-icon-114x114.png"/>
      <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-icon-120x120.png"/>
      <link rel="apple-touch-icon" sizes="144x144" href="/icons/apple-icon-144x144.png"/>
      <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152x152.png"/>
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180x180.png"/>
      <link rel="icon" type="image/png" sizes="192x192" href="/icons/android-icon-192x192.png"/>
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png"/>
      <link rel="icon" type="image/png" sizes="96x96" href="/icons/favicon-96x96.png"/>
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png"/>
      <link rel="manifest" href="/icons/manifest.json"/>
      <meta name="msapplication-TileColor" content="#ffffff"/>
      <meta name="msapplication-TileImage" content="/icons/ms-icon-144x144.png"/>
      <meta name="theme-color" content="#ffffff"/>
    </head>
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
