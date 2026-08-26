export function HomeSkeleton() {
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-x-hidden">
      <div className="h-[min(88vw,460px)] w-full animate-pulse bg-[#1A1A1A] sm:h-[480px] lg:h-[560px]" />
      <div className="page-section space-y-8">
        <div className="h-7 w-48 animate-pulse rounded bg-[#1A1A1A] sm:h-8" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
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

export function CatalogSkeleton() {
  return (
    <div className="w-full pt-[var(--header-h)]">
      <div className="page-container space-y-6 pt-8 pb-5 sm:pt-10 sm:pb-7">
        <div className="cinema-frame animate-pulse bg-[#1A1A1A]" />
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
        <div className="cinema-frame animate-pulse bg-[#1A1A1A]" />
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

function Pulse({
  className,
  onCard,
}: {
  className: string;
  onCard?: boolean;
}) {
  return (
    <div
      className={`animate-pulse rounded ${onCard ? "bg-[#262626]" : "bg-[#1A1A1A]"} ${className}`}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <Pulse className="h-7 w-28 sm:h-8" />
        <Pulse className="mt-2 h-4 w-64 sm:w-96" />

        <div className="mt-8 flex items-center gap-4">
          <Pulse className="h-16 w-16 shrink-0 rounded-full sm:h-20 sm:w-20" />
          <div className="min-w-0 flex-1 space-y-2">
            <Pulse className="h-5 w-40 sm:h-6" />
            <Pulse className="h-4 w-48" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#262626] bg-[#1A1A1A] px-3 py-4"
            >
              <Pulse onCard className="mx-auto h-6 w-10 sm:h-7" />
              <Pulse onCard className="mx-auto mt-2 h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <Pulse className="h-7 w-32 sm:h-8" />
        <Pulse className="mt-2 h-4 w-full max-w-md sm:max-w-xl" />

        <div className="mt-6 overflow-hidden rounded-2xl border border-[#262626] bg-[#1A1A1A]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className={i === 0 ? "" : "border-t border-[#262626]"}
            >
              <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0 flex-1 space-y-2">
                  <Pulse onCard className="h-4 w-28 sm:h-[18px] sm:w-36" />
                  <Pulse onCard className="h-3 w-40 sm:w-52" />
                </div>
                <Pulse onCard className="h-5 w-5 shrink-0" />
              </div>
              {i === 0 ? (
                <div className="space-y-2 border-t border-[#262626] px-4 py-4 sm:px-5">
                  <Pulse onCard className="h-4 w-36" />
                  <Pulse onCard className="h-4 w-48" />
                  <Pulse onCard className="h-4 w-24" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationsSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <Pulse className="h-7 w-44 sm:h-8" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <Pulse className="h-4 min-w-0 flex-1 max-w-md sm:max-w-lg" />
          <Pulse className="h-4 w-24 shrink-0" />
        </div>

        <ul className="mt-6 overflow-hidden rounded-2xl border border-[#262626] bg-[#1A1A1A]">
          {Array.from({ length: 5 }).map((_, i) => (
            <li
              key={i}
              className={i === 0 ? "" : "border-t border-[#262626]"}
            >
              <div className="flex gap-3 px-4 py-4 sm:px-5">
                <Pulse onCard className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Pulse onCard className="h-4 w-2/3 max-w-xs" />
                    <Pulse onCard className="h-8 w-8 shrink-0 rounded-lg" />
                  </div>
                  <Pulse onCard className="mt-2 h-3.5 w-full max-w-md" />
                  <Pulse onCard className="mt-2 h-3 w-16" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AuthCardSkeleton() {
  return (
    <div className="w-full min-w-0 bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div className="mx-auto w-full max-w-[640px] rounded-2xl border border-[#262626] bg-[#0F0F0F] p-5 sm:p-6 md:p-8">
          <Pulse className="h-7 w-36 sm:h-8 sm:w-44" />
          <Pulse className="mt-2 h-4 w-full max-w-sm" />
          <div className="mt-6 space-y-4">
            <Pulse className="h-12 w-full rounded-lg" />
            <Pulse className="h-12 w-full rounded-lg" />
            <Pulse className="h-[49px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function WatchSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container space-y-5 py-4 sm:space-y-8 sm:py-6 md:space-y-10 md:py-8">
        <Pulse className="h-4 w-28" />
        <div className="cinema-frame watch-fill animate-pulse bg-[#1A1A1A]" />
        <Pulse className="h-7 w-2/3 max-w-lg sm:h-8" />
        <Pulse className="h-4 w-full max-w-2xl" />
        <div className="flex gap-3">
          <Pulse className="h-10 w-28 rounded-lg" />
          <Pulse className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <Pulse className="h-4 w-40" />
        <Pulse className="mt-4 h-7 w-48 sm:h-8" />
        <Pulse className="mt-2 h-4 w-64" />
        <div className="mt-6 space-y-4 rounded-2xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-6">
          <Pulse onCard className="h-5 w-32" />
          <Pulse onCard className="h-32 w-full rounded-lg" />
          <Pulse onCard className="h-[49px] w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-section space-y-8">
        <div>
          <Pulse className="h-7 w-64 sm:h-8 sm:w-80" />
          <Pulse className="mt-2 h-4 w-full max-w-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-[#262626] bg-[#1A1A1A]"
            />
          ))}
        </div>
      </div>
      <div className="page-section">
        <Pulse className="h-64 w-full rounded-xl" />
      </div>
      <div className="page-section">
        <div className="h-[210px] animate-pulse rounded-[12px] bg-[#1A1A1A] sm:min-h-[210px]" />
      </div>
    </div>
  );
}

export function SupportSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container bg-[#141414] py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Pulse className="h-72 w-full rounded-xl" />
          <Pulse className="h-72 w-full rounded-xl" />
        </div>
      </div>
      <div className="page-section space-y-6">
        <Pulse className="h-7 w-64 sm:h-8" />
        <Pulse className="h-40 w-full rounded-xl" />
      </div>
      <div className="page-section">
        <div className="h-[210px] animate-pulse rounded-[12px] bg-[#1A1A1A]" />
      </div>
    </div>
  );
}

export function LegalSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <Pulse className="h-4 w-64" />
        <Pulse className="mt-6 h-8 w-56 sm:h-9" />
        <Pulse className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-8 space-y-3">
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
