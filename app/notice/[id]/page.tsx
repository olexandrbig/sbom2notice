import type { Metadata } from "next";
import NoticeEditor from "@/components/noticeEditor";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(
  { params }: { params: PageProps["params"] }
): Promise<Metadata> {
  const { id } = await params;
  const title = `Notice file - ${id}`;
  return {
    title,
    description: "View and edit Notice File",
    alternates: { canonical: `/notice/${id}` },
    openGraph: { title, type: "article" }
  };
}

export default async function NoticePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <main className="container min-h-[calc(100vh-200px)] mx-auto py-10">
      <NoticeEditor id={id} />
    </main>
  );
}
