/**
 * The single contact popup, described as data. One renderer (`FormField.astro`)
 * reads `fields`, so adding or reordering a question is a data edit here, not a
 * template change.
 *
 * There is one form, not one per reason-for-writing. What differs between "I want
 * to volunteer" and "I want to start a team" is the TOPIC: it swaps the popup's
 * heading, intro, subject line and success copy, and it decides which questions
 * are on screen. A trigger that already knows why someone is writing (the Start a
 * Team button, the Donate button) passes its topic via `data-contact-topic`, and
 * the topic question is hidden — there's nothing to ask when the answer came from
 * the button they clicked. A generic "Contact Us" trigger leaves it visible.
 */

export type FieldOption = {
  value: string;
  label: string;
};

type FieldBase = {
  name: string;
  label: string;
  required?: boolean;
  /** Guidance under the label. Wired to the control via aria-describedby. */
  hint?: string;
  /**
   * Render this question only for these topics. Omit and it's always shown.
   * Off-topic fields are hidden AND disabled, which is what keeps them out of
   * both constraint validation and the submitted payload.
   */
  topics?: string[];
  /**
   * Overrides `name` when building DOM ids. Only needed where two topic-scoped
   * variants share one submitted key (see the two `message` fields below).
   */
  key?: string;
};

export type Field = FieldBase &
  (
    | {
        type: 'text' | 'email' | 'tel' | 'number';
        placeholder?: string;
        autocomplete?: string;
      }
    | {
        type: 'textarea';
        rows?: number;
        placeholder?: string;
      }
    | {
        type: 'radio';
        options: FieldOption[];
        default?: string;
      }
    | {
        /** Multi-select group. Submits every checked value under one key. */
        type: 'checkbox';
        options: FieldOption[];
      }
  );

export type ContactTopic = {
  /** Submitted as the `topic` value, and what `data-contact-topic` matches on. */
  value: string;
  /** Label in the topic radio group. */
  label: string;
  title: string;
  intro: string;
  /** Sent as the delivery subject line. */
  subject: string;
  /** Each falls back to the form-level default below. */
  submitLabel?: string;
  successTitle?: string;
  successBody?: string;
};

export type ContactFormDef = {
  /** Used as the <dialog> id and as data-contact-open's match value. */
  id: string;
  defaultTopic: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  topics: ContactTopic[];
  fields: Field[];
};

/** Referenced by the scoped fields below, so a rename can't silently unscope them. */
const TEAM = 'Starting a team';
const VOLUNTEER = 'Volunteering';
const PARTNER = 'Partnership';
const JOIN = 'Joining a team';

/**
 * Topics whose own questions already carry the useful detail. Their free-text box
 * is a bonus rather than the whole submission, so it's optional and asks a softer
 * question. Topics with no scoped questions of their own rest on it instead, and
 * there it's required — see the message variants at the end of `fields`.
 */
const SOFT_MESSAGE_TOPICS = [TEAM, VOLUNTEER, JOIN];

const topics: ContactTopic[] = [
  {
    value: 'General question',
    label: 'General question',
    title: 'Contact Us',
    intro: "Questions about mentoring, partnerships, volunteering, or anything else? We'd love to hear from you.",
    subject: 'Website contact — The REFINERY',
  },
  {
    value: TEAM,
    label: 'Starting a team',
    title: 'Start a Team With Us',
    intro:
      "Tell us about your school, organization, or community and we'll walk you through what starting a team requires and how The REFINERY supports the process.",
    subject: 'Start a team — The REFINERY',
    submitLabel: 'Send Inquiry',
    successTitle: 'Inquiry sent',
    successBody: "Thanks for reaching out. We'll follow up about starting a team soon.",
  },
  {
    value: VOLUNTEER,
    label: 'Volunteering',
    title: 'Volunteer With Us',
    intro:
      "Tell us roughly where you'd like to help, whether that's mentoring a team or supporting the organization, and we'll follow up about what's needed.",
    subject: 'Volunteering — The REFINERY',
  },
  {
    value: PARTNER,
    label: 'Partnership',
    title: 'Partner With Us',
    intro: 'Tell us about your organization and what working together might look like.',
    subject: 'Partnership — The REFINERY',
  },
  {
    value: JOIN,
    label: 'Joining a team',
    title: 'Find a Team for Your Student',
    intro:
      "Tell us a little about your student and we'll help connect them with a team near you. The contact details below should be yours. We'll follow up with you, not them.",
    subject: 'Joining a team — The REFINERY',
    submitLabel: 'Send Inquiry',
    successTitle: 'Inquiry sent',
    successBody: "Thanks for reaching out. We'll follow up about teams near you soon.",
  },
  {
    value: 'Donating',
    label: 'Donating',
    title: 'Support The REFINERY',
    intro: "Tell us how you'd like to give and we'll follow up with the details.",
    subject: 'Donating — The REFINERY',
  },
];

export const contactForm: ContactFormDef = {
  id: 'contact',
  defaultTopic: 'General question',
  submitLabel: 'Send Message',
  successTitle: 'Message sent',
  successBody: "Thanks for reaching out. We'll get back to you soon.",
  topics,
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
      options: topics.map((topic) => ({ value: topic.value, label: topic.label })),
    },
    { type: 'text', name: 'organization', label: 'School / organization', topics: [TEAM] },
    {
      type: 'radio',
      name: 'role',
      label: 'Your role',
      required: true,
      topics: [TEAM],
      options: [
        { value: 'Student', label: 'Student' },
        { value: 'Parent', label: 'Parent' },
        { value: 'Educator', label: 'Educator' },
        { value: 'Community member', label: 'Community member' },
      ],
    },
    {
      type: 'checkbox',
      name: 'ageGroup',
      label: 'Age group',
      required: true,
      topics: [TEAM],
      options: [
        { value: 'Elementary school', label: 'Elementary school' },
        { value: 'Middle school', label: 'Middle school' },
        { value: 'High school', label: 'High school' },
      ],
    },
    // Asked on their student's behalf, so it's deliberately separate from the
    // `name` field above — that one is the parent's, and the intro says so.
    { type: 'text', name: 'studentName', label: "Student's first name", topics: [JOIN] },
    {
      type: 'radio',
      name: 'grade',
      label: "Student's grade level",
      required: true,
      topics: [JOIN],
      options: [
        { value: 'Elementary school', label: 'Elementary school' },
        { value: 'Middle school', label: 'Middle school' },
        { value: 'High school', label: 'High school' },
      ],
    },
    { type: 'text', name: 'zip', key: 'volunteer-zip', label: 'ZIP code', autocomplete: 'postal-code', topics: [VOLUNTEER] },
    // Same submitted key, but a parent is likelier to name the school than the
    // postal code — and no `autocomplete`, since a saved ZIP is the wrong
    // suggestion for a field that may well be answered with a school name.
    { type: 'text', name: 'zip', key: 'student-zip', label: 'ZIP code or school', topics: [JOIN] },
    {
      type: 'radio',
      name: 'involvement',
      label: 'Where would you like to help?',
      required: true,
      // Neutral default rather than the first option — "open to both" is the one
      // answer that can't quietly misfile someone who never touched the question.
      default: 'Open to both',
      topics: [VOLUNTEER],
      options: [
        { value: 'Mentoring a team', label: 'Mentoring a team' },
        { value: 'Supporting the organization', label: 'Supporting the organization' },
        { value: 'Open to both', label: 'Open to both' },
      ],
    },
    {
      // Deliberately broad — enough to route the follow-up email, not a skills
      // inventory. Shared by volunteers and students, so the options name the
      // area rather than the role someone would play in it.
      type: 'checkbox',
      name: 'expertise',
      label: 'Areas of interest',
      hint: 'No experience needed. We help mentors and students alike get up to speed.',
      topics: [VOLUNTEER, JOIN],
      options: [
        { value: 'Technical (build, CAD, machining)', label: 'Technical (build, CAD, machining)' },
        { value: 'Software & electronics', label: 'Software & electronics' },
        { value: 'Events & logistics', label: 'Events & logistics' },
        { value: 'Community engagement & outreach', label: 'Community engagement & outreach' },
        { value: 'Media & marketing', label: 'Media & marketing' },
        { value: 'Business, fundraising & admin', label: 'Business, fundraising & admin' },
      ],
    },
    // Variants of the same submitted key, never on screen at once. Each names the
    // topics it serves; the general one takes whatever is left, so a newly added
    // topic always has a message box.
    {
      type: 'textarea',
      name: 'message',
      key: 'optional-message',
      label: 'What should we know?',
      rows: 4,
      topics: SOFT_MESSAGE_TOPICS,
    },
    {
      type: 'textarea',
      name: 'message',
      key: 'partner-message',
      label: "Tell us how you're interested in partnering",
      required: true,
      rows: 4,
      topics: [PARTNER],
    },
    {
      type: 'textarea',
      name: 'message',
      key: 'general-message',
      label: 'Message',
      required: true,
      rows: 4,
      topics: topics
        .map((topic) => topic.value)
        .filter((value) => !SOFT_MESSAGE_TOPICS.includes(value) && value !== PARTNER),
    },
  ],
};
