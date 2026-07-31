"use client";

import { useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";
import { FAQS } from "@/lib/constants";
import SectionHeading from "@/components/SectionHeading";
import Button from "@/components/ui/Button";
import RedGradientOverlay from "@/components/RedGradientOverlay";

type Props = {
  /** CTA for Ask a Question — support page uses #contact */
  askHref?: string;
};

export default function FAQ({ askHref = "/support" }: Props) {
  const [openId, setOpenId] = useState<string>("");

  const left = FAQS.slice(0, 4);
  const right = FAQS.slice(4);

  const renderItem = (
    item: (typeof FAQS)[number],
    isLast: boolean,
  ) => {
    const open = openId === item.id;
    return (
      <div key={item.id} className="relative py-5 first:pt-0">
        <button
          type="button"
          className="flex w-full min-w-0 cursor-pointer items-start gap-3 text-left sm:gap-4"
          onClick={() => setOpenId(open ? "" : item.id)}
          aria-expanded={open}
        >
          {/* Number box: fill #1F1F1F, stroke #262626 */}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#262626] bg-[#1F1F1F] text-sm font-semibold text-white sm:h-12 sm:w-12 sm:text-base">
            {item.id}
          </span>
          <div className="min-w-0 flex-1 pt-1.5 sm:pt-2.5">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 flex-1 whitespace-normal text-base font-medium leading-snug text-white sm:text-lg">
                {item.questionLines ? (
                  <>
                    {/* Mobile: fixed 2 lines · Desktop: one line */}
                    <span className="block sm:inline">
                      {item.questionLines[0]}{" "}
                    </span>
                    <span className="block sm:inline">
                      {item.questionLines[1]}
                    </span>
                  </>
                ) : (
                  item.question
                )}
              </span>
              <span className="mt-0.5 shrink-0 text-white" aria-hidden>
                {open ? (
                  <FiMinus className="h-5 w-5" />
                ) : (
                  <FiPlus className="h-5 w-5" />
                )}
              </span>
            </div>
            <div className={`faq-answer ${open ? "open" : ""}`}>
              <div>
                <p className="pt-3 text-[14px] font-normal leading-relaxed text-subtext">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        </button>

        {/* Divider: red gradient line (not last item) */}
        {!isLast ? (
          <div className="relative mt-5 h-px w-full overflow-hidden">
            <RedGradientOverlay />
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <section id="faq" className="page-section">
      <SectionHeading
        title="Frequently Asked Questions"
        description={
          <>
            <span className="sm:hidden">
              Got questions? We&apos;ve got answers! Check out our FAQ
              <br />
              section to find answers to the most common questions
              <br />
              about StreamVibe.
            </span>
            <span className="hidden sm:inline">
              Got questions? We&apos;ve got answers! Check out our FAQ section to
              find answers to the most common questions about StreamVibe.
            </span>
          </>
        }
        action={<Button href={askHref}>Ask a Question</Button>}
      />

      <div className="grid w-full min-w-0 grid-cols-1 gap-x-10 gap-y-2 lg:grid-cols-2">
        <div className="min-w-0 overflow-hidden">
          {left.map((item, i) => renderItem(item, i === left.length - 1))}
        </div>
        <div className="min-w-0 overflow-hidden">
          {right.map((item, i) => renderItem(item, i === right.length - 1))}
        </div>
      </div>
    </section>
  );
}
