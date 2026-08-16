/**
 * Google Apps Script Web App backing the site's two contact popups.
 * Deployment steps: docs/contact-form-apps-script.md in this repo.
 *
 * Both popup forms POST here with 'formdata' encoding (src/config/forms.ts), so every
 * submitted field arrives in e.parameter. Nothing is hardcoded per-form — whatever fields a
 * form sends (name, email, phone, topic, organization, city, role, program,
 * studentsExpected, message, subject) just get listed in the email body, so adding a
 * question to either form in src/config/contact-forms.ts doesn't require touching this file.
 */

var DESTINATION_EMAIL = 'info@refineryrobotics.org';

function doPost(e) {
  var params = e.parameter;
  var subject = params.subject || 'Website contact — The REFINERY';
  var replyTo = params.email || '';

  var lines = [];
  for (var key in params) {
    if (key === 'subject' || !params[key]) continue;
    lines.push(key + ': ' + params[key]);
  }

  MailApp.sendEmail({
    to: DESTINATION_EMAIL,
    subject: subject,
    body: lines.join('\n\n'),
    replyTo: replyTo,
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}
