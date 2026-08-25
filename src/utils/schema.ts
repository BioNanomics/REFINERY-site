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
 *
 * Organization.description uses the homepage meta description rather than the About page's
 * mission statement. Both are approved copy now, but the meta description is the tighter
 * one-liner and is already what search engines display, so the two stay consistent. The
 * mission statement is carried in full by public/llms.txt.
 */

import { FACILITY_ADDRESS } from './facility';

const SITE = 'https://refineryrobotics.org';

/** Stable @id so other nodes can reference the org rather than duplicating it. */
export const ORG_ID = `${SITE}/#organization`;

/** Stable @id for the Fort Wayne building, distinct from the organization that occupies it. */
export const FACILITY_ID = `${SITE}/#facility`;

/**
 * Stable @id for a person, keyed on their people-collection entry id.
 *
 * Person nodes get identifiers where a BreadcrumbList doesn't because a person is a real
 * external entity that other nodes point at: the homepage's Organization names its founder,
 * and the full Person node describing that same human lives on /about/. Without a shared @id
 * those are two unrelated nodes that happen to carry the same name string.
 */
export function personId(entryId: string) {
  return `${SITE}/#person-${entryId}`;
}

interface OrgOptions {
  /** Absolute URL to the logo asset. */
  logo: string;
  /** Absolute URL to a representative raster image. */
  image: string;
  /** Already run through firstPlain(). */
  description: string;
  /**
   * The founder, read from the people collection by the caller rather than written here, so
   * one name doesn't live in two files. `id` must be personId() of the same entry that
   * produces the full Person node on /about/ — that shared identifier is what makes the two
   * nodes one entity instead of two lookalikes. Omitted entirely when no entry is flagged.
   */
  founder?: { name: string; id: string };
}

/**
 * The REFINERY as an Organization. Sources, all current as of writing:
 *   name, alternateName, sameAs  -> src/components/nav/SiteFooter.astro
 *   email                        -> src/components/nav/SiteFooter.astro
 *   address                      -> src/utils/facility.ts (shared with the visible copy on /about/)
 *   parentOrganization           -> src/pages/donate.astro, README.md
 *   founder                      -> src/content/people/doug-and-kim-horner.mdx
 *   description                  -> the page's own meta description
 */
export function organization({ logo, image, description, founder }: OrgOptions) {
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
      ...FACILITY_ADDRESS,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Northeast Indiana',
    },
    // Name and @id both come from the people collection entry, so this node and the full
    // Person node on /about/ are the same entity by identifier, not just by matching strings.
    ...(founder
      ? { founder: { '@type': 'Person', '@id': founder.id, name: founder.name } }
      : {}),
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
  /** True for a free event. Undefined means admission terms are unknown. */
  isFree?: boolean;
  /** Registration URL, used as the Offer url when the event is free. */
  registrationUrl?: string;
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
 * `offers` is emitted only for an event marked `isFree`, as a zero-price Offer — the standard
 * way to signal free admission. An event with unknown admission terms gets no offers node,
 * since an Offer requires a price and guessing one would misstate the cost of attending.
 * `availability` is left off deliberately: it is a point-in-time claim baked into a static
 * build, so a sold-out or closed registration would keep advertising InStock until someone
 * redeployed. The detail page states free admission visibly whenever this is set, so the
 * markup never claims something a reader can't see.
 *
 * Not emitted, for want of a source:
 *   image       — the events collection has no image field, unlike news. Falling back to the
 *                 site-wide OG card would attach a generic photo to a specific event.
 *   performer   — no data.
 *   validFrom   — no published registration-opening date.
 */
export function event({
  name,
  description,
  url,
  startDate,
  endDate,
  venueName,
  venueAddress,
  isFree,
  registrationUrl,
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
    ...(isFree
      ? {
          isAccessibleForFree: true,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            ...(registrationUrl ? { url: registrationUrl } : {}),
          },
        }
      : {}),
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
  /** Author name from frontmatter. */
  author: string;
  /** From the entry's `authorType` — determines whether `author` is typed Organization or Person. */
  authorType: 'organization' | 'person';
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
 * `authorType` decides whether `author` is typed Organization or Person — the two aren't
 * interchangeable, and the frontmatter `author` string alone doesn't say which "The REFINERY"
 * and a staffer's byline are. Defaulting the collection schema to 'organization' means this
 * only needs setting when a first-party post is actually signed by a person.
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
  authorType,
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
    author: { '@type': authorType === 'person' ? 'Person' : 'Organization', name: author },
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

interface FacilityOptions {
  /** Absolute URL of the page that describes the facility. */
  url: string;
  /** Absolute Google Maps URL — the same one the page links visibly. */
  hasMap?: string;
}

/**
 * The Fort Wayne facility, for the About page.
 *
 * Typed `Place`, NOT `LocalBusiness`. LocalBusiness asserts commercial premises and invites
 * Google to expect openingHours and priceRange; this is an appointment-only nonprofit shop.
 *
 * schema.org gives Place no "occupied by" property, so the relationship is expressed the other
 * way round: an Organization stub at ORG_ID carrying the building as `location`. That reuses
 * the same stub-referencing-ORG_ID idiom as article()'s publisher, and it means the homepage's
 * full Organization node and this one describe the same entity rather than competing.
 *
 * Deliberately omitted:
 *   openingHours   — there are none. public/llms.txt: visits are by appointment.
 *   geo            — no coordinates published anywhere on the site.
 *   telephone      — still no public number; see the note at the top of this file.
 *   publicAccess   — appointment-only is a scheduling arrangement, not a public/private flag.
 *   amenityFeature — the "In the shop" list is equipment, not schema.org amenities.
 *   image          — the only candidate is the site-wide OG card, which is a generic social
 *                    image doing double duty rather than a photograph of this building.
 */
export function facility({ url, hasMap }: FacilityOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'The REFINERY',
    url: `${SITE}/`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    location: {
      '@type': 'Place',
      '@id': FACILITY_ID,
      name: 'The REFINERY',
      address: {
        '@type': 'PostalAddress',
        ...FACILITY_ADDRESS,
      },
      ...(hasMap ? { hasMap } : {}),
    },
  };
}

interface PersonOptions {
  /** personId() of this entry, so the Organization's founder can point at the same node. */
  id: string;
  name: string;
  /** The entry's `role`, verbatim. */
  jobTitle?: string;
  /** Already run through firstPlain(). */
  description?: string;
  /** Absolute URL to a portrait. */
  image?: string;
  /** Absolute profile URLs — LinkedIn today. */
  sameAs?: string[];
}

/**
 * A person on the About page. Every field traces to that page's own copy: name and role from
 * the card, description from the entry's bio, image from the portrait, sameAs from the LinkedIn
 * icon already rendered beside them.
 *
 * One caveat worth knowing about. The people collection lets a single entry cover more than one
 * human — the founders share a card — and such an entry stays ONE node here, matching how the
 * site presents them and how organization()'s `founder` already reads. A combined entity is
 * also what makes the joint photo and joint bio honest to attach: both depict and describe the
 * pair, which is exactly what the node claims. Splitting them into two Person nodes would mean
 * dropping both fields, since neither is about either individual alone.
 */
export function person({ id, name, jobTitle, description, image, sameAs }: PersonOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': id,
    name,
    ...(jobTitle ? { jobTitle } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
    worksFor: { '@type': 'Organization', '@id': ORG_ID, name: 'The REFINERY' },
  };
}

/**
 * The site itself. Every value is either SITE or traceable: `name` from og:site_name and the
 * footer, `inLanguage` from <html lang="en"> plus og:locale.
 *
 * No `potentialAction`/SearchAction. There is no site search, and declaring a query endpoint
 * that doesn't exist is a promise Google tests and finds broken.
 */
export function website() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE}/#website`,
    name: 'The REFINERY',
    url: `${SITE}/`,
    inLanguage: 'en-US',
    publisher: { '@type': 'Organization', '@id': ORG_ID, name: 'The REFINERY' },
  };
}

interface BreadcrumbItem {
  /** Already run through firstPlain(). */
  name: string;
  /** Absolute URL. Omitted on the last item — see below. */
  url?: string;
}

/**
 * A breadcrumb trail. Built by MarketingLayout from its `breadcrumbs` prop, so the visible
 * <nav> and this markup are always derived from the same array and can't drift apart.
 *
 * The final item gets a `name` but no `item`. Google allows this for the page the reader is
 * already on, and it's the honest reading — that crumb renders as text, not a link, so
 * pointing `item` at the current URL would assert a link the page doesn't contain.
 *
 * No `@id`: nothing else references a breadcrumb trail, so a stable identifier would just be
 * noise. Contrast ORG_ID, which exists precisely because other nodes point at it.
 */
export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      ...(url ? { item: url } : {}),
    })),
  };
}

interface SportsTeamOptions {
  /** The team name, as the page's <h1> renders it. */
  name: string;
  /** The entry's `number`. Emitted as an identifier, not folded into `name`. */
  teamNumber: string;
  /** Full program name from PROGRAM_NAMES, already run through firstPlain(). */
  programName: string;
  /** Canonical URL of the team page. */
  url: string;
  /** Already run through firstPlain(). */
  description: string;
  /** Absolute URL to the team's logo, when the entry has one. */
  logo?: string;
  /**
   * Absolute URL to the team's banner photo. Deliberately NOT defaulted to the logo — team
   * logos are transparent artwork at arbitrary aspect ratios, and pointing `image` at one
   * publishes a claim that it represents the team photographically, which it doesn't.
   */
  image?: string;
  /** The entry's `organization`, verbatim — the page shows it in the facts row. */
  memberOf?: string;
  /** From parseCommunity(). Undefined whenever `community` doesn't parse. */
  location?: { addressLocality: string; addressRegion: string };
  /** The entry's `rookieYear`, only when the page states it. */
  foundingYear?: number;
  /** Award labels, one per award ACTUALLY RENDERED on the page. */
  awards?: string[];
  /** Every outbound URL the page links: the team's socials plus its `links` row. */
  sameAs?: string[];
}

/**
 * A team The REFINERY supports. Every value traces to something the detail page renders:
 *   name, description, logo   -> the entry's own frontmatter, shown in the identity block
 *   memberOf                  -> the entry's `organization`, shown in the facts row
 *   location                  -> the entry's `community`, via parseCommunity()
 *   foundingDate              -> the entry's `rookieYear`, shown as "Competing since YYYY"
 *   award                     -> the awards section, via formatAward()
 *   sameAs                    -> the links row and the social icon row
 *
 * Typed SportsTeam rather than a plain Organization: it is the most specific type that is
 * true of a team entered in a season-long competition, and it is what makes `sport`, `award`,
 * and `memberOf` mean something instead of reading as generic Organization fields. Note for
 * anyone revisiting this — FIRST's own "Sport for the Mind" framing is NOT the justification;
 * that phrase is FIRST's mark, not a claim this site gets to make. If `sport` ever reads
 * wrong, plain Organization is the conservative fall-back and costs only those three
 * properties.
 *
 * NO relationship to The REFINERY is emitted, and that is the deliberate part. The site says
 * it SUPPORTS these teams. `memberOf: ORG_ID` would claim they are part of the organization
 * and `sponsor` would claim it funds them; neither is what any page says, and schema.org has
 * no property that means "supports". Referencing ORG_ID here would be the tempting mistake,
 * so a test asserts this node never contains it.
 *
 * `sameAs` includes a team's GitHub, where organization() deliberately excludes ours. Not an
 * inconsistency: the footer's GitHub is BioNanomics' org account and would misidentify The
 * REFINERY, whereas `socials.github` belongs to the team itself. The Blue Alliance, FTC
 * Events, and FTCScout links qualify for the same reason — each unambiguously identifies
 * this team.
 *
 * Deliberately omitted, for want of a source: coach, athlete, numberOfEmployees, and any
 * sibling-team property (schema.org has none, and `subOrganization` would misstate a
 * relationship between two independently chartered teams).
 *
 * `sponsor` is also absent, and that one is a decision rather than a gap. The site does not
 * publish other teams' sponsor lists: a sponsor's name and logo are that sponsor's own
 * marks, and republishing them on a third party's behalf is an exposure The REFINERY has no
 * reason to take on. If that ever changes, the property goes here — but the visible page has
 * to say it first.
 */
export function sportsTeam({
  name,
  teamNumber,
  programName,
  url,
  description,
  logo,
  image,
  memberOf,
  location,
  foundingYear,
  awards,
  sameAs,
}: SportsTeamOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    name,
    // How the team is universally referred to in the community — "FRC 1501" — which is a
    // genuine alternate name, unlike the number alone.
    alternateName: `${programName} ${teamNumber}`,
    // The number is an identifier, not part of the name. PropertyValue with an explicit
    // propertyID says which numbering scheme it belongs to.
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'FIRST team number',
      value: teamNumber,
    },
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    description,
    sport: programName,
    ...(logo ? { logo } : {}),
    ...(image ? { image } : {}),
    ...(memberOf ? { memberOf: { '@type': 'Organization', name: memberOf } } : {}),
    ...(location
      ? {
          location: {
            '@type': 'Place',
            address: { '@type': 'PostalAddress', ...location, addressCountry: 'US' },
          },
        }
      : {}),
    // Year-only. FIRST publishes a rookie YEAR, not a founding date, and padding it to
    // January 1 would invent a precision the source doesn't have.
    ...(foundingYear ? { foundingDate: String(foundingYear) } : {}),
    ...(awards?.length ? { award: awards } : {}),
    ...(sameAs?.length ? { sameAs } : {}),
  };
}
