import { describe, expect, it, vi } from 'vitest';
import { createTelegramSender } from './telegram.ts';

const env = { botToken: '123:SECRET', chatId: '-100500' };

describe('createTelegramSender', () => {
  it('calls sendMessage with HTML parse mode', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json({ ok: true }));
    await createTelegramSender(env, fetchImpl)('<b>Заказ</b>');

    const [url, init] = fetchImpl.mock.calls[0] ?? [];
    expect(url).toBe('https://api.telegram.org/bot123:SECRET/sendMessage');
    expect(JSON.parse(String(init?.body))).toEqual({
      chat_id: '-100500',
      text: '<b>Заказ</b>',
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  });

  it('throws with Telegram description but without the token', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json(
          { ok: false, description: 'Bad Request: chat not found' },
          { status: 400 }
        )
      );
    const send = createTelegramSender(env, fetchImpl);

    await expect(send('x')).rejects.toThrow(
      'Telegram API 400: Bad Request: chat not found'
    );
    await expect(send('x')).rejects.not.toThrow(/SECRET/);
  });
});
