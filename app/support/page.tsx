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
      <SectionBack
        allowed={["faq"]}
        legacyHomeAs="faq"
        wrapperClassName="page-container pt-6 sm:pt-8"
      />
      <div className="page-container bg-[#141414] pt-0 pb-5 sm:pb-7">
        <SupportContact posters={posters} />
      </div>

      <FAQ askHref="#contact" />

      <FreeTrialBanner posters={posters.slice(0, 12)} />
    </div>
  );
}
