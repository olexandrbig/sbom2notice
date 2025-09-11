export default function Loading() {
  return (
    <main className="container min-h-[calc(100vh-200px)] mx-auto py-10">
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="h-6 w-40 rounded bg-muted animate-pulse" />
        <div className="rounded-xl border">
          <div className="h-12 border-b bg-muted/30 animate-pulse" />
          <div className="h-12 border-b bg-muted/10 animate-pulse" />
          <div className="h-12 bg-muted/10 animate-pulse" />
        </div>
      </div>
    </main>
  );
}
