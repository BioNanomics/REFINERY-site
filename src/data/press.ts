/**
 * Everything the press portal (src/pages/press.astro) lists that isn't already in a content
 * collection: who to call, what the files may be used for, and the downloadable files
 * themselves. One place, so the page, the PDF press kit and the folder READMEs can't drift.
 *
 * Framework-free by design (same reasoning as src/utils/dates.ts): test/data/press.test.ts
 * imports this under plain vitest and checks that every file listed here actually exists
 * under public/press/, so a renamed or forgotten upload fails `npm test` instead of shipping
 * a dead download link.
 *
 * Why the files live under public/ rather than src/assets/: a reporter wants the file as
 * delivered (a PDF, a transparent PNG, an SVG), byte for byte, and public/ serves exactly
 * that. src/assets/ would run every image through the optimizer, which is right for a page
 * and wrong for a logo someone is about to drop into a broadcast graphic.
 *
 * Photos are the exception: they live in src/assets/press/photos/ so the page can render
 * small thumbnails, and the full-size download is produced at build time. See `PRESS_PHOTOS`
 * below and src/assets/press/photos/README.md for how to add one.
 */

/** Where every static press file lives, relative to the site root. */
export const PRESS_DIR = 'press';

export const PRESS_CONTACT = {
  name: 'Cameron Elder',
  // The press kit's own wording. The people collection calls the same role "Media
  // Development Director"; the kit went out under this title, so the portal matches the kit.
  role: 'Creative Director, The REFINERY',
  email: 'celder@bionanomics.com',
  phone: '260-450-9038',
  /** tel: href form of `phone`. */
  phoneHref: 'tel:+12604509038',
} as const;

/**
 * Who media can be put in front of, in the order The REFINERY offers them. Roles are the
 * press kit's wording, which is what a reporter will have seen already.
 */
export const SPOKESPEOPLE = [
  {
    name: 'Mady Stricker',
    role: 'Operations Director, The REFINERY',
    note: 'Handles Monster Match team registration and event operations.',
  },
  {
    name: 'Doug Horner',
    role: 'Founder and CEO, BioNanomics; Founder, The REFINERY',
    note: 'Co-founder and CEO of Medical Informatics Engineering, Fort Wayne. Recipient of the 2025 FIRST Indiana Robotics President\'s Award.',
  },
  {
    name: 'Connor Rey',
    role: 'Operations, The REFINERY',
  },
  {
    name: 'Cameron Elder',
    role: 'Creative Director, The REFINERY and BioNanomics',
    note: 'Media contact for the event.',
  },
] as const;

/**
 * The licence, in plain words. Shown on the page and repeated in each folder README so the
 * terms travel with the files.
 */
export const USAGE_TERMS = {
  allowed:
    'Material on this page produced by The REFINERY or BioNanomics may be used for editorial coverage of Monster Match, The REFINERY, BioNanomics and FIRST robotics in Northeast Indiana.',
  notAllowed: 'Not for advertising, stock or resale.',
  photoCredit: 'Photo courtesy The REFINERY / BioNanomics',
  videoCredit: 'Video courtesy The REFINERY / BioNanomics',
  logoNote: 'Use logos as provided. No credit required.',
} as const;

export interface PressDocument {
  title: string;
  /** Path under public/press/. */
  file: string;
  /** Short line under the title: what it is and when it was issued. */
  description: string;
  format: 'PDF';
}

export const PRESS_DOCUMENTS: PressDocument[] = [
  {
    title: 'Monster Match 2026 press release',
    file: 'Monster_Match_2026_Press_Release.pdf',
    description: 'Issued Oct. 5, 2026; updated Oct. 16 with the college and career fair hours. Who, what, when, where, and the fact table.',
    format: 'PDF',
  },
  {
    title: 'Monster Match 2026 press kit',
    file: 'Monster_Match_2026_Press_Kit.pdf',
    description:
      'Release, fact sheet, story ideas, spokespeople, co-host backgrounds, media advisory for Oct. 31, and the FIRST primer.',
    format: 'PDF',
  },
];

export interface PressLogo {
  name: string;
  /** Path under public/press/logos/. */
  file: string;
  /** What the mark looks like, for screen readers and for a reporter choosing one. */
  description: string;
  format: 'SVG' | 'PNG';
  /**
   * Preview the mark on a dark tile. Reversed (white) marks disappear on the page's light
   * background, so the gallery needs to know.
   */
  dark?: boolean;
}

export const PRESS_LOGOS: PressLogo[] = [
  {
    name: 'The REFINERY, full color',
    file: 'REFINERY-logo-full-color.svg',
    description: 'The REFINERY wordmark with a wrench in place of the I and a robotic arm placing the Y, in navy and green',
    format: 'SVG',
  },
  {
    name: 'The REFINERY, reversed',
    file: 'REFINERY-logo-reversed.svg',
    description: 'The REFINERY wordmark in white, for dark backgrounds',
    format: 'SVG',
    dark: true,
  },
];

/**
 * Video is linked, not hosted. The Robot in 3 Days cut is over 100 MB, which is past what
 * the repository (and GitHub Pages) should carry, and a stream a reporter can scrub is more
 * useful than a download anyway. YouTube is the primary link because corporate networks that
 * block Google Drive usually allow it; the Drive file is the download for anyone who needs
 * the original.
 */
export const PRESS_VIDEO = {
  title: 'Robot in 3 Days 2026',
  description:
    "The REFINERY's documentary cut of its January 2026 Robot in 3 Days build. Contact us before using more than a short clip.",
  channelUrl: 'https://www.youtube.com/@refineryrobotics',
  driveUrl: 'https://drive.google.com/file/d/10UUjIeuIJvQt5y5EemvMvQvoQ4Ki-oDs/view',
  driveFormat: 'QuickTime .mov, 103 MB',
} as const;

/**
 * The Google Drive copy of this portal. Kept as a secondary link: some newsroom networks
 * block Drive, which is why this page exists, but for everyone else it is the same files.
 */
export const PRESS_DRIVE_URL = 'https://drive.google.com/drive/folders/1D2YinXG1kbRhmAIfS141DEeM8JZBcJhw';

/** Official FIRST sources a reporter can draw on, with the credit each one requires. */
export const FIRST_SOURCES = [
  {
    name: 'FIRST press room photos',
    description: 'Official photography of 2026 REBUILT match play, pits and drive teams, for journalistic use.',
    url: 'https://www.firstinspires.org/about/press-room/first-photos',
    credit: 'Photo courtesy FIRST',
  },
  {
    name: 'FIRST Indiana Robotics on Flickr',
    description:
      'Public albums of Indiana teams, including Fort Wayne teams: 2026 District Mishawaka, 2026 District Columbus, 2026 FIN State Championship, 2025 Boiler Bot Battle.',
    url: 'https://www.flickr.com/photos/indianafirst/albums',
    credit: 'Photo courtesy FIRST Indiana Robotics',
  },
  {
    name: 'FIRST on YouTube',
    description: 'The REBUILT game animation and the 2026 season video.',
    url: 'https://www.youtube.com/user/FIRSTWorldTube',
  },
] as const;

export const FIRST_MARKS_NOTE =
  'FIRST, FIRST Robotics Competition and REBUILT are trademarks of For Inspiration and Recognition of Science and Technology (FIRST). Naming them in news copy needs no permission. The FIRST logo is not included here; the full FIRST press room is at firstinspires.org/about/press-room.';
