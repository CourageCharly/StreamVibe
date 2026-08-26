"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "@/components/auth/RequireAuth";
import { ReviewSkeleton } from "@/components/skeletons/PageSkeletons";
import BackLink from "@/components/BackLink";
import ReviewComposer from "@/components/ReviewComposer";
import { markReviewSuccess } from "@/lib/reviews";

type Props = {
  mediaId: number;
  mediaType: "movie" | "tv";
  title: string;
  backHref: string;
};

export default function ReviewWriteView({
  mediaId,
  mediaType,
  title,
  backHref,
}: Props) {
  return (
    <RequireAuth fallback={<ReviewSkeleton />}>
      <ReviewWriteInner
        mediaId={mediaId}
        mediaType={mediaType}
        title={title}
        backHref={backHref}
      />
    </RequireAuth>
  );
}

function ReviewWriteInner({ mediaId, mediaType, title, backHref }: Props) {
  const router = useRouter();

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden pt-[var(--header-h)]">
      <div className="page-container py-8 sm:py-10">
        <div className="mb-4 flex min-w-0 items-center gap-2">
          <BackLink
            href={backHref}
            fallbackHref={backHref}
            replace
            aria-label="Back"
          />
          <p className="truncate text-sm font-medium text-cta">{title}</p>
        </div>
        <h1 className="text-[20px] font-bold leading-tight text-white sm:text-[28px]">
          Add Your Review
        </h1>
        <p className="mt-2 text-[14px] text-[#999999] sm:text-[16px]">
          Rate this title and share what you thought.
        </p>
        <div className="mt-8 max-w-lg">
          <ReviewComposer
            mediaId={mediaId}
            mediaType={mediaType}
            title={title}
            onPosted={() => {
              markReviewSuccess(backHref);
              router.replace(backHref);
            }}
          />
        </div>
      </div>
    </div>
  );
}
