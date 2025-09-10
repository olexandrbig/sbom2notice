import ImprintContent from "@/components/pages/ImprintContent";

export const metadata = {
  title: "Imprint | SBOM to NOTICE",
  description: "Legal Imprint for SBOM to NOTICE browser-only application."
};

export default function ImprintPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] mx-auto max-w-3xl flex-col pt-12">
      <ImprintContent />
    </main>
  );
}
