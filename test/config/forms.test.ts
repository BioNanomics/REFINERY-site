import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, formDelivery, isFormConfigured } from '../../src/config/forms';

describe('isFormConfigured', () => {
  it('is derived from whether formDelivery.endpoint is non-empty', () => {
    expect(isFormConfigured).toBe(formDelivery.endpoint !== '');
  });
});

describe('formDelivery', () => {
  it('has a well-formed endpoint URL whenever configured', () => {
    if (isFormConfigured) {
      expect(() => new URL(formDelivery.endpoint)).not.toThrow();
    }
  });
});

describe('CONTACT_EMAIL', () => {
  it('looks like an email address', () => {
    expect(CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
