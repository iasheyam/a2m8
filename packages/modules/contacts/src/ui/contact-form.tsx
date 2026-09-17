"use client";

import type { ReactNode } from "react";
import { Input, SearchSelect, Textarea } from "@a2m8/ui";
import { SOURCE_OPTIONS, STATUS_OPTIONS, TYPE_OPTIONS } from "../lib/options";
import type { ContactField } from "../types/contact";

type Values = Record<ContactField, string>;

function Field({ label, span, children }: { label: string; span?: boolean; children: ReactNode }) {
  return (
    <div className={span ? "col-span-2" : undefined}>
      <label className="block font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6">
      <p className="font-display text-base font-semibold uppercase tracking-wide text-ink-2 mb-3 pb-2 border-b border-line-2">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export function ContactForm({
  values,
  onChange,
}: {
  values: Values;
  onChange: (field: ContactField, value: string) => void;
}) {
  const bind = (field: ContactField) => ({
    value: values[field],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value),
  });

  return (
    <div>
      <Section title="Personal">
        <Field label="First Name"><Input {...bind("firstName")} className="w-full" /></Field>
        <Field label="Last Name"><Input {...bind("lastName")} className="w-full" /></Field>
        <Field label="Job Title"><Input {...bind("jobTitle")} className="w-full" /></Field>
        <Field label="Type">
          <SearchSelect value={values.type} options={TYPE_OPTIONS} onChange={(v) => onChange("type", v)} />
        </Field>
      </Section>

      <Section title="Company">
        <Field label="Company"><Input {...bind("company")} className="w-full" /></Field>
        <Field label="Department"><Input {...bind("department")} className="w-full" /></Field>
        <Field label="Website" span><Input {...bind("website")} placeholder="https://" className="w-full" /></Field>
      </Section>

      <Section title="Contact Info">
        <Field label="Email"><Input type="email" {...bind("email")} className="w-full" /></Field>
        <Field label="Secondary Email"><Input type="email" {...bind("secondaryEmail")} className="w-full" /></Field>
        <Field label="Work Phone"><Input {...bind("phone")} className="w-full" /></Field>
        <Field label="Mobile Phone"><Input {...bind("mobilePhone")} className="w-full" /></Field>
        <Field label="LinkedIn" span><Input {...bind("linkedinUrl")} placeholder="https://linkedin.com/in/…" className="w-full" /></Field>
      </Section>

      <Section title="Address">
        <Field label="Street" span><Input {...bind("street")} className="w-full" /></Field>
        <Field label="City"><Input {...bind("city")} className="w-full" /></Field>
        <Field label="State / Province"><Input {...bind("state")} className="w-full" /></Field>
        <Field label="Postal Code"><Input {...bind("postalCode")} className="w-full" /></Field>
        <Field label="Country"><Input {...bind("country")} className="w-full" /></Field>
      </Section>

      <Section title="CRM Details">
        <Field label="Status">
          <SearchSelect value={values.status} options={STATUS_OPTIONS} onChange={(v) => onChange("status", v)} />
        </Field>
        <Field label="Source">
          <SearchSelect value={values.source} options={SOURCE_OPTIONS} onChange={(v) => onChange("source", v)} />
        </Field>
        <Field label="Summary" span>
          <Textarea
            value={values.summary}
            onChange={(e) => onChange("summary", e.target.value)}
            rows={3}
            placeholder="Who they are, how you know them…"
            className="w-full resize-none"
          />
        </Field>
      </Section>
    </div>
  );
}
