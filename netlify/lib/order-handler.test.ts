import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../../src/types.ts';
import { MAX_BODY_BYTES, handleOrder } from './order-handler.ts';
import type { SendMessage } from './telegram.ts';

const carrot: Product = {
  id: 'carrot',
  name: 'Морковь',
  description: '',
  pricePerKg: 180,
  image: { src: '', alt: '' },
  weight: { min: 500, step: 500, max: 2000 },
};

const order = {
  orderId: 'order-12345678',
  phone: '+375291234567',
  consent: true,
  items: [{ id: 'carrot', grams: 1000 }],
  total: 180,
  website: '',
};

const URL_ = 'https://farm.example/api/order';

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request(URL_, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

let send: ReturnType<typeof vi.fn<SendMessage>>;
let log: ReturnType<typeof vi.fn<(message: string) => void>>;

const handle = (req: Request, getSender = () => send) =>
  handleOrder(req, {
    products: [carrot],
    getSender,
    now: () => new Date('2026-11-19T15:30:00Z'),
    log,
  });

beforeEach(() => {
  send = vi.fn<SendMessage>().mockResolvedValue(undefined);
  log = vi.fn<(message: string) => void>();
});

describe('handleOrder', () => {
  it('sends a valid order to Telegram and answers ok', async () => {
    const res = await handle(post(order, { Origin: 'https://farm.example' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, orderId: 'order-12345678' });
    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]?.[0]).toContain('Морковь: 1 кг');
  });

  it('rejects other methods with 405', async () => {
    const res = await handle(new Request(URL_));
    expect(res.status).toBe(405);
    expect(res.headers.get('Allow')).toBe('POST');
  });

  it('requires a JSON content type', async () => {
    const res = await handle(
      new Request(URL_, { method: 'POST', body: JSON.stringify(order) })
    );
    expect(res.status).toBe(415);
  });

  it('rejects requests from other sites', async () => {
    const res = await handle(post(order, { Origin: 'https://evil.example' }));
    expect(res.status).toBe(403);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects oversized bodies', async () => {
    const res = await handle(
      post({ ...order, pad: 'x'.repeat(MAX_BODY_BYTES) })
    );
    expect(res.status).toBe(413);
  });

  it('rejects invalid JSON', async () => {
    const res = await handle(post('{oops'));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'invalid_request' });
  });

  it('returns validation errors', async () => {
    const res = await handle(post({ ...order, consent: false }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ ok: false, error: 'consent_required' });
    expect(send).not.toHaveBeenCalled();
  });

  it('pretends success for spam but sends nothing', async () => {
    const res = await handle(post({ ...order, website: 'buy-now.example' }));
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('answers 500 when secrets are missing', async () => {
    const res = await handle(post(order), () => {
      throw new Error('Missing environment variables: TELEGRAM_BOT_TOKEN');
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ ok: false, error: 'server_error' });
    expect(log).toHaveBeenCalled();
  });

  it('answers 502 when Telegram fails', async () => {
    send.mockRejectedValue(new Error('Telegram API 400: chat not found'));
    const res = await handle(post(order));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, error: 'delivery_failed' });
    expect(log.mock.calls[0]?.[0]).toContain('order-12345678');
  });
});
