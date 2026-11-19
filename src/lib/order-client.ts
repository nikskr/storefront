// Sends the order to the Netlify Function and turns every outcome
// (success, server error, timeout, no network) into an OrderResponse.
import { ORDER } from '../config.ts';
import type { OrderErrorCode, OrderRequest, OrderResponse } from './order.ts';

interface SubmitOptions {
  fetchImpl?: typeof fetch;
  endpoint?: string;
  timeoutMs?: number;
}

const KNOWN_ERRORS = new Set<string>([
  'invalid_request',
  'invalid_phone',
  'consent_required',
  'invalid_items',
  'price_changed',
  'method_not_allowed',
  'unsupported_media_type',
  'payload_too_large',
  'forbidden',
  'rate_limited',
  'server_error',
  'delivery_failed',
]);

const isErrorCode = (value: unknown): value is OrderErrorCode =>
  typeof value === 'string' && KNOWN_ERRORS.has(value);

export async function submitOrder(
  request: OrderRequest,
  {
    fetchImpl = fetch,
    endpoint = ORDER.endpoint,
    timeoutMs = ORDER.timeoutMs,
  }: SubmitOptions = {}
): Promise<OrderResponse> {
  let response: Response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const name = error instanceof Error ? error.name : '';
    const timedOut = name === 'TimeoutError' || name === 'AbortError';
    return { ok: false, error: timedOut ? 'timeout' : 'network' };
  }

  if (response.status === 429) return { ok: false, error: 'rate_limited' };

  const body: unknown = await response.json().catch(() => null);
  if (
    response.ok &&
    typeof body === 'object' &&
    body !== null &&
    'ok' in body &&
    body.ok === true
  ) {
    return { ok: true, orderId: request.orderId };
  }

  const code =
    typeof body === 'object' && body !== null && 'error' in body
      ? body.error
      : null;
  return { ok: false, error: isErrorCode(code) ? code : 'server_error' };
}
