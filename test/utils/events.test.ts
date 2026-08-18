import { describe, expect, it } from 'vitest';
import { isPastEvent, localDay, SITE_TIMEZONE } from '../../src/utils/events';

describe('SITE_TIMEZONE', () => {
  it('is Fort Wayne', () => {
    expect(SITE_TIMEZONE).toBe('America/Indiana/Indianapolis');
  });
});

describe('localDay', () => {
  it('formats a UTC midday timestamp as the Fort Wayne calendar date', () => {
    // Noon UTC is safely within the same day in an America/Indiana/Indianapolis offset
    // (UTC-4/UTC-5), so this is the unambiguous case.
    expect(localDay(new Date('2026-06-15T12:00:00Z'))).toBe('2026-06-15');
  });

  it('rolls a late-UTC-evening timestamp back to the prior local day', () => {
    // 2am UTC is 9-10pm the previous evening in Fort Wayne — the exact discrepancy
    // isPastEvent is built to avoid by never comparing against clock time.
    expect(localDay(new Date('2026-06-15T02:00:00Z'))).toBe('2026-06-14');
  });
});

describe('isPastEvent', () => {
  it('is false for a single-day event happening today', () => {
    expect(isPastEvent({ dateStart: new Date('2026-06-15T00:00:00Z') }, '2026-06-15')).toBe(false);
  });

  it('is false for a single-day event happening in the future', () => {
    expect(isPastEvent({ dateStart: new Date('2026-06-16T00:00:00Z') }, '2026-06-15')).toBe(false);
  });

  it('is true for a single-day event that already happened', () => {
    expect(isPastEvent({ dateStart: new Date('2026-06-14T00:00:00Z') }, '2026-06-15')).toBe(true);
  });

  it('uses dateEnd rather than dateStart for a multi-day event', () => {
    const event = {
      dateStart: new Date('2026-06-10T00:00:00Z'),
      dateEnd: new Date('2026-06-15T00:00:00Z'),
    };
    // Still running: today falls on the last day.
    expect(isPastEvent(event, '2026-06-15')).toBe(false);
    // Started days ago but hasn't reached its last day yet.
    expect(isPastEvent(event, '2026-06-12')).toBe(false);
  });

  it('is true the day after a multi-day event ends', () => {
    const event = {
      dateStart: new Date('2026-06-10T00:00:00Z'),
      dateEnd: new Date('2026-06-15T00:00:00Z'),
    };
    expect(isPastEvent(event, '2026-06-16')).toBe(true);
  });

  it('defaults `today` to the current Fort Wayne date when not supplied', () => {
    const future = { dateStart: new Date(Date.UTC(2999, 0, 1)) };
    const past = { dateStart: new Date(Date.UTC(2000, 0, 1)) };
    expect(isPastEvent(future)).toBe(false);
    expect(isPastEvent(past)).toBe(true);
  });
});
