import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import {
  PRESS_DIR,
  PRESS_CONTACT,
  PRESS_DOCUMENTS,
  PRESS_LOGOS,
  PRESS_VIDEO,
  PRESS_DRIVE_URL,
  FIRST_SOURCES,
  SPOKESPEOPLE,
} from '../../src/data/press';
import { PRESS_PHOTOS } from '../../src/data/press-photos';

// Both relative to the repo root, which is vitest's cwd.
const PUBLIC_PRESS = join('public', PRESS_DIR);
const PHOTO_DIR = join('src', 'assets', 'press', 'photos');

// Lowercase JPEG only. The page's import.meta.glob is case-sensitive, so a .JPG would pass a
// case-insensitive test and still drop off the page; and the full-size download is always
// re-encoded as JPEG, so a PNG would save as a JPEG under a .png name.
const PHOTO_EXTENSIONS = /\.jpe?g$/;
// The limit in src/assets/press/photos/README.md.
const MAX_PHOTO_BYTES = 10 * 1000 * 1000;

describe('press portal documents', () => {
  it('every listed document exists under public/press/', () => {
    for (const doc of PRESS_DOCUMENTS) {
      expect(existsSync(join(PUBLIC_PRESS, doc.file)), `${doc.file} missing from ${PUBLIC_PRESS}`).toBe(true);
    }
  });

  it('document filenames are URL-safe (no spaces or path separators)', () => {
    for (const doc of PRESS_DOCUMENTS) {
      expect(doc.file).toMatch(/^[\w.-]+$/);
      expect(doc.file.toLowerCase().endsWith('.pdf')).toBe(true);
    }
  });

  it('every document has a title and description', () => {
    for (const doc of PRESS_DOCUMENTS) {
      expect(doc.title.trim().length).toBeGreaterThan(0);
      expect(doc.description.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('press portal logos', () => {
  it('every listed logo exists under public/press/logos/', () => {
    for (const logo of PRESS_LOGOS) {
      expect(existsSync(join(PUBLIC_PRESS, 'logos', logo.file)), `${logo.file} missing`).toBe(true);
    }
  });

  it('logo filenames are URL-safe', () => {
    for (const logo of PRESS_LOGOS) {
      expect(logo.file).toMatch(/^[\w.-]+$/);
    }
  });

  it('declared format matches the file extension', () => {
    for (const logo of PRESS_LOGOS) {
      expect(logo.file.toLowerCase().endsWith(`.${logo.format.toLowerCase()}`)).toBe(true);
    }
  });

  it('every logo has a description for its alt text', () => {
    for (const logo of PRESS_LOGOS) {
      expect(logo.description.trim().length).toBeGreaterThan(10);
    }
  });
});

describe('press portal photos', () => {
  const all = existsSync(PHOTO_DIR) ? readdirSync(PHOTO_DIR).filter((f) => !f.startsWith('.') && f !== 'README.md') : [];
  const files = all.filter((f) => PHOTO_EXTENSIONS.test(f));

  it('the photos folder holds only .jpg or .jpeg files (lowercase)', () => {
    for (const file of all) {
      expect(file, `${file}: re-save as a JPEG with a lowercase .jpg extension`).toMatch(PHOTO_EXTENSIONS);
    }
  });

  it('every photo is 10 MB or smaller', () => {
    for (const file of files) {
      const bytes = statSync(join(PHOTO_DIR, file)).size;
      expect(bytes, `${file} is ${(bytes / 1e6).toFixed(1)} MB; re-export at 3,000 px on the long edge, JPEG quality 90`).toBeLessThanOrEqual(MAX_PHOTO_BYTES);
    }
  });

  it('every photo file has a manifest entry with alt text and a caption', () => {
    for (const file of files) {
      const meta = PRESS_PHOTOS[file];
      expect(meta, `${file} is in ${PHOTO_DIR} but has no entry in src/data/press-photos.ts`).toBeDefined();
      expect(meta.alt.trim().length, `${file}: alt text is empty`).toBeGreaterThan(10);
      expect(meta.caption.trim().length, `${file}: caption is empty`).toBeGreaterThan(5);
    }
  });

  it('every manifest entry has a photo file', () => {
    for (const file of Object.keys(PRESS_PHOTOS)) {
      expect(files, `${file} is in src/data/press-photos.ts but not in ${PHOTO_DIR}`).toContain(file);
    }
  });

  it('photo filenames are URL-safe', () => {
    for (const file of files) {
      expect(file).toMatch(/^[\w.-]+$/);
    }
  });
});

describe('press portal contact and links', () => {
  it('contact details are complete and consistent', () => {
    expect(PRESS_CONTACT.email).toMatch(/^[^@\s]+@bionanomics\.com$/);
    expect(PRESS_CONTACT.phone).toMatch(/^\d{3}-\d{3}-\d{4}$/);
    expect(PRESS_CONTACT.phoneHref).toBe(`tel:+1${PRESS_CONTACT.phone.replaceAll('-', '')}`);
  });

  it('the media contact is listed among the spokespeople', () => {
    expect(SPOKESPEOPLE.map((p) => p.name)).toContain(PRESS_CONTACT.name);
  });

  it('external links are absolute https URLs', () => {
    const urls = [PRESS_VIDEO.channelUrl, PRESS_VIDEO.driveUrl, PRESS_DRIVE_URL, ...FIRST_SOURCES.map((s) => s.url)];
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\//);
    }
  });
});
