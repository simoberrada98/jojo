import { describe, it, expect } from 'vitest';
import {
  sanitizeSlug,
  normalizeProductUrl,
  ALLOWED_TRACKING_PARAMS,
} from '@/lib/url/product-url';

function params(input: Record<string, string>): URLSearchParams {
  const qp = new URLSearchParams();
  for (const [k, v] of Object.entries(input)) qp.set(k, v);
  return qp;
}

describe('sanitizeSlug', () => {
  it('lowercases and trims spaces', () => {
    expect(sanitizeSlug('  My Product ')).toBe('my-product');
  });
  it('normalizes unicode and removes invalid chars', () => {
    expect(sanitizeSlug('Café™ PRO!!')).toBe('cafe-pro-');
  });
  it('collapses repeated dashes', () => {
    expect(sanitizeSlug('a---b__c')).toBe('a-b__c');
  });
});

describe('normalizeProductUrl', () => {
  it('preserves allowed tracking params and drops others', () => {
    const qp = params({ utm_source: 'x', campaign_id: '42', foo: 'bar' });
    const res = normalizeProductUrl(['abc'], qp);
    expect(res.canonicalPath).toBe('/products/abc');
    const preserved = Object.fromEntries(res.preservedParams.entries());
    expect(preserved).toEqual({ utm_source: 'x', campaign_id: '42' });
  });

  it('marks extra segments as invalid and requests canonicalization', () => {
    const res = normalizeProductUrl(['abc', 'random', 'junk'], params({}));
    expect(res.hasExtraSegments).toBe(true);
    expect(res.invalidSegments).toEqual(['random', 'junk']);
    expect(res.isCanonical).toBe(false);
    expect(res.canonicalPath).toBe('/products/abc');
  });

  it('sanitizes slug with special characters and whitespace', () => {
    const res = normalizeProductUrl(['  ACME Xtreme™  '], params({ utm_campaign: 'spring' }));
    expect(res.slug).toBe('acme-xtreme-');
    expect(res.canonicalPath).toBe('/products/acme-xtreme-');
    expect(res.preservedParams.get('utm_campaign')).toBe('spring');
  });

  it('handles long URL strings without failing', () => {
    const long = 'x'.repeat(4000);
    const res = normalizeProductUrl([long, 'extra'], params({ fbclid: long }));
    expect(res.slug?.length).toBeGreaterThan(0);
    expect(res.hasExtraSegments).toBe(true);
    // ensure we still preserve allowed params
    expect(res.preservedParams.get('fbclid')).toBe(long);
  });

  it('accepts mixed case slug and normalizes to lowercase', () => {
    const res = normalizeProductUrl(['MiXeD-CaSe'], params({ gclid: '123' }));
    expect(res.slug).toBe('mixed-case');
    expect(res.isCanonical).toBe(false); // rawSlug !== sanitized -> needs canonicalization
  });

  it('no segments: returns canonical indicators with null slug', () => {
    const res = normalizeProductUrl([], params({ utm_source: 'x' }));
    expect(res.slug).toBeNull();
    expect(res.canonicalPath).toBeNull();
    expect(res.isCanonical).toBe(true);
  });
});

