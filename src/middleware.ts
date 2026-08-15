import { defineMiddleware } from 'astro:middleware';
import { createFirstRegistry } from './utils/first';

// Runs once per route render — including at build time for prerendered pages — so each
// page gets a fresh registry and places the FIRST® symbol on first use rather than on
// every occurrence. See src/utils/first.ts.
export const onRequest = defineMiddleware((context, next) => {
  context.locals.firstMarks = createFirstRegistry();
  return next();
});
