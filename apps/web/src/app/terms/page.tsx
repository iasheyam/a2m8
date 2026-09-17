import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service — a2m8.ai",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 17, 2026">
      <h2>1. Agreement to these terms</h2>
      <p>
        These Terms of Service (“Terms”) govern access to and use of a2m8.ai (the
        “Service”), provided by a2m8 (“a2m8,” “we,” “us”). By creating an account or
        using the Service, you agree to these Terms on behalf of yourself and the
        organization you represent.
      </p>

      <h2>2. What the Service does</h2>
      <p>
        a2m8 is a business assistant that connects to a customer’s own mail account,
        files incoming documents against the properties, entities or clients an
        organization tracks, answers questions with source citations, tracks
        deadlines, and — as a separate bundled feature — runs outbound AI voice
        calling campaigns. The Service is provided on a subscription basis to
        organizations (“orgs”), each of which controls its own connected accounts,
        contacts and documents.
      </p>

      <h2>3. Accounts and organizations</h2>
      <p>
        You must create an account to use the Service. The person who signs up
        becomes the owner of a new organization and can invite teammates as
        admins or members. You’re responsible for the accuracy of the information
        you provide and for keeping your login credentials secure. You’re
        responsible for the actions taken under your account and by anyone you
        invite into your organization.
      </p>

      <h2>4. Your content and data</h2>
      <p>
        You retain all ownership of the documents, messages, contacts and other
        content you connect to or upload into the Service (“Your Content”). We
        don’t claim any ownership over it. You grant us a limited license to
        process Your Content solely to provide the Service to you — filing
        documents, answering questions, tracking deadlines, building contact
        records and placing calls you request.
      </p>
      <p>
        Original documents in your mail or file store are never moved, renamed or
        deleted by a2m8. The Service only reads them and stores working copies
        needed to provide the Service.
      </p>

      <h2>5. Third-party services and your own API keys</h2>
      <p>
        The Service relies on services you connect or supply credentials for:
      </p>
      <ul>
        <li>
          <strong>Microsoft 365</strong> — you authorize a2m8 to read mail and
          manage calendar events on your behalf through Microsoft’s own consent
          screen. You can revoke this access at any time from within Microsoft’s
          account settings or from a2m8.
        </li>
        <li>
          <strong>Anthropic</strong> — document understanding and question
          answering runs on an Anthropic API key that you supply yourself. Model
          usage is billed to your own Anthropic account, not to a2m8.
        </li>
        <li>
          <strong>Vapi</strong> — outbound voice calling, if you use that feature,
          is placed through Vapi using credentials you supply.
        </li>
      </ul>
      <p>
        We’re not responsible for the availability, accuracy or behavior of these
        third-party services. Your use of them is also governed by their own
        terms.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul>
        <li>Violate any law or the rights of any third party</li>
        <li>
          Upload or process content you don’t have the right to share with a2m8
        </li>
        <li>
          Place calls to people who haven’t consented to be contacted, or in a
          way that violates applicable telemarketing or robocall laws
        </li>
        <li>Attempt to gain unauthorized access to another organization’s data</li>
        <li>Interfere with or disrupt the integrity of the Service</li>
      </ul>

      <h2>7. Subscription, billing and cancellation</h2>
      <p>
        The Service is billed as a subscription through Stripe. Your subscription
        covers access to the platform; it does not cover the cost of model calls
        (billed to your own Anthropic account) or voice minutes placed through
        your own Vapi credentials. You can cancel at any time through the billing
        portal; access continues until the end of the current billing period.
      </p>

      <h2>8. Data security</h2>
      <p>
        We store your data encrypted, isolated to your organization, and never
        share it with any third party beyond what’s needed to provide the
        Service (your own connected providers, above). We strip account numbers,
        tax IDs and wire instructions from document text before it reaches any
        AI model. More detail is in our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        The Service is provided “as is.” We don’t guarantee that filing,
        extraction or deadline detection will be perfect — you’re responsible for
        verifying anything the Service surfaces before relying on it for a
        business decision. Answers are provided with source citations precisely
        so you can check them.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, a2m8 won’t be liable for
        indirect, incidental or consequential damages arising from use of the
        Service. Our total liability for any claim is limited to the amount you
        paid us in the twelve months before the claim arose.
      </p>

      <h2>11. Termination</h2>
      <p>
        You can stop using the Service and cancel your subscription at any time.
        We may suspend or terminate access if these Terms are violated, or if
        required by law. On termination, you can export your contacts and
        entities as CSV before your account is closed.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material
        changes, we’ll let you know before they take effect. Continuing to use
        the Service after a change takes effect means you accept the updated
        Terms.
      </p>

      <h2>13. Contact</h2>
      <p>Questions about these Terms can be sent to legal@a2m8.ai.</p>
    </LegalPage>
  );
}
