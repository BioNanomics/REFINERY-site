import type { CollectionEntry } from 'astro:content';

/**
 * `linkedin` is a bare URL for one person, or one {name, url} per person when an entry covers
 * several — the founders share a card. Normalizing to one shape means callers render or emit
 * the same structure either way, and each profile keeps its own name rather than all of them
 * claiming the entry's.
 *
 * Shared by PeopleBios.astro (which gives each icon its own accessible name) and about.astro's
 * Person JSON-LD (which uses the URLs as sameAs). One definition, because how many humans an
 * entry covers is exactly the kind of rule that must not be answered differently in two files.
 */
export function linkedinProfiles(person: CollectionEntry<'people'>) {
  const { linkedin, name } = person.data;
  if (!linkedin) return [];
  return typeof linkedin === 'string' ? [{ name, url: linkedin }] : linkedin;
}
