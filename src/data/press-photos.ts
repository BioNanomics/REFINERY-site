/**
 * One entry per photo in src/assets/press/photos/. The press page globs that folder and looks
 * each file up here; a photo with no entry (or an entry with no file) fails `npm test`, so a
 * photo can never ship without alt text and a caption. Same rule as heroImageAlt in
 * src/content.config.ts, for the same reason: alt="" tells a screen reader the picture of a
 * team is decorative.
 *
 * Keys are the exact filename. Keep the naming style the files already use
 * (`REFINERY_2026-07-28_01.jpg`: who shot it, the day, a sequence number) so the folder sorts
 * by date on its own.
 *
 * `alt` describes what is in the frame. `caption` is the one line shown under the thumbnail
 * and is what a reporter will paste into a cutline, so it should name the event and date.
 * Don't name students in either: first name and last initial at most. See "Naming students"
 * in CONTRIBUTING.md.
 *
 * `credit` defaults to USAGE_TERMS.photoCredit in src/data/press.ts; set it only for a photo
 * that needs a different line.
 */
export interface PressPhotoMeta {
  alt: string;
  caption: string;
  credit?: string;
}

export const PRESS_PHOTOS: Record<string, PressPhotoMeta> = {
  // Add entries as photos are added to src/assets/press/photos/, for example:
  //
  // 'REFINERY_2026-07-28_01.jpg': {
  //   alt: 'Two students in safety glasses fit a swerve module to a robot chassis on a workbench',
  //   caption: 'Summer build at The REFINERY, Fort Wayne, July 28, 2026',
  // },
};
