import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, {
  LegalList,
  LegalSection,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how StreamVibe uses cookies and similar technologies to run the service, remember preferences, and keep you signed in.",
};

const UPDATED = "26 August 2026";

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie Policy"
      description="This Cookie Policy explains how StreamVibe uses cookies and similar technologies. It should be read with our Privacy Policy."
      updated={UPDATED}
    >
      <LegalSection title="1. What cookies are">
        <p>
          Cookies are small text files stored on your device when you visit a
          website. Similar technologies include local storage, session storage,
          and pixels. We use “cookies” here to cover all of these.
        </p>
        <p>
          Some cookies are set by StreamVibe (first-party). Others may be set by
          partners such as Google or YouTube when you sign in or play a trailer
          (third-party).
        </p>
      </LegalSection>

      <LegalSection title="2. How we use cookies">
        <p>We use cookies for the following purposes.</p>
      </LegalSection>

      <LegalSection title="Essential cookies">
        <p>
          These are required for StreamVibe to work. You cannot turn them off
          from the service without breaking sign-in or playback.
        </p>
        <LegalList
          items={[
            "Session and authentication: keeping you signed in securely after login, signup, or Google Sign-In.",
            "Security: protecting forms and accounts against abuse.",
            "Load balancing and basic site operation.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Preference cookies">
        <p>
          These remember choices so the service feels consistent on your next
          visit.
        </p>
        <LegalList
          items={[
            "Playback preferences such as captions language where saved on your device.",
            "My List, likes, watch history, and similar on-device lists.",
            "UI choices such as last selected Movies or Shows tab.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Performance and analytics cookies">
        <p>
          These help us understand how StreamVibe is used (for example which
          pages are visited) so we can improve the product. They do not identify
          you by name on their own. We use them only as needed to operate and
          improve the service.
        </p>
      </LegalSection>

      <LegalSection title="3. Third-party cookies">
        <p>When you use certain features, third parties may set cookies:</p>
        <LegalList
          items={[
            "Google: if you Sign in with Google, Google may set cookies according to Google’s policies.",
            "YouTube: trailers and playback embeds may set cookies for video delivery and, depending on your Google settings, viewing preferences.",
            "Payment or email providers, if you complete a purchase or receive a reset code.",
          ]}
        />
        <p>
          We do not control third-party cookies. See their privacy and cookie
          notices for details.
        </p>
      </LegalSection>

      <LegalSection title="4. How long cookies last">
        <p>
          Session cookies expire when you close your browser. Persistent cookies
          remain until they expire or you delete them. Authentication cookies
          last for the length of your signed-in session (up to about seven days
          unless you log out). On-device lists may remain until you clear site
          data.
        </p>
      </LegalSection>

      <LegalSection title="5. Managing cookies">
        <p>
          You can control cookies in your browser: block them, delete them, or
          get alerts before they are stored. Blocking essential cookies will
          prevent sign-in and some playback features.
        </p>
        <p>
          Most browsers include a help page for cookies (Chrome, Safari, Edge,
          Firefox). You can also use your device settings and, where available,
          industry opt-out tools for advertising cookies — StreamVibe does not
          rely on advertising cookies for its core experience.
        </p>
      </LegalSection>

      <LegalSection title="6. Changes">
        <p>
          We may update this Cookie Policy when we add features or partners. The
          “Last updated” date will change when we do.
        </p>
      </LegalSection>

      <LegalSection title="7. Contact">
        <p>
          Cookie questions:{" "}
          <Link href="/support" className="text-white hover:text-cta">
            Support
          </Link>{" "}
          or Couragelivingstone1@gmail.com. See also our{" "}
          <Link href="/privacy" className="text-white hover:text-cta">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-white hover:text-cta">
            Terms of Use
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
