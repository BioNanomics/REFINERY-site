# Contact form email delivery — Google Apps Script

The site's two contact popups (`src/components/forms/`) POST to whatever endpoint is
configured in `src/config/forms.ts`. This sets up that endpoint as a Google Apps Script Web
App: no third-party service, sends through Gmail, free.

`info@refineryrobotics.org` is a **Google Group**, not an account you can sign into — it can
only ever be the *destination* the script sends to (already set as `DESTINATION_EMAIL` in
`contact-form.gs`). Some separate real Google account still has to deploy the script; that
account becomes the "From" address on outgoing mail.

## 1. Create the script

1. Go to [script.google.com](https://script.google.com/) and sign in with **whichever real
   Google account you want to deploy under** — this is what mail will send *from*, separate
   from the `info@refineryrobotics.org` group it sends *to*. A dedicated account (rather than
   anyone's personal daily-driver Gmail) is safer: if the endpoint is ever abused, the
   fallout is contained to that account, not someone's main inbox.
2. **Before deploying**, confirm that account can actually post to the group: either add it
   as a member of `info@refineryrobotics.org`, or confirm the group's settings allow posts
   from non-members. If neither is true, `MailApp.sendEmail()` will report success on the
   script's side while the message silently bounces before reaching anyone.
3. **New project**. Delete the placeholder `myFunction` code and paste in the contents of
   `contact-form.gs` (in this same folder).
4. Rename the project (top left) to something like "REFINERY contact form".

## 2. Deploy it as a Web App

1. **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → **Web app**.
3. **Execute as**: Me (your account) — not "User accessing the web app". Anonymous site
   visitors have no Google session to authenticate with, so that option would break every
   submission.
4. **Who has access**: Anyone.
5. **Deploy**. Google will prompt you to authorize the script's permission to send email as
   you — approve it (you'll likely see an "unverified app" warning since this is a personal
   script, not a published one; click **Advanced → Go to [project name] (unsafe)** to
   proceed, this is expected for scripts you wrote yourself).
6. Copy the **Web app URL** it gives you — it ends in `/exec`.

## 3. Wire it into the site

Paste that URL into `endpoint` in `src/config/forms.ts` — everything else is already set:

```ts
export const formDelivery: FormDelivery = {
  endpoint: 'https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID/exec',
  hiddenFields: { secret: 'ye6FKxFUahIj4BjMx1v3XWOxXa37SbGS' },
  subjectKey: 'subject',
  encoding: 'formdata',
};
```

The `secret` here already matches `SHARED_SECRET` in `contact-form.gs` — the script checks
it on every request and silently drops anything that doesn't match, which is the main thing
standing between this endpoint and being trivially abusable by anyone who finds the bare
URL. See the comment block at the top of `contact-form.gs` for the full list of hardening
(rate limiting, field caps, uniform responses regardless of accept/reject). If you want a
secret unique to this deployment rather than the shipped default, generate a new random
string and put the same value in both files.

## 4. Test it

Run `npx astro dev`, open either popup, and submit a real test. Confirm the email lands in
`info@refineryrobotics.org` and that replying to it actually reaches the person who submitted
the form (the script sets `replyTo` to whatever email address they entered).

## Redeploying after editing the script

Apps Script Web App URLs stay the same across edits **only if** you redeploy the *existing*
deployment rather than creating a new one: **Deploy → Manage deployments → pencil icon → New
version → Deploy**. Creating a brand new deployment gives you a different URL, which would
require updating `forms.ts` again.
