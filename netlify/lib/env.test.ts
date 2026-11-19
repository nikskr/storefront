import { describe, expect, it } from 'vitest';
import { getTelegramEnv } from './env.ts';

describe('getTelegramEnv', () => {
  it('returns trimmed values when both variables are set', () => {
    expect(
      getTelegramEnv({ TELEGRAM_BOT_TOKEN: ' token ', TELEGRAM_CHAT_ID: '42' })
    ).toEqual({ botToken: 'token', chatId: '42' });
  });

  it('lists every missing variable', () => {
    expect(() => getTelegramEnv({ TELEGRAM_CHAT_ID: ' ' })).toThrow(
      'Missing environment variables: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID'
    );
  });
});
