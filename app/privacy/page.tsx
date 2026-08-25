import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, {
  LegalList,
  LegalSection,
} from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how StreamVibe collects, uses, and protects your personal information when you use our streaming service.",
};

const UPDATED = "26 August 2026";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This Privacy Policy explains what information StreamVibe collects, how we use it, and the choices you have."
      updated={UPDATED}
    >
      <LegalSection title="1. Who we are">
        <p>
          StreamVibe operates a streaming website and related services. This
          policy applies when you visit StreamVibe, create an account, subscribe,
          contact support, or otherwise use the service. For cookies
          specifically, also read our{" "}
          <Link href="/cookies" className="text-white hover:text-cta">
            Cookie Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We may collect:</p>
        <LegalList
          items={[
            "Account details: name, email address, password (stored in hashed form), and profile image if you add one.",
            "Google Sign-In data: if you continue with Google, we receive your Google account ID, verified email, name, and profile picture.",
            "Subscription and billing-related information needed to manage your plan (plan type, billing period). Payment cards are processed by our payment partners, not stored in full on StreamVibe.",
            "Usage data: titles you watch or add to My List, watch history, likes, reviews, device type, and similar activity used to run the service.",
            "Support messages: the name, email, phone, and message you send through the Support form.",
            "Technical data: IP address, browser type, device identifiers, and cookies as described in the Cookie Policy.",
          ]}
        />
        <p>
          Movie and show catalog data is provided by TMDB and similar sources.
          That catalog is not your personal data, but your interactions with it
          (such as My List) are.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use information">
        <p>We use your information to:</p>
        <LegalList
          items={[
            "Create and secure your account, including password reset and email verification.",
            "Provide streaming, recommendations-style browsing, lists, history, and reviews.",
            "Process subscriptions, trials, and plan changes.",
            "Respond to support requests.",
            "Keep the service secure, prevent abuse, and debug problems.",
            "Meet legal obligations and enforce our Terms of Use.",
            "Communicate service updates, if you have an account (you can opt out of non-essential messages where required).",
          ]}
        />
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="4. Legal bases (where applicable)">
        <p>
          If you are in a region that requires a legal basis for processing
          (such as the EEA or UK), we rely on: performance of our contract with
          you; our legitimate interests in operating and securing StreamVibe;
          your consent where we ask for it (for example certain cookies); and
          compliance with law.
        </p>
      </LegalSection>

      <LegalSection title="5. How we share information">
        <p>We share information only as needed to run StreamVibe:</p>
        <LegalList
          items={[
            "Service providers: hosting, email delivery, and similar vendors who process data on our instructions.",
            "Google: if you use Google Sign-In, Google processes that authentication under its own policies.",
            "Content and playback partners: TMDB for catalog metadata; YouTube or similar for trailer playback.",
            "Authorities: when required by law or to protect StreamVibe, our users, or the public.",
            "Business transfers: if we reorganize or transfer the service, information may move with it under this policy.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Retention">
        <p>
          We keep account and subscription data while your account is active and
          for a reasonable period afterward (for example to complete billing,
          resolve disputes, or meet legal requirements). Support messages and
          logs are kept only as long as needed for those purposes. You can
          request deletion of your account through Settings or Support.
        </p>
      </LegalSection>

      <LegalSection title="7. Security">
        <p>
          We use technical and organizational measures appropriate to the
          service, including hashed passwords and encrypted sessions. No method
          of transmission or storage is completely secure. Use a strong unique
          password and protect your devices.
        </p>
      </LegalSection>

      <LegalSection title="8. Your choices and rights">
        <p>Depending on where you live, you may have the right to:</p>
        <LegalList
          items={[
            "Access, correct, or delete personal information we hold about you.",
            "Object to or restrict certain processing, or request portability of your data.",
            "Withdraw consent where processing is based on consent.",
            "Lodge a complaint with a data protection authority.",
          ]}
        />
        <p>
          You can update many account details in Profile and Settings. For other
          requests, use{" "}
          <Link href="/support" className="text-white hover:text-cta">
            Support
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="9. Children">
        <p>
          StreamVibe is not directed at children under 13 (or the equivalent
          minimum age in your country). We do not knowingly collect personal
          information from children below that age. If you believe we have, please
          contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="10. International transfers">
        <p>
          We may process information in countries other than your own. Where
          required, we use appropriate safeguards for those transfers.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes">
        <p>
          We may update this Privacy Policy. The “Last updated” date will change
          when we do. If a change is material, we will provide additional notice
          where required.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact">
        <p>
          Privacy questions:{" "}
          <Link href="/support" className="text-white hover:text-cta">
            Support
          </Link>{" "}
          or Couragelivingstone1@gmail.com.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
