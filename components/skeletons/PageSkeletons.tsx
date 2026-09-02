import type { ReactNode } from "react";

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

const actionBtnPulse =
  "h-10 w-10 shrink-0 rounded-lg border border-[#262626] bg-[#0F0F0F] sm:h-12 sm:w-12";

/** Idle cinema overlay — same stack as MoviesHero / detail / watch. */
function CinemaHeroSkeleton({ slider = false }: { slider?: boolean }) {
  return (
    <div className="cinema-frame animate-pulse bg-[#1A1A1A]">
      <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
      <div className="absolute inset-0 z-10 flex h-full w-full flex-col items-center justify-end px-4 pb-6 pt-20 text-center sm:px-6 sm:pb-8 md:px-8 lg:pb-10">
        <Pulse className="h-7 w-2/3 max-w-lg sm:h-8 sm:w-80" />
        <Pulse className="mt-2.5 hidden h-4 w-full max-w-2xl sm:mt-3 sm:block" />
        <div className="mt-6 flex w-full max-w-2xl flex-wrap items-center justify-center gap-2 sm:mt-6 sm:w-auto sm:max-w-none sm:gap-3">
          <Pulse className="h-[49px] w-full max-w-2xl rounded-lg sm:w-[140px] sm:max-w-none" />
          <Pulse className={actionBtnPulse} />
          <Pulse className={actionBtnPulse} />
          <Pulse className={actionBtnPulse} />
        </div>
        {slider ? (
          <div className="mt-8 hidden w-full sm:block">
            <Pulse className="mx-auto h-2 w-48 rounded-full" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Description / cast / reviews + sidebar — same grid as watch + detail. */
function TitleInfoGridSkeleton() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 bg-[#141414] sm:gap-5 lg:grid-cols-3 lg:gap-6">
      <div className="min-w-0 space-y-4 sm:space-y-5 lg:col-span-2">
        <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
          <Pulse onCard className="mb-3 h-[13px] w-24 sm:mb-4" />
          <Pulse onCard className="h-3 w-full" />
          <Pulse onCard className="mt-2 h-3 w-5/6" />
          <Pulse onCard className="mt-2 h-3 w-2/3" />
        </section>

        <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
            <Pulse onCard className="h-[13px] w-12" />
            <div className="flex gap-2">
              <Pulse onCard className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />
              <Pulse onCard className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />
            </div>
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[72px] shrink-0 text-center">
                <Pulse onCard className="mx-auto h-16 w-16 rounded-full" />
                <Pulse onCard className="mx-auto mt-2 h-3 w-14" />
              </div>
            ))}
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-5 md:p-6">
          <Pulse onCard className="mb-3 h-[13px] w-20 sm:mb-4" />
          <Pulse onCard className="h-24 w-full rounded-lg" />
        </section>
      </div>

      <aside className="min-w-0">
        <section className="min-w-0 space-y-4 rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:space-y-5 sm:p-5 md:p-6">
          <div>
            <Pulse onCard className="mb-2 h-[13px] w-28" />
            <Pulse onCard className="h-5 w-16" />
          </div>
          <div>
            <Pulse onCard className="mb-2 h-[13px] w-40" />
            <div className="flex flex-wrap gap-2">
              <Pulse onCard className="h-7 w-16 rounded-md" />
              <Pulse onCard className="h-7 w-20 rounded-md" />
              <Pulse onCard className="h-7 w-14 rounded-md" />
            </div>
          </div>
          <div>
            <Pulse onCard className="mb-2 h-[13px] w-16" />
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5">
                <Pulse className="mb-1 h-3 w-10" />
                <Pulse className="h-4 w-20" />
              </div>
              <div className="rounded-lg border border-[#262626] bg-[#141414] px-3 py-2.5">
                <Pulse className="mb-1 h-3 w-16" />
                <Pulse className="h-4 w-20" />
              </div>
            </div>
          </div>
          <div>
            <Pulse onCard className="mb-2 h-[13px] w-16" />
            <div className="flex flex-wrap gap-2">
              <Pulse onCard className="h-7 w-16 rounded-md" />
              <Pulse onCard className="h-7 w-20 rounded-md" />
            </div>
          </div>
          <div>
            <Pulse onCard className="mb-2 h-[13px] w-20" />
            <div className="flex items-center gap-3 rounded-lg border border-[#262626] bg-[#141414] p-3">
              <Pulse className="h-11 w-11 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Pulse className="h-4 w-24" />
                <Pulse className="h-3 w-16" />
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}

function BannerSkeleton() {
  return (
    <div className="page-section">
      <div className="h-[210px] animate-pulse rounded-[12px] bg-[#1A1A1A] sm:min-h-[210px]" />
    </div>
  );
}

function MediaCardRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-[260px] w-[min(220px,75%)] shrink-0 animate-pulse rounded-xl border border-[#1F1F1F] bg-[#1A1A1A] sm:h-[317px] sm:w-[285px]"
        />
      ))}
    </div>
  );
}

function MoviesShowsChromeSkeleton({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-14 sm:gap-16 lg:gap-24">
      <div className="w-full lg:hidden">
        <div
          className="flex w-full items-center gap-1 rounded-xl border-[3px] border-[#1F1F1F] bg-navbar p-1"
          aria-hidden
        >
          <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-[#1A1A1A]" />
          <div className="h-9 min-w-0 flex-1 animate-pulse rounded-lg bg-[#1A1A1A]" />
        </div>
      </div>
      <div className="relative w-full min-w-0">
        <span
          className="relative z-10 mb-4 hidden h-7 w-[4.75rem] animate-pulse rounded bg-[#1A1A1A] lg:absolute lg:-top-3 lg:left-6 lg:mb-0 lg:inline-block"
          aria-hidden
        />
        <div className="h-full w-full bg-transparent lg:rounded-xl lg:border lg:border-[#262626] lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-x-hidden">
      <section className="relative w-full min-w-0 max-w-full overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-[#1A1A1A]" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_bottom,rgba(20,20,20,0.35),rgba(20,20,20,0.5),#141414)]" />
        <div className="page-container relative z-[2] flex min-w-0 flex-col items-center text-center h-[min(100svh,680px)] justify-center pt-[calc(var(--header-h)+clamp(2rem,4vw,4rem))] pb-0 sm:h-auto sm:min-h-[min(100dvh,880px)] sm:justify-end sm:pb-[clamp(2rem,4vw,4rem)]">
          <Pulse className="mb-8 h-[min(42vw,168px)] w-[min(42vw,168px)] rounded-full sm:h-[160px] sm:w-[160px] md:h-[200px] md:w-[200px] lg:h-[220px] lg:w-[220px]" />
          <Pulse className="h-7 w-64 sm:h-10 sm:w-[28rem]" />
          <Pulse className="mt-2 h-4 w-full max-w-xl" />
          <Pulse className="mt-6 h-[49px] w-[min(100%,209px)] rounded-lg sm:h-[52px] sm:w-[200px]" />
        </div>
      </section>

      <section className="page-section !pt-1 sm:!pt-[clamp(2rem,4vw,4rem)] lg:!pt-[150px]">
        <Pulse className="h-7 w-72 sm:h-8 sm:w-96" />
        <Pulse className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-8">
          <MediaCardRowSkeleton count={5} />
        </div>
      </section>

      <section className="page-section">
        <Pulse className="h-7 w-80 sm:h-8 sm:w-[28rem]" />
        <Pulse className="mt-2 h-4 w-full max-w-lg" />
        <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Pulse key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      </section>

      <section className="page-section">
        <Pulse className="h-7 w-48 sm:h-8" />
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4">
              <Pulse className="h-10 w-10 shrink-0 rounded-lg sm:h-12 sm:w-12" />
              <div className="min-w-0 flex-1 space-y-2 pt-1.5">
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-section">
        <Pulse className="h-7 w-72 sm:h-8 sm:w-96" />
        <Pulse className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Pulse key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </section>

      <BannerSkeleton />
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container pt-8 pb-5 sm:pt-10 sm:pb-7">
        <div className="space-y-8 sm:space-y-10">
          <CinemaHeroSkeleton slider />
          <div className="mt-0 sm:mt-12 lg:mt-16">
            <MoviesShowsChromeSkeleton>
              <div className="space-y-7 sm:space-y-8">
                <div>
                  <Pulse className="mb-4 h-6 w-28" />
                  <MediaCardRowSkeleton count={5} />
                </div>
                <div>
                  <Pulse className="mb-4 h-6 w-36" />
                  <MediaCardRowSkeleton count={4} />
                </div>
              </div>
            </MoviesShowsChromeSkeleton>
          </div>
        </div>
      </div>
      <BannerSkeleton />
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container space-y-5 py-4 sm:space-y-8 sm:py-6 md:space-y-10 md:py-8">
        <nav className="flex min-w-0 items-center gap-2" aria-hidden>
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-4 w-28" />
        </nav>
        <CinemaHeroSkeleton />
        <TitleInfoGridSkeleton />
      </div>
      <BannerSkeleton />
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
        <nav className="flex min-w-0 items-center gap-2" aria-hidden>
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-4 w-28" />
        </nav>
        <CinemaHeroSkeleton />
        <TitleInfoGridSkeleton />
      </div>
      <BannerSkeleton />
    </div>
  );
}

export function ReviewSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <Pulse className="h-8 w-8 rounded-lg" />
          <Pulse className="h-4 w-40" />
        </div>
        <Pulse className="h-7 w-48 sm:h-8" />
        <Pulse className="mt-2 h-4 w-64" />
        <div className="mt-8 max-w-lg space-y-4">
          <Pulse className="h-[13px] w-24" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Pulse key={i} className="h-7 w-7" />
            ))}
          </div>
          <Pulse className="h-[13px] w-16" />
          <Pulse className="h-32 w-full rounded-lg" />
          <Pulse className="h-[49px] w-full rounded-lg" />
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
        <Pulse className="h-7 w-48 sm:h-8" />
        <Pulse className="mt-6 h-64 w-full rounded-xl" />
      </div>
      <BannerSkeleton />
    </div>
  );
}

export function SupportSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container bg-[#141414] py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Pulse className="h-72 w-full rounded-xl lg:h-[420px]" />
          <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-4 sm:p-6">
            <Pulse onCard className="h-6 w-40" />
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Pulse onCard className="h-12 w-full rounded-lg" />
              <Pulse onCard className="h-12 w-full rounded-lg" />
              <Pulse onCard className="h-12 w-full rounded-lg" />
              <Pulse onCard className="h-12 w-full rounded-lg" />
            </div>
            <Pulse onCard className="mt-4 h-28 w-full rounded-lg" />
            <Pulse onCard className="mt-4 h-[49px] w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="page-section space-y-6">
        <Pulse className="h-7 w-64 sm:h-8" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3 py-4">
              <Pulse className="h-10 w-10 shrink-0 rounded-lg sm:h-12 sm:w-12" />
              <div className="min-w-0 flex-1 space-y-2 pt-1.5">
                <Pulse className="h-4 w-2/3" />
                <Pulse className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BannerSkeleton />
    </div>
  );
}

export function LegalSkeleton() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Pulse className="h-4 w-24" />
          <Pulse className="h-4 w-28" />
          <Pulse className="h-4 w-24" />
        </div>
        <Pulse className="mt-6 h-7 w-56 sm:h-8" />
        <Pulse className="mt-2 h-4 w-full max-w-xl" />
        <Pulse className="mt-1 h-3 w-40" />
        <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Pulse className="h-5 w-48 sm:h-6" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-full" />
              <Pulse className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
