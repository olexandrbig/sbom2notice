"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import NoticeList from "@/components/noticeList";
import NoticeEditor from "@/components/noticeEditor";

export default function NoticePageClient() {
  const sp = useSearchParams();
  const id = sp.get("id");

  useEffect(() => {
    if (!id) return;
    const prev = document.title;
    document.title = `Notice file - ${id}`;
    return () => { document.title = prev; };
  }, [id]);

  return id ? <NoticeEditor id={id} /> : <NoticeList />;
}
