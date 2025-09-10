import TermsContent from "@/components/pages/TermsContent";

export const metadata = {
  title: "Terms of Service | SBOM to NOTICE",
  description: "Terms of Service for SBOM to NOTICE browser-only application."
};

export default function TermsPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] mx-auto max-w-3xl flex-col pt-12">
      <TermsContent />
    </main>
  );
}
