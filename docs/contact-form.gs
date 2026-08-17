/**
 * Google Apps Script Web App backing the site's two contact popups.
 * Deployment steps: docs/contact-form-apps-script.md in this repo.
 *
 * This endpoint is necessarily public and unauthenticated — it's the form backend for a
 * static site with no server, and its URL is visible to anyone who opens devtools on the
 * site. There's no way to make that fully un-abusable; a static site has no server-side
 * session to authenticate a request against. What follows are the practical layers that
 * raise the cost of abuse well past what's worth it for a small contact form:
 *
 *   - SHARED_SECRET must match the `secret` field src/config/forms.ts sends with every
 *     legitimate submission (via formDelivery.hiddenFields). Doesn't stop someone who reads
 *     the site's source and extracts it, but blocks blind endpoint scanners and casual
 *     abuse of the bare URL.
 *   - The destination is hardcoded (DESTINATION_EMAIL) — request data never controls "to",
 *     so this can't become an open relay to arbitrary third parties.
 *   - A rolling global rate limit (CacheService) caps total submissions per minute
 *     regardless of source, so a flood can't exhaust the account's daily MailApp send
 *     quota — which would otherwise take the real contact form down too.
 *   - Every field is length-capped and the field count is capped, bounding how much
 *     damage or storage/quota cost one request can cause.
 *   - Every rejection path (bad secret, rate-limited, missing fields) returns the exact
 *     same response as a real success, so a scripted attacker gets no signal about which
 *     defense stopped them or how to work around it.
 *
 * Both popup forms POST here with 'formdata' encoding, so every submitted field arrives in
 * e.parameter. Nothing is hardcoded per-form beyond the required name/email — other
 * fields (topic, organization, role, ageGroup, message, ...) just get listed in the email
 * body, so adding a question to either form in src/config/contact-forms.ts doesn't require
 * touching this file.
 */

var DESTINATION_EMAIL = 'info@refineryrobotics.org';

// Must match the `secret` value in src/config/forms.ts's formDelivery.hiddenFields.
var SHARED_SECRET = 'ye6FKxFUahIj4BjMx1v3XWOxXa37SbGS';

var MAX_FIELD_LENGTH = 3000;
var MAX_FIELDS = 15;
var RATE_LIMIT_WINDOW_SECONDS = 60;
var RATE_LIMIT_MAX_PER_WINDOW = 5;

function doPost(e) {
  // Returned on every path — success or rejection — so a caller can't distinguish "sent"
  // from "silently dropped" and calibrate an attack against it.
  var response = ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);

  try {
    var params = (e && e.parameter) || {};

    if (params.secret !== SHARED_SECRET) return response;
    if (!withinRateLimit()) return response;

    var name = sanitizeLine(params.name);
    var email = sanitizeLine(params.email);
    // Only name + email are universal — the start-a-team form's message field is optional.
    if (!name || !email || !isPlausibleEmail(email)) return response;

    var keys = Object.keys(params).filter(function (key) {
      return key !== 'subject' && key !== 'secret' && String(params[key] || '').trim() !== '';
    });
    if (keys.length > MAX_FIELDS) return response;

    var subject = sanitizeLine(params.subject) || 'Website contact — The REFINERY';
    var lines = keys.map(function (key) {
      return key + ': ' + String(params[key]).slice(0, MAX_FIELD_LENGTH);
    });

    MailApp.sendEmail({
      to: DESTINATION_EMAIL,
      subject: subject,
      body: lines.join('\n\n'),
      replyTo: email,
    });
  } catch (err) {
    // Swallow — an error response would itself be a signal to a caller probing the endpoint.
  }

  return response;
}

/** Global (script-wide, not per-caller — Apps Script doesn't expose a caller IP to key by). */
function withinRateLimit() {
  var cache = CacheService.getScriptCache();
  var bucket = 'submits_' + Math.floor(Date.now() / 1000 / RATE_LIMIT_WINDOW_SECONDS);
  var count = Number(cache.get(bucket) || '0') + 1;
  cache.put(bucket, String(count), RATE_LIMIT_WINDOW_SECONDS * 2);
  return count <= RATE_LIMIT_MAX_PER_WINDOW;
}

function isPlausibleEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Strips newlines (header-injection-style hygiene) and caps length for subject/name/email. */
function sanitizeLine(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
}
