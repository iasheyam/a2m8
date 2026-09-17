import type { Metadata } from "next";
import { LegalPage } from "../_components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy — a2m8.ai",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 17, 2026">
      <h2>1. Overview</h2>
      <p>
        This Privacy Policy explains what information a2m8 (“we,” “us”) collects
        when you use a2m8.ai (the “Service”), how it’s used, and the choices you
        have. It applies to everyone who signs up for an account or connects an
        integration to the Service.
      </p>

      <h2>2. Information we collect</h2>
      <p>
        <strong>Account information.</strong> Name, email address, and
        organization details when you sign up.
      </p>
      <p>
        <strong>Connected account data.</strong> If you connect a Microsoft 365
        account, we read mail messages, attachments and calendar events, and can
        create or update calendar events on your behalf. We only request the
        specific permissions needed for these features, and you can revoke
        access at any time.
      </p>
      <p>
        <strong>Documents and content.</strong> Documents you send via Telegram
        or that arrive as mail attachments, along with the information our
        system extracts from them (dates, amounts, counterparties, document
        type).
      </p>
      <p>
        <strong>Contacts.</strong> Contact records built automatically from mail
        headers you correspond with, plus anything you or your team add or edit
        by hand.
      </p>
      <p>
        <strong>Voice calling data.</strong> If you use the calling feature: the
        leads and campaigns you create, call recordings/transcripts and call
        outcomes, handled through your own Vapi account.
      </p>
      <p>
        <strong>Billing information.</strong> Handled directly by Stripe — we
        don’t store your card details ourselves.
      </p>

      <h2>3. How we use this information</h2>
      <p>We use the information above to:</p>
      <ul>
        <li>Provide the core features of the Service — filing, answers, deadlines, contacts, calling</li>
        <li>Send you deadline digests and calendar capture confirmations</li>
        <li>Maintain the security and integrity of your account and organization</li>
        <li>Provide customer support when you ask for it</li>
      </ul>
      <p>
        <strong>We never send your data to any third party outside your own
        organization.</strong> There is no path in the Service that emails,
        messages or otherwise shares your documents, mail content or contacts
        with anyone else. Account and invitation emails are the only outbound
        messages the Service sends, and they never include document content.
      </p>

      <h2>4. Third-party service providers</h2>
      <p>
        Some of your data is processed by services you connect or supply
        credentials for, strictly to provide the Service:
      </p>
      <ul>
        <li>
          <strong>Microsoft Graph</strong> — reads your connected mailbox and
          calendar, under permissions you grant directly to Microsoft.
        </li>
        <li>
          <strong>Anthropic</strong> — processes document text to extract
          information and answer questions, using an API key you supply.
          Account numbers, tax IDs and wire instructions are stripped from text
          before it’s sent, on every request.
        </li>
        <li>
          <strong>Vapi</strong> — places and manages voice calls, using
          credentials you supply, if you use the calling feature.
        </li>
        <li>
          <strong>Stripe</strong> — processes subscription payments.
        </li>
        <li>
          <strong>AWS</strong> — hosts the Service’s infrastructure and storage.
        </li>
      </ul>
      <p>
        Each of these providers has its own privacy practices governing how it
        handles data while processing it on your behalf.
      </p>

      <h2>5. Data storage and security</h2>
      <p>
        Your organization’s data is stored in an isolated, encrypted manner —
        every table is scoped to your organization and enforced at the database
        level, so one organization’s data is never readable from another’s
        context. Connected account tokens are encrypted and never exposed to the
        browser or written to logs. Original documents are never moved, renamed
        or deleted from your own mail or file store; we only keep working
        copies needed to provide the Service.
      </p>

      <h2>6. Data retention</h2>
      <p>
        We retain your data for as long as your account is active. If you close
        your account, your organization’s data is deleted from our systems
        within a reasonable period, except where we’re required to retain
        records for legal or accounting reasons.
      </p>

      <h2>7. Your rights and choices</h2>
      <p>
        You can export your contacts and entities as a CSV file at any time,
        directly from the Service, without needing to contact support. You can
        revoke a connected Microsoft account at any time, correct or delete
        contact records by hand, and request deletion of your account by
        contacting us.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use essential cookies to keep you signed in and to remember basic
        preferences. We don’t use third-party advertising or tracking cookies.
      </p>

      <h2>9. Children’s privacy</h2>
      <p>
        The Service is intended for business use by adults and is not directed
        at children. We don’t knowingly collect information from anyone under
        16.
      </p>

      <h2>10. Changes to this policy</h2>
      <p>
        If we make material changes to this Privacy Policy, we’ll notify you
        before they take effect.
      </p>

      <h2>11. Contact us</h2>
      <p>
        Questions about this Privacy Policy or your data can be sent to
        privacy@a2m8.ai.
      </p>
    </LegalPage>
  );
}
