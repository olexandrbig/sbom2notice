import NoticeList from "@/components/noticeList";

export const metadata = {
  title: "Notice Files",
  description: "Your local Notice Files",
};

export default function Page() {
  return (
    <main className="container min-h-[calc(100vh-200px)] mx-auto py-10">
      <NoticeList />
    </main>
  );
}
