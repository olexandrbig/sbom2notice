import Landing from "@/components/landing";

export const metadata = {
  title: "SBOM to NOTICE | Local-first builder",
  description:
    "Generate and edit NOTICE files from your SBOM entirely in the browser. No uploads. GDPR-friendly by design.",
  openGraph: {
    title: "SBOM to NOTICE | Local-first builder",
    description:
      "Generate and edit NOTICE files from your SBOM entirely in the browser. No uploads. GDPR-friendly by design.",
    siteName: "SBOM to NOTICE",
    locale: "en_US",
    type: "website"
  }
};

export default function Page() {
  return <Landing />;
}
