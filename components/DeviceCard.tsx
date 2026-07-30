import Image from "next/image";
import GradientOverlay from "@/components/GradientOverlay";

type DeviceCardProps = {
  title: string;
  description: string;
  iconSrc: string;
};

/**
 * Device card — fluid width up to 413px, min-height 230px.
 * Always fits parent column (no horizontal overflow).
 */
export default function DeviceCard({
  title,
  description,
  iconSrc,
}: DeviceCardProps) {
  return (
    <article className="relative box-border flex h-full min-h-[230px] w-full min-w-0 max-w-full flex-col justify-center overflow-hidden rounded-xl border border-[#262626] bg-[#0F0F0F] px-5 py-5 sm:px-6 sm:py-6">
      <GradientOverlay variant="accent" />

      <div className="relative z-10 flex min-w-0 flex-col justify-center">
        <div className="mb-4 flex min-w-0 items-center gap-3 sm:gap-4">
          {/* Fixed 54×54 container — same size for every device icon */}
          <span className="relative inline-flex h-[54px] w-[54px] shrink-0 items-center justify-center overflow-hidden">
            <Image
              src={iconSrc}
              alt=""
              width={54}
              height={54}
              className="h-[54px] w-[54px] max-h-[54px] max-w-[54px] object-contain"
              aria-hidden
            />
          </span>
          <h3 className="min-w-0 truncate text-[16px] font-semibold text-white">
            {title}
          </h3>
        </div>
        <p className="text-[14px] font-normal leading-relaxed text-subtext">
          {description}
        </p>
      </div>
    </article>
  );
}
