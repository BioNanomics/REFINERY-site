/**
 * Where contact-form submissions get sent.
 *
 * This site is fully static (GitHub Pages, no adapter, no server), so a form
 * can't email anyone on its own — it has to POST to a hosted relay that does
 * the sending. This file is the single swap point for that relay.
 *
 * IT SHIPS BLANK ON PURPOSE. While `endpoint` is '', the popup never opens in
 * a production build and every contact CTA falls through to its `mailto:`
 * href, exactly as the site behaved before the popups existed. Fill in a
 * preset below to switch the popups on.
 *
 * Nothing secret belongs here. Web3Forms access keys and Formspree form IDs
 * are public-by-design — they identify a destination, they don't authorize
 * reading anything — which is why they're safe to inline in a static bundle.
 * Anything that must actually stay private cannot live in this repo at all.
 */

export type FormDelivery = {
  /** Relay URL. '' means unconfigured. */
  endpoint: string;
  /** Provider auth/routing fields merged into every submission. */
  hiddenFields: Record<string, string>;
  /** Body key that carries the subject line. */
  subjectKey: string;
  /** How to encode the request body. */
  encoding: 'json' | 'formdata';
};

/**
 * TESTING Web3Forms locally right now — not committed. See "OTHER PRESETS" below for the
 * Google Apps Script config this is temporarily standing in for; that setup (and its docs
 * in docs/contact-form-apps-script.md + docs/contact-form.gs) is on pause, not abandoned.
 *
 * Web3Forms — https://web3forms.com — free, unlimited forms, no dashboard account. Get a
 * key by visiting the site and verifying the destination inbox (info@refineryrobotics.org);
 * they email you an access key. Paste it in below.
 */
export const formDelivery: FormDelivery = {
  endpoint: 'https://api.web3forms.com/submit',
  hiddenFields: { access_key: 'c97ff9fd-5689-4153-a70f-58f75409e0e2' },
  subjectKey: 'subject',
  encoding: 'json',
};

/*
 * ---------------------------------------------------------------------------
 * OTHER PRESETS
 * ---------------------------------------------------------------------------
 *
 * Google Apps Script — no third party; sends via Gmail from whichever Google account
 * deployed the script. Full setup: docs/contact-form-apps-script.md and
 * docs/contact-form.gs (already hardened — secret check, rate limiting, validation).
 *
 *   export const formDelivery: FormDelivery = {
 *     endpoint: 'https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID/exec',
 *     hiddenFields: { secret: 'ye6FKxFUahIj4BjMx1v3XWOxXa37SbGS' },
 *     subjectKey: 'subject',
 *     encoding: 'formdata',
 *   };
 *
 * ---------------------------------------------------------------------------
 * Formspree — https://formspree.io
 * Stored submission history and stronger spam filtering; smaller free tier.
 * Each form gets its own endpoint, so if you want the two forms separated you
 * will also need to give each form definition its own endpoint override.
 *
 *   export const formDelivery: FormDelivery = {
 *     endpoint: 'https://formspree.io/f/YOUR-FORM-ID',
 *     hiddenFields: {},
 *     subjectKey: '_subject',
 *     encoding: 'json',
 *   };
 */

/** Shared inbox. Also the fallback address shown when a submission fails. */
export const CONTACT_EMAIL = 'info@refineryrobotics.org';

export const isFormConfigured = formDelivery.endpoint !== '';
