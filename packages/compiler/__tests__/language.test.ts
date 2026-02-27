import { describe, it, expect } from 'vitest';
import { detectLanguage } from '../src/language.js';

describe('detectLanguage', () => {
  it('detects English', () => {
    expect(detectLanguage('The quick brown fox jumps over the lazy dog. This is a test.')).toBe(
      'en',
    );
  });

  it('detects Spanish', () => {
    expect(
      detectLanguage(
        'El rápido zorro marrón salta sobre el perro perezoso. Esta es una prueba de la detección.',
      ),
    ).toBe('es');
  });

  it('detects French', () => {
    expect(
      detectLanguage(
        'Le renard brun rapide saute par-dessus le chien paresseux. La vie est belle dans les rues de Paris.',
      ),
    ).toBe('fr');
  });

  it('detects German', () => {
    expect(
      detectLanguage(
        'Der schnelle braune Fuchs springt über den faulen Hund. Das ist ein Test mit dem deutschen Text.',
      ),
    ).toBe('de');
  });

  it('returns und for empty text', () => {
    expect(detectLanguage('')).toBe('und');
  });

  it('returns und for ambiguous text', () => {
    expect(detectLanguage('123 456 789')).toBe('und');
  });
});
