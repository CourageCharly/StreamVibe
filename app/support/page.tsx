import type { Metadata } from "next";
import FAQ from "@/components/FAQ";
import FreeTrialBanner from "@/components/FreeTrialBanner";
import SupportContact from "@/components/SupportContact";
import SectionBack from "@/components/SectionBack";
import { fetchPopularMovies } from "@/lib/api";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Welcome to StreamVibe support — contact us and browse frequently asked questions.",
};

/**
 * Support page.
 * Back arrow only when arriving from home FAQ (`?from=faq`).
 */
export default async function SupportPage() {
  const popular = await fetchPopularMovies();
  const posters = popular.slice(0, 16);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-[#141414] pt-[var(--header-h)]">
      <div className="page-container bg-[#141414] py-8 sm:py-10 md:py-12">
        <SectionBack
          allowed={["faq"]}
          legacyHomeAs="faq"
          wrapperClassName="mb-6 sm:mb-8"
        />
        <SupportContact posters={posters} />
      </div>

      <FAQ askHref="#contact" />

      <FreeTrialBanner posters={posters.slice(0, 12)} />
    </div>
  );
}
