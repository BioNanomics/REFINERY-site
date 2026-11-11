# Press release and press kit sources

`press-release.html` and `press-kit.html` are the sources for the two PDFs the press portal
serves from `public/press/`. The kit repeats the release word for word, so edit both files
together. `press.css` holds the shared print styles.

To rebuild the PDFs after an edit, print each file with Chrome or Chromium (Letter, no
headers or footers):

```sh
chrome --headless --no-pdf-header-footer \
  --print-to-pdf=public/press/Monster_Match_2026_Press_Release.pdf \
  docs/press-kit/press-release.html
chrome --headless --no-pdf-header-footer \
  --print-to-pdf=public/press/Monster_Match_2026_Press_Kit.pdf \
  docs/press-kit/press-kit.html
```

Use `google-chrome`, `chromium` or the full path to the browser in place of `chrome`. Then
update the "Updated" date in both mastheads and the release's `description` in
`src/data/press.ts`, and run `npm test`.

The copy follows the press rules in `CONTRIBUTING.md` ("Press portal at `/press/`"): AP dates
and times, no em dashes or exclamation points, "nonprofit" rather than "501(c)(3)", and
Monster Match is never called the largest or the first event of its kind.
