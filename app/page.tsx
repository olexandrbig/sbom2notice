import Landing from "@/components/landing";

export const metadata = {
  title: "SBOM to NOTICE | Local-first builder",
  description:
    "Generate and edit NOTICE files from your SBOM entirely in the browser. No uploads. GDPR-friendly by design.",
  openGraph: {
    title: "SBOM to NOTICE | Local-first builder",
    description:
      "Generate and edit NOTICE files from your SBOM entirely in the browser. No uploads. GDPR-friendly by design.",
    url: "https://trustsource.io/",
    siteName: "SBOM to NOTICE",
    images: [],
    locale: "en_US",
    type: "website"
  },
  alternates: { canonical: "https://trustsource.io/" }
};

export default function Page() {
  return <Landing />;
}
