"use client";

import { useEffect, useState } from "react";
import { Button, ConfirmDialog, SlidePanel } from "@a2m8/ui";
import { ContactForm } from "./contact-form";
import { NotesSection } from "./notes-section";
import { createContact, deleteContact, getContact, updateContactField } from "../lib/contacts";
import { contactDisplayName, type Contact, type ContactField } from "../types/contact";

const EMPTY_VALUES: Record<ContactField, string> = {
  firstName: "", lastName: "", jobTitle: "", company: "", department: "",
  email: "", secondaryEmail: "", phone: "", mobilePhone: "", website: "",
  linkedinUrl: "", street: "", city: "", state: "", postalCode: "", country: "",
  type: "", status: "", source: "", summary: "",
};

function toValues(contact: Contact): Record<ContactField, string> {
  const { id: _id, tags: _tags, createdAt: _createdAt, ...fields } = contact;
  return fields;
}

export function ContactEditPanel({
  open,
  contactId,
  onClose,
  onSaved,
  onDeleted,
}: {
  open: boolean;
  /** null = creating a new contact */
  contactId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [values, setValues] = useState<Record<ContactField, string>>(EMPTY_VALUES);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (contactId) {
      const c = getContact(contactId);
      setValues(c ? toValues(c) : EMPTY_VALUES);
    } else {
      setValues(EMPTY_VALUES);
    }
  }, [open, contactId]);

  function handleChange(field: ContactField, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    // Editing an existing contact autosaves per field, same as the table's
    // inline editing. Creating a new one stays a draft until "Create Contact".
    if (contactId) {
      updateContactField(contactId, field, value);
      onSaved();
    }
  }

  function handleCreate() {
    if (!values.firstName.trim() && !values.lastName.trim()) return;
    createContact(values);
    onSaved();
    onClose();
  }

  function handleDelete() {
    if (!contactId) return;
    deleteContact(contactId);
    setConfirmDeleteOpen(false);
    onDeleted();
  }

  const title = contactId
    ? contactDisplayName(values) || "Untitled contact"
    : "New Contact";

  return (
    <>
      <SlidePanel
        open={open}
        title={title}
        onClose={onClose}
        footer={
          contactId ? (
            <>
              <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
                Delete Contact
              </Button>
              <Button variant="primary" onClick={onClose}>Done</Button>
            </>
          ) : (
            <>
              <span />
              <div className="flex gap-3">
                <Button onClick={onClose}>Cancel</Button>
                <Button
                  variant="primary"
                  onClick={handleCreate}
                  disabled={!values.firstName.trim() && !values.lastName.trim()}
                >
                  Create Contact
                </Button>
              </div>
            </>
          )
        }
      >
        <ContactForm values={values} onChange={handleChange} />

        {contactId && (
          <div>
            <p className="font-display text-base font-semibold uppercase tracking-wide text-ink-2 mb-3 pb-2 border-b border-line-2">
              Notes
            </p>
            <NotesSection contactId={contactId} />
          </div>
        )}
      </SlidePanel>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete contact?"
        description={`This will permanently delete ${title} and all of their notes and reminders. This can't be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
      />
    </>
  );
}
