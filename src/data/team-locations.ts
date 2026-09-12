/**
 * Lat/lng for each team's home location, keyed by teamSlug() (src/utils/teams.ts) — geocoded
 * from the `organization` + `community` already on file in src/content/teams (OpenStreetMap
 * Nominatim, 2026-09-12). Kept separate from the content collection because it's map-specific
 * geodata, not editorial content, and a team missing an entry here should just not get a pin
 * rather than fail the build — see ServiceAreaMap's build-time filter in about.astro.
 *
 * The three East Noble teams (8103/8431/8432) share one building and so share one coordinate
 * pair — not a mistake, the school really does host all three.
 */
// The REFINERY facility itself — 1750 Broadway, Fort Wayne (src/utils/facility.ts),
// geocoded the same way and the same day as the team locations below.
export const REFINERY_LOCATION = { lat: 41.0708005, lng: -85.1496599 };

export const TEAM_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  frc10172: { lat: 41.0533728, lng: -85.1361646 }, // South Side High School, Fort Wayne
  frc10332: { lat: 41.1903779, lng: -85.1937248 }, // Carroll High School, Fort Wayne
  frc10411: { lat: 41.0006509, lng: -85.1402664 }, // Wayne High School, Fort Wayne
  frc10434: { lat: 41.1452895, lng: -85.140416 }, // Northrop High School, Fort Wayne
  frc1501: { lat: 40.8767436, lng: -85.4807188 }, // Huntington County 4-H Fairgrounds
  frc4982: { lat: 41.0435517, lng: -85.2861491 }, // Homestead High School, Fort Wayne
  frc8103: { lat: 41.4353713, lng: -85.2566844 }, // East Noble High School, Kendallville
  frc8431: { lat: 41.4353713, lng: -85.2566844 }, // East Noble High School, Kendallville
  frc8432: { lat: 41.4353713, lng: -85.2566844 }, // East Noble High School, Kendallville
  frc8742: { lat: 40.3847206, lng: -85.6752657 }, // Madison-Grant High School, Fairmount
  frc9119: { lat: 41.0980177, lng: -85.1339381 }, // North Side High School, Fort Wayne
  frc9431: { lat: 41.1070545, lng: -85.0819578 }, // Snider High School, Fort Wayne
  ftc22331: { lat: 41.0583859, lng: -85.2135418 }, // Canterbury School, Fort Wayne
  ftc25638: { lat: 40.3847206, lng: -85.6752657 }, // Madison-Grant High School, Fairmount
  ftc36124: { lat: 41.0708005, lng: -85.1496599 }, // Amp Lab at The REFINERY, Fort Wayne
};
