// Netlify Function: POST /api/order → message to the seller in Telegram.
// Only wiring lives here; logic and tests are in netlify/lib/.
import type { Config } from '@netlify/functions';
import { products } from '../../src/data/products.ts';
import { getTelegramEnv } from '../lib/env.ts';
import { handleOrder } from '../lib/order-handler.ts';
import { createTelegramSender } from '../lib/telegram.ts';

export default (req: Request) =>
  handleOrder(req, {
    products,
    getSender: () => createTelegramSender(getTelegramEnv()),
  });

export const config: Config = {
  path: '/api/order',
  // Platform rate limit: answers 429 before the function runs.
  rateLimit: {
    windowSize: 60,
    windowLimit: 5,
    aggregateBy: ['ip', 'domain'],
  },
};
