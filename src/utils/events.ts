/**
 * Event date handling. Two quirks make this less obvious than a `date < new Date()`:
 *
 * Event frontmatter carries bare `YYYY-MM-DD` dates, which `z.coerce.date()` parses as UTC
 * midnight. Comparing that against a real timestamp would expire a same-day event at 7 or
 * 8pm the evening before, local time — the event would vanish from the site while it was
 * still on the calendar. So the comparison happens on date strings, in Fort Wayne's zone,
 * and never touches clock time at all.
 *
 * Note this is a build-time decision on a static site: an event stops appearing at the next
 * build, which the nightly cron in .github/workflows/deploy.yml exists to guarantee.
 */

/** Fort Wayne. Indiana's zone handling is its own adventure — let Intl do the work. */
export const SITE_TIMEZONE = 'America/Indiana/Indianapolis';

/** `en-CA` is the shortest route to a `YYYY-MM-DD` string out of Intl. */
const DAY_FORMAT = new Intl.DateTimeFormat('en-CA', { timeZone: SITE_TIMEZONE });

/** Today's date in Fort Wayne, as `YYYY-MM-DD`. */
export function localDay(now: Date = new Date()): string {
  return DAY_FORMAT.format(now);
}

/** The subset of event frontmatter that decides whether an event has passed. */
interface EventDates {
  dateStart: Date;
  dateEnd?: Date;
}

/**
 * True once the event's last day is over in Fort Wayne. Multi-day events run on `dateEnd`,
 * so they stay listed through the final day rather than disappearing after the first.
 *
 * `today` is injectable so callers can test the day-boundary case without waiting for it.
 */
export function isPastEvent(event: EventDates, today: string = localDay()): boolean {
  const lastDay = (event.dateEnd ?? event.dateStart).toISOString().slice(0, 10);
  return lastDay < today;
}
