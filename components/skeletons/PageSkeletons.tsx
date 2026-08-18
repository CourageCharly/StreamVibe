export function CatalogSkeleton() {
  return (
    <div className="w-full pt-[var(--header-h)]">
      <div className="page-container space-y-6 py-6 sm:py-8">
        <div className="h-[min(88vw,420px)] animate-pulse rounded-2xl bg-[#1A1A1A] sm:h-[480px]" />
        <div className="h-7 w-40 animate-pulse rounded bg-[#1A1A1A]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] animate-pulse rounded-xl bg-[#1A1A1A]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="w-full pt-[var(--header-h)]">
      <div className="page-container space-y-6 py-6 sm:py-8">
        <div className="h-4 w-40 animate-pulse rounded bg-[#1A1A1A]" />
        <div className="h-[min(88vw,460px)] animate-pulse rounded-2xl bg-[#1A1A1A] sm:min-h-[480px] lg:min-h-[560px]" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="h-40 animate-pulse rounded-xl bg-[#1A1A1A]" />
            <div className="h-36 animate-pulse rounded-xl bg-[#1A1A1A]" />
            <div className="h-48 animate-pulse rounded-xl bg-[#1A1A1A]" />
          </div>
          <div className="h-80 animate-pulse rounded-xl bg-[#1A1A1A]" />
        </div>
      </div>
    </div>
  );
}

export function SimplePageSkeleton() {
  return (
    <div className="w-full pt-[var(--header-h)]">
      <div className="page-container space-y-4 py-8 sm:py-12">
        <div className="h-8 w-48 animate-pulse rounded bg-[#1A1A1A]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#1A1A1A]" />
      </div>
    </div>
  );
}
