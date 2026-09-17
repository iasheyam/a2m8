// Free-text-with-suggestions vocabularies. Per CLAUDE.md these become
// per-org config once there's an org settings surface to edit them from —
// for now they're a reasonable fixed default, same pattern as the calling
// module's BUSINESS_TYPES list.

export const TYPE_OPTIONS = [
  "Client",
  "Vendor",
  "Tenant",
  "Partner",
  "Contractor",
  "Prospect",
  "Other",
];

export const STATUS_OPTIONS = [
  "Lead",
  "Prospect",
  "Active",
  "Customer",
  "Inactive",
  "Churned",
];

export const SOURCE_OPTIONS = [
  "Referral",
  "Website",
  "Cold Outreach",
  "Event",
  "Social Media",
  "Existing Client",
  "Other",
];
