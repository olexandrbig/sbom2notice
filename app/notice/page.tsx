// app/notice/page.tsx
import type { Metadata } from "next";
import NoticePageClient from "@/components/noticePageClient";

export const metadata: Metadata = {
  title: "Notice Files",
  description: "Your local Notice Files",
};

export default function Page() {
  return (
    <main className="container min-h-[calc(100vh-200px)] mx-auto py-10">
      <NoticePageClient />
    </main>
  );
}
