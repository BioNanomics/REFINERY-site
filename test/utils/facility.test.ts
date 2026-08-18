import { describe, expect, it } from 'vitest';
import { FACILITY_ADDRESS, formatFacilityAddress } from '../../src/utils/facility';

describe('FACILITY_ADDRESS', () => {
  it('carries the published Fort Wayne address', () => {
    expect(FACILITY_ADDRESS).toEqual({
      streetAddress: '1750 Broadway',
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
      postalCode: '46802',
      addressCountry: 'US',
    });
  });
});

describe('formatFacilityAddress', () => {
  it('formats as US street, city, state zip — no country', () => {
    expect(formatFacilityAddress()).toBe('1750 Broadway, Fort Wayne, IN 46802');
  });

  it('derives from FACILITY_ADDRESS rather than duplicating it', () => {
    expect(formatFacilityAddress()).toContain(FACILITY_ADDRESS.streetAddress);
    expect(formatFacilityAddress()).toContain(FACILITY_ADDRESS.postalCode);
  });
});
