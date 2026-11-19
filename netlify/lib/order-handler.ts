// HTTP handling for POST /api/order, independent from the Netlify runtime
// so it can be tested with plain Request objects and fake dependencies.
import type { OrderErrorCode, OrderResponse } from '../../src/lib/order.ts';
import type { Product } from '../../src/types.ts';
import { validateOrder } from './order-validation.ts';
import type { SendMessage } from './telegram.ts';
import { formatOrderMessage } from './telegram-message.ts';

/** Real orders are well under 2 KB; anything bigger is not from the site. */
export const MAX_BODY_BYTES = 10_000;

export interface OrderHandlerDeps {
  products: readonly Product[];
  /** Creates the Telegram sender; throws if secrets are not configured. */
  getSender: () => SendMessage;
  now?: () => Date;
  log?: (message: string) => void;
}

const reply = (status: number, body: OrderResponse, headers = {}) =>
  Response.json(body, { status, headers });

const error = (status: number, code: OrderErrorCode, headers = {}) =>
  reply(status, { ok: false, error: code }, headers);

export async function handleOrder(
  req: Request,
  {
    products,
    getSender,
    now = () => new Date(),
    log = console.error,
  }: OrderHandlerDeps
): Promise<Response> {
  if (req.method !== 'POST') {
    return error(405, 'method_not_allowed', { Allow: 'POST' });
  }

  // JSON content type forces a CORS preflight, which other sites fail
  // because the function sends no CORS headers.
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return error(415, 'unsupported_media_type');
  }

  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) {
    return error(403, 'forbidden');
  }

  const raw = await req.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return error(413, 'payload_too_large');
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return error(400, 'invalid_request');
  }

  const result = validateOrder(data, products);
  if (!result.ok) return error(result.status, result.error);
  if ('spam' in result) {
    return reply(200, { ok: true, orderId: 'ignored' });
  }

  let send: SendMessage;
  try {
    send = getSender();
  } catch (cause) {
    log(`Order function is not configured: ${String(cause)}`);
    return error(500, 'server_error');
  }

  try {
    await send(formatOrderMessage(result.order, now()));
  } catch (cause) {
    log(`Failed to deliver order ${result.order.orderId}: ${String(cause)}`);
    return error(502, 'delivery_failed');
  }

  return reply(200, { ok: true, orderId: result.order.orderId });
}
