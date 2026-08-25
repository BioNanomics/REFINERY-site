import { describe, expect, it } from 'vitest';
import { bannerFor, resolveBanner, type BannerInput } from '../../src/utils/banners';

const frcWin = (over: Partial<BannerInput> = {}): BannerInput => ({
  program: 'FRC',
  typeKey: 'WINNER',
  placement: 1,
  placementMeaning: 'alliance-seat',
  eventLevel: 'regional',
  ...over,
});

const ftcInspire = (over: Partial<BannerInput> = {}): BannerInput => ({
  program: 'FTC',
  typeKey: 'INSPIRE',
  placement: 1,
  placementMeaning: 'rank',
  eventLevel: 'premier',
  ...over,
});

describe('bannerFor — FRC', () => {
  it('hangs blue for a winning alliance at a regional', () => {
    expect(bannerFor(frcWin())).toBe('blue');
  });

  it('hangs blue at a district and a district championship too', () => {
    // FRC has no premier-event restriction — every non-offseason win hangs.
    expect(bannerFor(frcWin({ eventLevel: 'district' }))).toBe('blue');
    expect(bannerFor(frcWin({ eventLevel: 'district-championship' }))).toBe('blue');
  });

  it('hangs blue for every seat on the winning alliance, not just the first', () => {
    // placement here is an alliance seat, so a 3rd seat is still a win.
    expect(bannerFor(frcWin({ placement: 3 }))).toBe('blue');
  });

  it('hangs blue for the Impact Award', () => {
    expect(bannerFor(frcWin({ typeKey: 'IMPACT', placementMeaning: undefined, placement: undefined }))).toBe('blue');
  });

  it('classifies a pre-rename Chairman’s Award identically to Impact', () => {
    // The rename this design exists to absorb: a 2016 entry carries the old display name
    // but the same typeKey, so it must not fall through to null. Nothing here reads `name`.
    expect(
      bannerFor({ program: 'FRC', typeKey: 'IMPACT', eventLevel: 'regional' }),
    ).toBe('blue');
  });

  it('hangs nothing for a finalist alliance', () => {
    expect(bannerFor(frcWin({ typeKey: 'FINALIST' }))).toBeNull();
  });

  it('hangs nothing for Engineering Inspiration or Rookie All-Star', () => {
    // Both are commonly called banner awards by teams. Under the rules this site uses they
    // are not, and that exclusion is deliberate — see the note in src/utils/banners.ts.
    expect(bannerFor(frcWin({ typeKey: 'ENGINEERING_INSPIRATION' }))).toBeNull();
    expect(bannerFor(frcWin({ typeKey: 'ROOKIE_ALL_STAR' }))).toBeNull();
  });

  it('hangs nothing for an offseason win', () => {
    expect(bannerFor(frcWin({ eventLevel: 'offseason' }))).toBeNull();
  });

  it('never hangs orange', () => {
    expect(bannerFor(frcWin())).not.toBe('orange');
  });
});

describe('bannerFor — FTC', () => {
  it('hangs orange for Inspire 1st at a premier event', () => {
    expect(bannerFor(ftcInspire())).toBe('orange');
  });

  it('hangs orange for a winning alliance at a premier event', () => {
    expect(
      bannerFor(ftcInspire({ typeKey: 'WINNER', placementMeaning: 'alliance-seat', placement: 2 })),
    ).toBe('orange');
  });

  it('hangs orange for every seat on a premier winning alliance', () => {
    // The alliance-seat trap, straight from FTC 22331's real record: `Winner, place 3` is
    // a win, not a third-place finish.
    expect(
      bannerFor(ftcInspire({ typeKey: 'WINNER', placementMeaning: 'alliance-seat', placement: 3 })),
    ).toBe('orange');
  });

  it('hangs nothing for Inspire 1st below a premier event', () => {
    expect(bannerFor(ftcInspire({ eventLevel: 'qualifier' }))).toBeNull();
    expect(bannerFor(ftcInspire({ eventLevel: 'league' }))).toBeNull();
  });

  it('hangs nothing for a 2nd or 3rd place Inspire', () => {
    expect(bannerFor(ftcInspire({ placement: 2 }))).toBeNull();
    expect(bannerFor(ftcInspire({ placement: 3 }))).toBeNull();
  });

  it('does not treat an alliance seat of 1 as a 1st-place Inspire', () => {
    // Guards the exact confusion the two placement meanings invite.
    expect(
      bannerFor(ftcInspire({ placementMeaning: 'alliance-seat', placement: 1 })),
    ).toBeNull();
  });

  it('hangs nothing for other judged awards, however well placed', () => {
    expect(bannerFor(ftcInspire({ typeKey: 'THINK' }))).toBeNull();
    expect(bannerFor(ftcInspire({ typeKey: 'DESIGN' }))).toBeNull();
  });

  it('never hangs blue', () => {
    expect(bannerFor(ftcInspire())).not.toBe('blue');
  });
});

describe('resolveBanner', () => {
  it('falls through to the derived value when there is no override', () => {
    expect(resolveBanner(frcWin())).toBe('blue');
    expect(resolveBanner(frcWin({ typeKey: 'FINALIST' }))).toBeNull();
  });

  it('lets an override suppress a banner the table would derive', () => {
    expect(resolveBanner({ ...frcWin(), banner: false })).toBeNull();
  });

  it('lets an override assert a banner the table does not derive', () => {
    expect(resolveBanner({ ...frcWin({ typeKey: 'ENGINEERING_INSPIRATION' }), banner: true })).toBe('blue');
  });

  it('keeps an asserted banner in the program’s own color', () => {
    // There is no such thing as an orange FRC banner, so an override picks whether a
    // banner hangs, never what color it is.
    expect(resolveBanner({ ...ftcInspire({ typeKey: 'THINK' }), banner: true })).toBe('orange');
  });
});
