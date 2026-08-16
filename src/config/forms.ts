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
 * Active provider: Google Apps Script. No third party — sends via Gmail from whichever
 * Google account deployed the script. Setup + the actual doPost(e) script:
 * docs/contact-form-apps-script.md and docs/contact-form.gs in this repo.
 *
 * `endpoint` is intentionally still blank until that script is deployed — see the module
 * doc comment above. Paste the deployment's Web App URL (ends in /exec) in below once you
 * have it. 'formdata' encoding matters here specifically: it keeps the request a CORS
 * "simple request" so the browser skips a preflight, which Apps Script doesn't answer.
 */
export const formDelivery: FormDelivery = {
  endpoint: '',
  hiddenFields: {},
  subjectKey: 'subject',
  encoding: 'formdata',
};

/*
 * ---------------------------------------------------------------------------
 * OTHER PRESETS — swap in one of these instead if you'd rather not self-host.
 * ---------------------------------------------------------------------------
 *
 * Web3Forms — https://web3forms.com
 * Free tier, unlimited forms. Create a key by verifying the destination inbox;
 * no dashboard account needed. Both forms can share one key.
 *
 *   export const formDelivery: FormDelivery = {
 *     endpoint: 'https://api.web3forms.com/submit',
 *     hiddenFields: { access_key: 'PASTE-YOUR-ACCESS-KEY-HERE' },
 *     subjectKey: 'subject',
 *     encoding: 'json',
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
