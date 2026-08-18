import { describe, expect, it } from 'vitest';
import { contactForm } from '../../src/config/contact-forms';

describe('contactForm', () => {
  it('has a defaultTopic that is one of the declared topics', () => {
    expect(contactForm.topics.map((t) => t.value)).toContain(contactForm.defaultTopic);
  });

  it('has a unique value for every topic', () => {
    const values = contactForm.topics.map((t) => t.value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('has a radio field whose options are exactly the declared topics, in order', () => {
    const topicField = contactForm.fields.find((f) => f.name === 'topic');
    expect(topicField?.type).toBe('radio');
    expect((topicField as any).options).toEqual(
      contactForm.topics.map((t) => ({ value: t.value, label: t.label })),
    );
  });

  it('scopes every topic-restricted field to a real topic value', () => {
    const topicValues = new Set(contactForm.topics.map((t) => t.value));
    for (const field of contactForm.fields) {
      for (const scoped of field.topics ?? []) {
        expect(topicValues.has(scoped)).toBe(true);
      }
    }
  });

  it('gives every field a unique DOM key (name, or key when name is reused)', () => {
    const ids = contactForm.fields.map((f) => f.key ?? f.name);
    expect(new Set(ids).size).toBe(ids.length);
  });

  describe('the `message` field variants', () => {
    const messageFields = contactForm.fields.filter((f) => f.name === 'message');

    it('together cover every topic exactly once', () => {
      const covered = messageFields.flatMap((f) => f.topics ?? []);
      const topicValues = contactForm.topics.map((t) => t.value);
      expect(covered.sort()).toEqual([...topicValues].sort());
      expect(new Set(covered).size).toBe(covered.length);
    });

    it("requires the general message for any topic without its own scoped questions", () => {
      const general = messageFields.find((f) => f.key === 'general-message');
      expect(general?.required).toBe(true);
      // Partnership has no field of its own besides its own required message variant.
      expect(general?.topics).not.toContain('Partnership');
    });
  });

  it('marks every checkbox/radio field with required as also carrying options', () => {
    for (const field of contactForm.fields) {
      if (field.type === 'radio' || field.type === 'checkbox') {
        expect(Array.isArray((field as any).options)).toBe(true);
        expect((field as any).options.length).toBeGreaterThan(0);
      }
    }
  });
});
