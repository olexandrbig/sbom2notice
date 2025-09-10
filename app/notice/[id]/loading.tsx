export default function Loading() {
  return (
    <main className="container min-h-[calc(100vh-200px)] mx-auto py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-40 rounded bg-muted animate-pulse" />
            <div className="mt-2 h-4 w-56 rounded bg-muted/70 animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-36 rounded bg-muted animate-pulse" />
            <div className="h-9 w-40 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="h-[420px] rounded-xl border bg-muted/30 p-4">
          <div className="h-full w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    </main>
  );
}
