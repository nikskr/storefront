// Minimal Telegram Bot API client: only sendMessage is needed.
import type { TelegramEnv } from './env.ts';

const API = 'https://api.telegram.org';
const TIMEOUT_MS = 10_000;

export type SendMessage = (text: string) => Promise<void>;

export function createTelegramSender(
  { botToken, chatId }: TelegramEnv,
  fetchImpl: typeof fetch = fetch
): SendMessage {
  return async (text) => {
    const response = await fetchImpl(`${API}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      // Telegram explains the problem in "description"; the token is never
      // included in the error, so it is safe to log.
      const body = (await response.json().catch(() => null)) as {
        description?: string;
      } | null;
      throw new Error(
        `Telegram API ${response.status}: ${body?.description ?? 'unknown error'}`
      );
    }
  };
}
