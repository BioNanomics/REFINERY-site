import { describe, expect, it } from 'vitest';
import {
  article,
  breadcrumbList,
  event,
  facility,
  ORG_ID,
  organization,
  person,
  personId,
  sportsTeam,
  website,
} from '../../src/utils/schema';

describe('personId', () => {
  it('derives a stable @id from the entry id', () => {
    expect(personId('doug-and-kim-horner')).toBe(
      'https://refineryrobotics.org/#person-doug-and-kim-horner',
    );
  });
});

describe('organization', () => {
  const base = { logo: 'https://example.com/logo.png', image: 'https://example.com/og.png', description: 'A robotics nonprofit.' };

  it('builds an Organization node without a founder when none is given', () => {
    const node = organization(base);
    expect(node['@type']).toBe('Organization');
    expect(node['@id']).toBe(ORG_ID);
    expect(node.name).toBe('The REFINERY');
    expect(node.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: '1750 Broadway',
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
      postalCode: '46802',
      addressCountry: 'US',
    });
    expect(node).not.toHaveProperty('founder');
    expect(node.parentOrganization.name).toBe('BioNanomics');
  });

  it('includes a founder node sharing the given @id when a founder is given', () => {
    const node = organization({
      ...base,
      founder: { name: 'Doug and Kim Horner', id: personId('doug-and-kim-horner') },
    });
    expect(node.founder).toEqual({
      '@type': 'Person',
      '@id': personId('doug-and-kim-horner'),
      name: 'Doug and Kim Horner',
    });
  });

  it('never claims a GitHub sameAs profile', () => {
    const node = organization(base);
    expect(node.sameAs.some((url: string) => url.includes('github'))).toBe(false);
  });
});

describe('event', () => {
  const base = {
    name: 'Monster Match',
    description: 'A scrimmage.',
    url: 'https://refineryrobotics.org/programs-events/monster-match/',
    startDate: new Date('2026-10-05T00:00:00Z'),
    venueName: 'The REFINERY',
    venueAddress: {
      streetAddress: '1750 Broadway',
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
      postalCode: '46802',
    },
  };

  it('emits date-only startDate, with no fabricated time', () => {
    const node = event(base);
    expect(node.startDate).toBe('2026-10-05');
    expect(node).not.toHaveProperty('endDate');
  });

  it('includes endDate only when one is given', () => {
    const node = event({ ...base, endDate: new Date('2026-10-06T00:00:00Z') });
    expect(node.endDate).toBe('2026-10-06');
  });

  it('appends US as the venue address country', () => {
    const node = event(base);
    expect(node.location.address.addressCountry).toBe('US');
  });

  it('omits offers entirely when isFree is not set', () => {
    const node = event(base);
    expect(node).not.toHaveProperty('offers');
    expect(node).not.toHaveProperty('isAccessibleForFree');
  });

  it('emits a zero-price offer when isFree is true', () => {
    const node = event({ ...base, isFree: true });
    expect(node.isAccessibleForFree).toBe(true);
    expect(node.offers).toEqual({ '@type': 'Offer', price: '0', priceCurrency: 'USD' });
  });

  it('attaches the registration URL to the offer only when the event is free', () => {
    const withRegistration = event({
      ...base,
      isFree: true,
      registrationUrl: 'https://example.com/register',
    });
    expect(withRegistration.offers!.url).toBe('https://example.com/register');

    // Registration URL without isFree must not leak into a fabricated offers node.
    const notFree = event({ ...base, registrationUrl: 'https://example.com/register' });
    expect(notFree).not.toHaveProperty('offers');
  });

  it('points organizer at the shared ORG_ID', () => {
    expect(event(base).organizer['@id']).toBe(ORG_ID);
  });
});

describe('article', () => {
  const base = {
    headline: 'REFINERY BLITZ kicks off summer build',
    description: 'Summary.',
    url: 'https://refineryrobotics.org/news/example/',
    datePublished: new Date('2026-07-01T00:00:00Z'),
    author: 'The REFINERY',
    authorType: 'organization' as const,
    publisherLogo: 'https://example.com/logo.png',
  };

  it('types the author as Organization for authorType "organization"', () => {
    expect(article(base).author).toEqual({ '@type': 'Organization', name: 'The REFINERY' });
  });

  it('types the author as Person for authorType "person"', () => {
    const node = article({ ...base, author: 'Cameron Elder', authorType: 'person' });
    expect(node.author).toEqual({ '@type': 'Person', name: 'Cameron Elder' });
  });

  it('omits image and articleSection when absent', () => {
    const node = article(base);
    expect(node).not.toHaveProperty('image');
    expect(node).not.toHaveProperty('articleSection');
  });

  it('includes image and articleSection when given', () => {
    const node = article({ ...base, image: 'https://example.com/hero.jpg', sections: ['teams'] });
    expect(node.image).toBe('https://example.com/hero.jpg');
    expect(node.articleSection).toEqual(['teams']);
  });

  it('omits articleSection for an empty sections array rather than emitting []', () => {
    expect(article({ ...base, sections: [] })).not.toHaveProperty('articleSection');
  });

  it('never emits dateModified', () => {
    expect(article(base)).not.toHaveProperty('dateModified');
  });
});

describe('facility', () => {
  it('omits hasMap when not given', () => {
    const node = facility({ url: 'https://refineryrobotics.org/about/' });
    expect(node.location).not.toHaveProperty('hasMap');
  });

  it('includes hasMap when given', () => {
    const node = facility({
      url: 'https://refineryrobotics.org/about/',
      hasMap: 'https://maps.google.com/?q=1750+Broadway',
    });
    expect(node.location.hasMap).toBe('https://maps.google.com/?q=1750+Broadway');
  });

  it('is typed Organization, not LocalBusiness', () => {
    expect(facility({ url: 'https://refineryrobotics.org/about/' })['@type']).toBe('Organization');
  });
});

describe('person', () => {
  it('omits optional fields entirely when absent', () => {
    const node = person({ id: personId('cameron-elder'), name: 'Cameron Elder' });
    expect(node).not.toHaveProperty('jobTitle');
    expect(node).not.toHaveProperty('description');
    expect(node).not.toHaveProperty('image');
    expect(node).not.toHaveProperty('sameAs');
  });

  it('includes optional fields when given', () => {
    const node = person({
      id: personId('cameron-elder'),
      name: 'Cameron Elder',
      jobTitle: 'Mentor',
      description: 'A mentor.',
      image: 'https://example.com/cameron.jpg',
      sameAs: ['https://linkedin.com/in/cameron'],
    });
    expect(node.jobTitle).toBe('Mentor');
    expect(node.sameAs).toEqual(['https://linkedin.com/in/cameron']);
  });

  it('omits sameAs for an empty array', () => {
    expect(person({ id: personId('x'), name: 'X', sameAs: [] })).not.toHaveProperty('sameAs');
  });

  it('always attaches worksFor pointing at ORG_ID', () => {
    expect(person({ id: personId('x'), name: 'X' }).worksFor).toEqual({
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'The REFINERY',
    });
  });
});

describe('website', () => {
  it('has no potentialAction / SearchAction', () => {
    expect(website()).not.toHaveProperty('potentialAction');
  });
});

describe('breadcrumbList', () => {
  it('numbers items from 1 and includes item/url on every non-final crumb', () => {
    const node = breadcrumbList([
      { name: 'Home', url: 'https://refineryrobotics.org/' },
      { name: 'News', url: 'https://refineryrobotics.org/news/' },
      { name: 'Example story' },
    ]);
    expect(node.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://refineryrobotics.org/' },
      { '@type': 'ListItem', position: 2, name: 'News', item: 'https://refineryrobotics.org/news/' },
      { '@type': 'ListItem', position: 3, name: 'Example story' },
    ]);
  });

  it('omits `item` for a crumb with no url, regardless of position', () => {
    const node = breadcrumbList([{ name: 'Only crumb' }]);
    expect(node.itemListElement[0]).not.toHaveProperty('item');
  });

  it('trusts the caller to omit url on the last crumb rather than dropping it itself', () => {
    // The "final crumb has no item" rule (see the docstring) is enforced by every call site
    // omitting `url`, not by this builder inspecting array position.
    const node = breadcrumbList([{ name: 'Only crumb', url: 'https://refineryrobotics.org/' }]);
    expect(node.itemListElement[0]).toHaveProperty('item');
  });
});

describe('sportsTeam', () => {
  const minimal = {
    name: 'T.H.R.U.S.T.',
    teamNumber: '1501',
    programName: 'FIRST® Robotics Competition',
    url: 'https://refineryrobotics.org/teams/frc1501/',
    description: 'FRC® team from Huntington County 4-H, competing since 2005.',
  };

  it('types the node as a SportsTeam and carries the number as an identifier', () => {
    const node = sportsTeam(minimal);
    expect(node['@type']).toBe('SportsTeam');
    expect(node.identifier).toEqual({
      '@type': 'PropertyValue',
      propertyID: 'FIRST team number',
      value: '1501',
    });
    // The number belongs in identifier, not smuggled into name.
    expect(node.name).toBe('T.H.R.U.S.T.');
    expect(node.alternateName).toBe('FIRST® Robotics Competition 1501');
  });

  it('omits every absent optional as a key rather than emitting a null', () => {
    const node = sportsTeam(minimal);
    for (const key of ['logo', 'image', 'memberOf', 'location', 'foundingDate', 'award', 'sponsor', 'sameAs']) {
      expect(node).not.toHaveProperty(key);
    }
  });

  it('omits properties for empty arrays instead of emitting []', () => {
    // The guard the spread pattern exists for: an entry with `awards: []` (the schema
    // default) must produce no `award` key at all, not an empty one.
    const node = sportsTeam({ ...minimal, awards: [], sameAs: [] });
    expect(node).not.toHaveProperty('award');
    expect(node).not.toHaveProperty('sameAs');
  });

  it('never emits a sponsor, which this site deliberately does not publish', () => {
    // Not an oversight: other teams' sponsor lists are those sponsors' marks to publish.
    // Asserted so the property can't reappear without someone revisiting that decision.
    const node = sportsTeam({ ...minimal, awards: ['Winning Alliance, State, 2024'] });
    expect(node).not.toHaveProperty('sponsor');
  });

  it('nests location as a Place with a US PostalAddress', () => {
    const node = sportsTeam({
      ...minimal,
      location: { addressLocality: 'Huntington', addressRegion: 'IN' },
    });
    expect(node.location).toEqual({
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Huntington',
        addressRegion: 'IN',
        addressCountry: 'US',
      },
    });
  });

  it('emits foundingDate as a year string, not a number or a padded date', () => {
    const node = sportsTeam({ ...minimal, foundingYear: 2005 });
    expect(node.foundingDate).toBe('2005');
  });

  it('passes award labels through verbatim', () => {
    const node = sportsTeam({
      ...minimal,
      awards: ['Winning Alliance, Miami Valley Regional, 2026'],
    });
    expect(node.award).toEqual(['Winning Alliance, Miami Valley Regional, 2026']);
  });

  it('never claims a relationship between the team and The REFINERY', () => {
    // The deliberate omission this builder is built around: the site SUPPORTS these teams,
    // which is neither membership nor sponsorship. This is the regression test protecting
    // that decision from a well-meaning future edit.
    const node = sportsTeam({ ...minimal, memberOf: 'Huntington County 4-H' });
    expect(JSON.stringify(node)).not.toContain(ORG_ID);
    expect(JSON.stringify(node)).not.toContain('The REFINERY');
    expect(node.memberOf).toEqual({ '@type': 'Organization', name: 'Huntington County 4-H' });
    expect(node).not.toHaveProperty('sponsor');
  });
});
