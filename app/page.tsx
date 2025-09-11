import Landing from "@/components/landing";
import {Metadata} from "next";

export const metadata: Metadata = {
  title: "SBOM to NOTICE",
  description:
    "Generate and edit NOTICE files from your SBOM entirely in the browser. No uploads. GDPR-friendly by design."
};

export default function Page() {
  return <Landing />;
}
