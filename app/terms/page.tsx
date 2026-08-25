import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, {
  LegalList,
  LegalSection,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Read the StreamVibe Terms of Use governing your access to our streaming service, accounts, and subscriptions.",
};

const UPDATED = "26 August 2026";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Use"
      description="These Terms of Use govern your access to and use of StreamVibe, including our website, apps, and subscription plans."
      updated={UPDATED}
    >
      <LegalSection title="1. Acceptance of terms">
        <p>
          StreamVibe (“we”, “us”, or “our”) provides an on-demand streaming
          experience for movies and TV shows. By creating an account, starting a
          free trial, purchasing a plan, or using StreamVibe, you agree to these
          Terms of Use and to our{" "}
          <Link href="/privacy" className="text-white hover:text-cta">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className="text-white hover:text-cta">
            Cookie Policy
          </Link>
          . If you do not agree, do not use the service.
        </p>
        <p>
          You must be at least 18 years old, or the age of majority in your
          country, to create an account. If you are under that age, you may use
          StreamVibe only with a parent or guardian who accepts these terms.
        </p>
      </LegalSection>

      <LegalSection title="2. The StreamVibe service">
        <p>
          StreamVibe lets you browse, search, and watch movies and shows, manage
          a personal list, leave reviews, and stream on supported devices. Titles
          and availability can change. Some features — including playback — may
          require a registered account and an active plan or trial.
        </p>
        <p>
          Catalog information (titles, artwork, synopses, ratings, and related
          metadata) may be supplied by third parties such as The Movie Database
          (TMDB). Trailers and other video may be delivered through YouTube or
          similar providers. We do not claim ownership of those third-party
          materials.
        </p>
      </LegalSection>

      <LegalSection title="3. Your account">
        <p>
          You are responsible for the information you provide, for keeping your
          password confidential, and for all activity on your account. You may
          also sign in with Google. Notify us immediately if you believe your
          account has been used without permission.
        </p>
        <LegalList
          items={[
            "Use a valid email address you control.",
            "Do not share your login or allow others to use your account except as allowed on a Family Sharing plan.",
            "Keep your payment and profile details up to date.",
            "You may delete your account at any time from Settings, subject to any outstanding subscription period.",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Subscriptions, trials, and billing">
        <p>
          StreamVibe offers Basic, Standard, and Premium plans billed monthly or
          yearly, plus a free trial where advertised. Plan features (including
          video quality, number of devices, ads, and family sharing) are
          described on the Subscriptions page at the time you subscribe.
        </p>
        <LegalList
          items={[
            "By choosing a paid plan you authorize recurring charges until you cancel.",
            "Prices may change; we will give reasonable notice before a change applies to you.",
            "You can cancel at any time. Access typically continues until the end of the current billing period.",
            "Free trials convert to a paid plan unless you cancel before the trial ends.",
            "Taxes may apply depending on your location.",
          ]}
        />
        <p>
          Unless required by law, fees already paid are non-refundable. If a
          charge fails, we may suspend access until payment is completed.
        </p>
      </LegalSection>

      <LegalSection title="5. License to stream">
        <p>
          We grant you a limited, personal, non-exclusive, non-transferable
          license to stream available titles for your private, non-commercial
          use, in accordance with your plan. You may not copy, download (except
          where Offline Viewing is offered on your plan), redistribute, publicly
          perform, or reverse engineer the service or its content except as
          allowed by law.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceptable use">
        <p>You agree not to:</p>
        <LegalList
          items={[
            "Use StreamVibe for any illegal purpose or in violation of others’ rights.",
            "Circumvent geographic, device, or plan limits, or share access beyond your plan.",
            "Upload malware, scrape the service in bulk, or interfere with our systems.",
            "Post reviews or other content that is unlawful, abusive, defamatory, or infringing.",
            "Misrepresent your identity or attempt to access another member’s account.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Reviews and user content">
        <p>
          If you post a review or other content, you grant StreamVibe a
          worldwide, royalty-free license to host, display, and distribute that
          content in connection with the service. You remain responsible for
          what you post. We may remove content that violates these terms or our
          community standards.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          StreamVibe, our logos, and the design of the service are our
          trademarks and intellectual property. Movie and show titles, artwork,
          and related marks belong to their respective owners. Third-party
          trademarks appear for identification only.
        </p>
      </LegalSection>

      <LegalSection title="9. Third-party services">
        <p>
          The service may include Google Sign-In, TMDB data, YouTube playback,
          payment processors, and email providers. Their terms and privacy
          policies apply to your use of those services. We are not responsible
          for third-party sites or outages outside our control.
        </p>
      </LegalSection>

      <LegalSection title="10. Disclaimers">
        <p>
          StreamVibe is provided “as is” and “as available.” We do not warrant
          that the service will be uninterrupted, error-free, or that every
          title will remain available. To the fullest extent permitted by law,
          we disclaim implied warranties of merchantability, fitness for a
          particular purpose, and non-infringement.
        </p>
      </LegalSection>

      <LegalSection title="11. Limitation of liability">
        <p>
          To the fullest extent permitted by law, StreamVibe and its operators
          will not be liable for indirect, incidental, special, consequential,
          or punitive damages, or for lost profits, data, or goodwill, arising
          from your use of the service. Our total liability for any claim is
          limited to the amount you paid us in the twelve months before the
          claim, or fifty US dollars, whichever is greater.
        </p>
      </LegalSection>

      <LegalSection title="12. Termination">
        <p>
          You may stop using StreamVibe at any time. We may suspend or close
          accounts that violate these terms, create risk, or remain unpaid. On
          termination, your license to stream ends. Sections that by nature
          should survive (including intellectual property, disclaimers, and
          liability limits) will survive.
        </p>
      </LegalSection>

      <LegalSection title="13. Changes">
        <p>
          We may update these Terms of Use. The “Last updated” date will change
          when we do. Continued use after an update means you accept the revised
          terms. If a change is material, we will try to provide additional
          notice, such as an email or an in-service message.
        </p>
      </LegalSection>

      <LegalSection title="14. Contact">
        <p>
          Questions about these terms: visit{" "}
          <Link href="/support" className="text-white hover:text-cta">
            Support
          </Link>{" "}
          or email Couragelivingstone1@gmail.com.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
