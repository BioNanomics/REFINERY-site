/**
 * JSON-LD builders.
 *
 * Ground rule: every value here must trace to something already published on the site. This
 * markup is a set of public factual claims about a real nonprofit, so anything the site
 * doesn't already say is omitted rather than guessed. Absent beats wrong — a missing optional
 * property costs a little rich-result eligibility, an invented one is a false statement.
 *
 * Deliberately omitted, because no source exists anywhere in the repo:
 *   legalName, taxID/EIN, foundingDate, geo coordinates, telephone, openingHours,
 *   and any Facebook/X/TikTok profile.
 *
 * `telephone` is the one remaining gap worth closing — supply a public number and this can
 * grow a ContactPoint.
 *
 * On the entity itself: The REFINERY is typed as a plain `Organization`, NOT
 * `NonprofitOrganization` with a nonprofitStatus. src/pages/donate.astro states that
 * donations "are received by BioNanomics, a registered 501(c)(3) nonprofit" — so the tax
 * exemption belongs to BioNanomics, and The REFINERY is represented as its child via
 * parentOrganization. Claiming 501(c)(3) status for The REFINERY would be a false tax claim.
 *
 * Strings that may contain FIRST/FRC/FTC must be passed through firstPlain() by the caller,
 * since JSON-LD carries no markup and the raw source text expects the mark to be styled.
 */

const SITE = 'https://refineryrobotics.org';

/** Stable @id so other nodes can reference the org rather than duplicating it. */
export const ORG_ID = `${SITE}/#organization`;

interface OrgOptions {
  /** Absolute URL to the logo asset. */
  logo: string;
  /** Absolute URL to a representative raster image. */
  image: string;
  /** Already run through firstPlain(). */
  description: string;
}

/**
 * The REFINERY as an Organization. Sources, all current as of writing:
 *   name, alternateName, sameAs  -> src/components/nav/SiteFooter.astro
 *   email                        -> src/components/nav/SiteFooter.astro
 *   address                      -> src/pages/about.astro (facilityAddress)
 *   parentOrganization           -> src/pages/donate.astro, README.md
 *   founder                      -> src/content/people/doug-and-kim-horner.mdx
 *   description                  -> the page's own meta description
 */
export function organization({ logo, image, description }: OrgOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'The REFINERY',
    alternateName:
      'Robotics Education, Fabrication, & Innovation Nexus: Entrepreneurship for Rising Youth',
    description,
    url: `${SITE}/`,
    logo,
    image,
    email: 'info@refineryrobotics.org',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1750 Broadway',
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
      postalCode: '46802',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Northeast Indiana',
    },
    founder: {
      '@type': 'Person',
      name: 'Doug and Kim Horner',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'BioNanomics',
      url: 'https://bionanomics.com',
    },
    // GitHub is deliberately absent: the footer's GitHub link is BioNanomics' org account,
    // not a REFINERY profile, so it would be a misleading sameAs for this entity.
    sameAs: [
      'https://www.instagram.com/the_refinery_bybnx',
      'https://youtube.com/@therefinery-in',
      'https://www.linkedin.com/company/the-refinery-robotics',
    ],
  };
}

interface EventOptions {
  /** Already run through firstPlain(). */
  name: string;
  /** Already run through firstPlain(). */
  description: string;
  /** Canonical URL of the event page. */
  url: string;
  startDate: Date;
  endDate?: Date;
  /** Venue display name, from the entry's `location`. */
  venueName: string;
  /** Structured venue address, from the entry's `venueAddress`. */
  venueAddress: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
  };
}

/**
 * A physical event. Only call this when the entry has a `venueAddress` — Google treats a
 * missing `location.address` as an error for Event rich results, so a Place with just a name
 * would publish an incomplete claim and earn nothing.
 *
 * Dates are emitted date-only. Frontmatter carries bare YYYY-MM-DD, and no start time is
 * published for these events; a fabricated 00:00 would tell search engines the event begins
 * at midnight.
 *
 * Two properties are conventional inferences rather than repo facts, and are marked as such:
 *   eventAttendanceMode — offline, since the venue is a physical address.
 *   eventStatus         — scheduled, the schema.org default reading for a listed event.
 *
 * Not emitted, for want of a source:
 *   offers      — registrationUrl exists, but an Offer needs a price and none is published.
 *                 Adding a price (or isAccessibleForFree) would unlock more rich-result
 *                 coverage.
 *   image       — the events collection has no image field, unlike news. Falling back to the
 *                 site-wide OG card would attach a generic photo to a specific event.
 *   performer   — no data.
 */
export function event({
  name,
  description,
  url,
  startDate,
  endDate,
  venueName,
  venueAddress,
}: EventOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    url,
    startDate: startDate.toISOString().slice(0, 10),
    ...(endDate ? { endDate: endDate.toISOString().slice(0, 10) } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: venueName,
      address: {
        '@type': 'PostalAddress',
        ...venueAddress,
        addressCountry: 'US',
      },
    },
    organizer: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'The REFINERY',
      url: `${SITE}/`,
    },
  };
}

interface ArticleOptions {
  /** Already run through firstPlain(). */
  headline: string;
  /** Already run through firstPlain(). */
  description: string;
  /** Canonical URL of the article page. */
  url: string;
  /** Publication date. */
  datePublished: Date;
  /** Author name from frontmatter — organizational by default, not a person. */
  author: string;
  /** Absolute URL to the hero image, when the entry has one. */
  image?: string;
  /** Absolute URL to the publisher logo. */
  publisherLogo: string;
  /** Primary category slug(s) from frontmatter. */
  sections?: string[];
}

/**
 * `Article` rather than `NewsArticle`: these are first-party build-progress and programme
 * updates, not journalism. The 25 curated third-party entries carry a sourceUrl and get no
 * page of their own, so they never reach this.
 *
 * dateModified is omitted on purpose. The news schema has no updatedDate field, and
 * astro.config.mjs already documents the same decision for sitemap lastmod — emitting
 * datePublished twice would assert a modification that never happened. Adding an optional
 * updatedDate to the collection schema is the clean way to earn it later.
 */
export function article({
  headline,
  description,
  url,
  datePublished,
  author,
  image,
  publisherLogo,
  sections,
}: ArticleOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    // Bare YYYY-MM-DD frontmatter dates parse as UTC midnight, so only the date part is
    // meaningful — publishing a fabricated time would be a precision the source lacks.
    datePublished: datePublished.toISOString().slice(0, 10),
    author: { '@type': 'Organization', name: author },
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'The REFINERY',
      logo: { '@type': 'ImageObject', url: publisherLogo },
    },
    ...(image ? { image } : {}),
    ...(sections?.length ? { articleSection: sections } : {}),
  };
}
