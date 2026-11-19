import { describe, expect, it, vi } from 'vitest';
import type { OrderRequest } from './order.ts';
import { submitOrder } from './order-client.ts';

const request: OrderRequest = {
  orderId: 'order-1',
  phone: '+375291234567',
  consent: true,
  items: [{ id: 'carrot', grams: 500 }],
  total: 90,
  website: '',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const fetchReturning = (response: Response) =>
  vi.fn<typeof fetch>().mockResolvedValue(response);

describe('submitOrder', () => {
  it('posts JSON to the endpoint', async () => {
    const fetchImpl = fetchReturning(json(200, { ok: true }));
    await submitOrder(request, { fetchImpl, endpoint: '/api/test' });

    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('/api/test');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(JSON.parse(String(init?.body))).toEqual(request);
  });

  it('returns ok on success', async () => {
    const fetchImpl = fetchReturning(json(200, { ok: true }));
    expect(await submitOrder(request, { fetchImpl })).toEqual({
      ok: true,
      orderId: 'order-1',
    });
  });

  it('passes known server error codes through', async () => {
    const fetchImpl = fetchReturning(
      json(409, { ok: false, error: 'price_changed' })
    );
    expect(await submitOrder(request, { fetchImpl })).toEqual({
      ok: false,
      error: 'price_changed',
    });
  });

  it('maps unknown errors and non-JSON bodies to server_error', async () => {
    const weird = fetchReturning(json(500, { ok: false, error: 'boom' }));
    const html = fetchReturning(new Response('<h1>502</h1>', { status: 502 }));

    expect(await submitOrder(request, { fetchImpl: weird })).toEqual({
      ok: false,
      error: 'server_error',
    });
    expect(await submitOrder(request, { fetchImpl: html })).toEqual({
      ok: false,
      error: 'server_error',
    });
  });

  it('maps HTTP 429 from the platform rate limiter', async () => {
    const fetchImpl = fetchReturning(new Response('Too Many', { status: 429 }));
    expect(await submitOrder(request, { fetchImpl })).toEqual({
      ok: false,
      error: 'rate_limited',
    });
  });

  it('reports network failures and timeouts', async () => {
    const offline = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError('Failed to fetch'));
    const slow = vi
      .fn<typeof fetch>()
      .mockRejectedValue(
        Object.assign(new Error('timed out'), { name: 'TimeoutError' })
      );

    expect(await submitOrder(request, { fetchImpl: offline })).toEqual({
      ok: false,
      error: 'network',
    });
    expect(await submitOrder(request, { fetchImpl: slow })).toEqual({
      ok: false,
      error: 'timeout',
    });
  });
});
