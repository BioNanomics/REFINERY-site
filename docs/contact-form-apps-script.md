# Contact form email delivery — Google Apps Script

The site's two contact popups (`src/components/forms/`) POST to whatever endpoint is
configured in `src/config/forms.ts`. This sets up that endpoint as a Google Apps Script Web
App: no third-party service, sends through Gmail, free, and the account that deploys it
controls where the mail actually comes from.

## 1. Create the script

1. Go to [script.google.com](https://script.google.com/) and sign in with **the Google
   account you want submissions to be sent from** (its Gmail "From" address is what
   recipients will see — using the account behind `refinery@bionanomics.com`, if that's a
   Google Workspace/Gmail account, is the natural choice).
2. **New project**. Delete the placeholder `myFunction` code and paste in the contents of
   `contact-form.gs` (below) in this same folder.
3. Rename the project (top left) to something like "REFINERY contact form".

## 2. Deploy it as a Web App

1. **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → **Web app**.
3. **Execute as**: Me (your account).
4. **Who has access**: Anyone.
5. **Deploy**. Google will prompt you to authorize the script's permission to send email as
   you — approve it (you'll likely see an "unverified app" warning since this is a personal
   script, not a published one; click **Advanced → Go to [project name] (unsafe)** to proceed,
   this is expected for scripts you wrote yourself).
6. Copy the **Web app URL** it gives you — it ends in `/exec`.

## 3. Wire it into the site

Paste that URL into `src/config/forms.ts`:

```ts
export const formDelivery: FormDelivery = {
  endpoint: 'https://script.google.com/macros/s/YOUR-DEPLOYMENT-ID/exec',
  hiddenFields: {},
  subjectKey: 'subject',
  encoding: 'formdata',
};
```

## 4. Test it

Run `npx astro dev`, open either popup, and submit a real test. Confirm the email lands in
`refinery@bionanomics.com` and that replying to it actually reaches the person who submitted
the form (the script sets `replyTo` to whatever email address they entered).

## Redeploying after editing the script

Apps Script Web App URLs stay the same across edits **only if** you redeploy the *existing*
deployment rather than creating a new one: **Deploy → Manage deployments → pencil icon → New
version → Deploy**. Creating a brand new deployment gives you a different URL, which would
require updating `forms.ts` again.
