import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { proxy } from '@/proxy';

describe('locale redirect', () => {
  it('redirects to the negotiated locale, preserving the query and preventing shared caching', () => {
    const request = new NextRequest('https://example.test/?ref=hud9', {
      headers: { 'Accept-Language': 'es-CO, en;q=0.8' },
    });

    const response = proxy(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe(
      'https://example.test/es?ref=hud9',
    );
    expect(response.headers.get('vary')).toBe('Accept-Language');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('redirects to English when the request has no compatible preference', () => {
    const request = new NextRequest('https://example.test/', {
      headers: { 'Accept-Language': 'fr' },
    });

    expect(proxy(request).headers.get('location')).toBe(
      'https://example.test/en',
    );
  });
});
