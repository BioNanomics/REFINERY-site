# Placeholder imagery — licensing note

The original project brief suggested sourcing placeholder photography from the FIRST
Indiana Flickr album (`flickr.com/photos/indianafirst/albums/`). We deliberately did **not**
download or hotlink those photos for this scaffold:

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

**Before launch**, the client should do one of the following:

1. Supply their own photography of The REFINERY's makerspace, builds, and team, **or**
2. Obtain written permission / confirm usage rights from FIRST Indiana for specific Flickr
   album photos.

If Flickr images are approved later: download them, store them under `src/assets/`
(never hotlink to `flickr.com` directly), and credit the photographer/FIRST Indiana
appropriately near each image.
