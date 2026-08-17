/**
 * The Fort Wayne facility's address, in one place.
 *
 * It previously existed twice in two shapes: a flat display string in src/pages/about.astro
 * (without the postal code) and the structured PostalAddress fields inside
 * src/utils/schema.ts. Nothing kept them in agreement, and the visible copy and the
 * structured data are claims about the same building.
 *
 * The display form is DERIVED from the structured parts rather than written out separately,
 * so the two cannot drift. That means the postal code now shows on /about/ as well — a
 * deliberate call, and not a new claim: public/llms.txt already publishes it.
 *
 * This lives here rather than in schema.ts because about.astro consumes it for visible copy
 * and for the Google Maps URLs. A JSON-LD module shouldn't be the source of page content.
 */

export const FACILITY_ADDRESS = {
  streetAddress: '1750 Broadway',
  addressLocality: 'Fort Wayne',
  addressRegion: 'IN',
  postalCode: '46802',
  addressCountry: 'US',
} as const;

/**
 * US postal convention: street, city, then state and ZIP separated by a space rather than a
 * comma. `addressCountry` is deliberately left out — it belongs in the structured data, not
 * in a domestic address rendered for a regional audience.
 */
export function formatFacilityAddress() {
  const { streetAddress, addressLocality, addressRegion, postalCode } = FACILITY_ADDRESS;
  return `${streetAddress}, ${addressLocality}, ${addressRegion} ${postalCode}`;
}
