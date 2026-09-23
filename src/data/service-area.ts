/**
 * The counties The REFINERY serves, and the towns in each, in one place.
 *
 * The About page's "Where We Serve" list and the Organization node's `areaServed` both read
 * this, so the visible copy and the structured data can't drift apart — schema.ts's ground
 * rule is that every structured claim traces to something the site already says, and this
 * list is what makes the towns a published claim.
 *
 * `towns` is every incorporated city and town in the county — county seat first, then any
 * town hosting a team we back, then the rest alphabetically. /about/ renders the full list
 * behind an "Is my area/organization covered?" disclosure: visible, indexable copy, so it
 * can back the structured data too. Never add a place here that the page won't render:
 * hidden or markup-only place names are a spam-policy problem, not an SEO trick.
 *
 * Source: each county's Wikipedia "Cities and towns" section (checked
 * 2026-09). A town that straddles a county line is listed under every county whose section
 * lists it (Ashley, Hamilton, Markle, Wolcottville, Zanesville); places with only a sliver
 * in a county that its section omits (Nappanee, Converse) are left out.
 *
 * The list covers counties without a team too, on purpose — the point is that schools there
 * can find us and know we'll help them start one.
 *
 * County names must match COUNTY_NAME in service-area-counties.json, which draws the map.
 */

export interface ServiceCounty {
  /** Bare county name, as on the map: "Wells", not "Wells County". */
  name: string;
  /** Every incorporated city and town: county seat first, then team towns, then the rest. */
  towns: string[];
}

export const serviceCounties: ServiceCounty[] = [
  {
    name: 'Adams',
    towns: ['Decatur', 'Berne', 'Geneva', 'Monroe'],
  },
  {
    name: 'Allen',
    towns: ['Fort Wayne', 'Grabill', 'Huntertown', 'Leo-Cedarville', 'Monroeville', 'New Haven', 'Woodburn', 'Zanesville'],
  },
  {
    name: 'DeKalb',
    towns: ['Auburn', 'Altona', 'Ashley', 'Butler', 'Corunna', 'Garrett', 'Hamilton', 'Saint Joe', 'Waterloo'],
  },
  {
    name: 'Grant',
    towns: ['Marion', 'Fairmount', 'Fowlerton', 'Gas City', 'Jonesboro', 'Matthews', 'Swayzee', 'Sweetser', 'Upland', 'Van Buren'],
  },
  {
    name: 'Huntington',
    towns: ['Huntington', 'Andrews', 'Markle', 'Mount Etna', 'Roanoke', 'Warren'],
  },
  {
    name: 'Kosciusko',
    towns: ['Warsaw', 'Burket', 'Claypool', 'Etna Green', 'Leesburg', 'Mentone', 'Milford', 'North Webster', 'Pierceton', 'Sidney', 'Silver Lake', 'Syracuse', 'Winona Lake'],
  },
  {
    name: 'LaGrange',
    towns: ['LaGrange', 'Shipshewana', 'Topeka', 'Wolcottville'],
  },
  {
    name: 'Noble',
    towns: ['Albion', 'Kendallville', 'Avilla', 'Cromwell', 'Ligonier', 'Rome City', 'Wolcottville'],
  },
  {
    name: 'Steuben',
    towns: ['Angola', 'Ashley', 'Clear Lake', 'Fremont', 'Hamilton', 'Hudson', 'Orland'],
  },
  {
    name: 'Wabash',
    towns: ['Wabash', 'LaFontaine', 'Lagro', 'North Manchester', 'Roann'],
  },
  {
    name: 'Wells',
    towns: ['Bluffton', 'Markle', 'Ossian', 'Poneto', 'Uniondale', 'Vera Cruz', 'Zanesville'],
  },
  {
    name: 'Whitley',
    towns: ['Columbia City', 'Churubusco', 'Larwill', 'South Whitley'],
  },
];

/** "Adams, Allen, …, Wells, and Whitley" for running copy. */
export const countyListPhrase = (() => {
  const names = serviceCounties.map((c) => c.name);
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
})();
