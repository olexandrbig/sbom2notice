import PrivacyContent from "@/components/pages/PrivacyContent";

export const metadata = {
  title: "Privacy Policy | SBOM to NOTICE",
  description: "Privacy Policy for SBOM to NOTICE browser-only application."
};

export default function PrivacyPage() {
  return (
    <main className="flex min-h-[calc(100vh-200px)] mx-auto max-w-3xl flex-col pt-12">
      <PrivacyContent />
    </main>
  );
}
