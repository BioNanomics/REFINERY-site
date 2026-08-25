# Imagery — sourcing and licensing

## FIRST Indiana Flickr — permission granted

The REFINERY has **written permission covering the whole FIRST Indiana Flickr account**
(`flickr.com/photos/indianafirst/`). Contributors may use any photo from that account without
asking again.

- **Granted by:** Chris O
- **Date granted:** 2022-10-28
- **Scope:** entire `flickr.com/photos/indianafirst/` account.

Two conditions apply to every photo used under it:

1. **Download, never hotlink.** Save the file into `src/assets/` (team banners go in
   `src/assets/teams/`) so `astro:assets` can optimize it and so an album reorganization
   cannot break the site. Hotlinking Flickr image URLs also violates Flickr's terms.
2. **Credit visibly, near the image.** Not in alt text, not in a `title` attribute — a
   reader has to be able to see it. This is enforced in code: the teams collection's
   `banner` field makes `credit` a required property, so an entry cannot ship a banner
   photo without one. See `src/content.config.ts`.

A team banner therefore looks like this:

```yaml
banner:
  image: ../../assets/teams/frc-1501-thrust-banner.jpg
  alt: "Team 1501 students working on their robot in the pits at the state championship"
  credit:
    text: "Photo: FIRST Indiana Robotics"
    url: "https://www.flickr.com/photos/indianafirst/"
```

Photography shot by the team or by The REFINERY uses the same shape and still carries a
credit — the field is required for everything, not just Flickr sources.

## Placeholder imagery — licensing note

**Superseded by the section above** for FIRST Indiana photography — permission has since been
granted. The reasoning is kept because the second point still governs everything else, and
because the download-not-hotlink rule came from here.

The original project brief suggested sourcing placeholder photography from the FIRST
Indiana Flickr album (`flickr.com/photos/indianafirst/albums/`). At the time we deliberately
did **not** download or hotlink those photos:

- Hotlinking directly to `flickr.com` image URLs violates Flickr's terms of service and is
  fragile (images break if the album owner reorganizes or removes them).
- Downloading and rehosting FIRST Indiana's photography on The REFINERY's production site
  without confirmed permission is a licensing risk.

Instead, `public/images/placeholders/` holds neutral, locally-authored gradient placeholders
(`hero-placeholder.svg`, `card-placeholder.svg`, `avatar-placeholder.svg`) for anywhere real
photography isn't available yet. Every usage includes descriptive alt text and an inline
`{/* TODO: replace with real REFINERY shop photography */}` comment so they're easy to find
and swap out later — search the codebase for `placeholder` or `TODO: replace`.

**Update:** the client has since supplied the real logo (`src/assets/logo-full-color.svg` and
`src/assets/logo-reversed.svg`, used site-wide in the header, footer, and Starlight docs) and
one shop photo (`src/assets/refinery-shop-1.jpeg`, used as the homepage hero and default
social-share image). The project/blog card images below still use gradient placeholders since
no photos specific to those entries have been supplied yet.

**Resolved:** option 2 was taken — see the permission section at the top of this file. The
remaining gap is photography of The REFINERY's own makerspace and builds beyond the single
shop photo already supplied, and team-supplied photos for teams that would rather represent
themselves than appear via FIRST Indiana's coverage.
