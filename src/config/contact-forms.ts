/**
 * Declarative field lists for the two contact-popup forms. One renderer
 * (`FormField.astro`) reads these, so adding or reordering a question is a
 * data edit here, not a template change.
 */

export type FieldOption = {
  value: string;
  label: string;
};

export type Field =
  | {
      type: 'text' | 'email' | 'tel' | 'number';
      name: string;
      label: string;
      required?: boolean;
      placeholder?: string;
      autocomplete?: string;
    }
  | {
      type: 'textarea';
      name: string;
      label: string;
      required?: boolean;
      rows?: number;
      placeholder?: string;
    }
  | {
      type: 'radio';
      name: string;
      label: string;
      required?: boolean;
      options: FieldOption[];
      default?: string;
    };

export type ContactFormDef = {
  /** Used as the <dialog> id and as data-contact-open's match value. */
  id: string;
  title: string;
  intro: string;
  /** Sent as the delivery subject line. */
  subject: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  fields: Field[];
};

export const contactForm: ContactFormDef = {
  id: 'contact',
  title: 'Contact Us',
  intro: "Questions about mentoring, partnerships, volunteering, or anything else? We'd love to hear from you.",
  subject: 'Website contact — The REFINERY',
  submitLabel: 'Send Message',
  successTitle: 'Message sent',
  successBody: "Thanks for reaching out — we'll get back to you soon.",
  fields: [
    { type: 'text', name: 'name', label: 'Your name', required: true, autocomplete: 'name' },
    { type: 'email', name: 'email', label: 'Email', required: true, autocomplete: 'email' },
    { type: 'tel', name: 'phone', label: 'Phone', autocomplete: 'tel' },
    {
      type: 'radio',
      name: 'topic',
      label: 'What is this about?',
      required: true,
      default: 'General question',
      options: [
        { value: 'General question', label: 'General question' },
        { value: 'Volunteering', label: 'Volunteering' },
        { value: 'Partnership', label: 'Partnership' },
        { value: 'Referral', label: 'Referral' },
        { value: 'Donating', label: 'Donating' },
      ],
    },
    { type: 'textarea', name: 'message', label: 'Message', required: true, rows: 4 },
  ],
};

export const startTeamForm: ContactFormDef = {
  id: 'start-a-team',
  title: 'Start a Team With Us',
  intro:
    "Tell us about your school, organization, or community and we'll walk you through what starting a team requires and how The REFINERY supports the process.",
  subject: 'Start a team — The REFINERY',
  submitLabel: 'Send Inquiry',
  successTitle: 'Inquiry sent',
  successBody: "Thanks for reaching out — we'll follow up about starting a team soon.",
  fields: [
    { type: 'text', name: 'name', label: 'Your name', required: true, autocomplete: 'name' },
    { type: 'email', name: 'email', label: 'Email', required: true, autocomplete: 'email' },
    { type: 'tel', name: 'phone', label: 'Phone', autocomplete: 'tel' },
    { type: 'text', name: 'organization', label: 'School / organization', required: true },
    { type: 'text', name: 'city', label: 'City / community', required: true },
    {
      type: 'radio',
      name: 'role',
      label: 'Your role',
      required: true,
      options: [
        { value: 'Student', label: 'Student' },
        { value: 'Parent', label: 'Parent' },
        { value: 'Educator', label: 'Educator' },
        { value: 'Community member', label: 'Community member' },
      ],
    },
    {
      type: 'radio',
      name: 'program',
      label: 'Program interest',
      required: true,
      default: 'Not sure yet',
      options: [
        { value: 'FRC', label: 'FRC' },
        { value: 'FTC', label: 'FTC' },
        { value: 'Not sure yet', label: 'Not sure yet' },
      ],
    },
    { type: 'number', name: 'studentsExpected', label: 'Students expected' },
    {
      type: 'textarea',
      name: 'message',
      label: 'Tell us about your situation',
      required: true,
      rows: 4,
    },
  ],
};

export const contactForms = [contactForm, startTeamForm];
