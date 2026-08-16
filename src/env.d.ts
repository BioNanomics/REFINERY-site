/// <reference types="astro/client" />

import type { FirstRegistry } from './utils/first';

declare global {
  namespace App {
    interface Locals {
      /**
       * Tracks which FIRST® marks have already claimed their registered symbol on this
       * page render. Seeded per request in src/middleware.ts.
       */
      firstMarks: FirstRegistry;
    }
  }
}

export {};
