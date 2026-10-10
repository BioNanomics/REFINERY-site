# Press photos

Full-resolution photos offered for download on `/press/`. Every file here needs a matching
entry in `src/data/press-photos.ts` (alt text and a caption); `npm test` fails otherwise, and
the page skips any photo without one.

To add a photo:

1. Save the JPEG here, full size, named `WHO_YYYY-MM-DD_NN.jpg` (for example
   `REFINERY_2026-07-28_01.jpg`). Keep each file under 10 MB; re-export anything larger at
   3,000 px on the long edge, JPEG quality 90.
2. Run `npm run press:stub`; it prints an entry for each new file. Paste the block into
   `src/data/press-photos.ts` and write the alt text (what is in the frame).
3. Run `npm test`.

Only photos The REFINERY or BioNanomics shot, or has written permission to redistribute, go
here: a reporter will download and publish them. FIRST Indiana Flickr photos are not
redistributed; the press page links reporters to the Flickr albums instead (see
`docs/placeholder-images.md`).

Don't name students in filenames, alt text or captions (first name and last initial at most);
see "Naming students" in `CONTRIBUTING.md`.
