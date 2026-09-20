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
 * Web3Forms — https://web3forms.com — free, unlimited forms, no dashboard account. The
 * access key below was issued to info@refineryrobotics.org, which had to be verified with
 * Web3Forms before submissions would relay there; re-verify that inbox is still confirmed
 * if delivery ever silently stops. hCaptcha (see ContactDialogs.astro and FormDialog.astro)
 * renders regardless, but only actually blocks unsolved submissions once "hCaptcha" is set
 * as this form's preferred captcha in the Web3Forms dashboard — check that's on, since the
 * widget looks identical either way.
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
