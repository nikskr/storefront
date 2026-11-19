export interface TelegramEnv {
  botToken: string;
  chatId: string;
}

/**
 * Reads Telegram secrets from environment variables.
 * Throws if any is missing, so a misconfigured deploy fails loudly
 * instead of silently dropping orders.
 */
export function getTelegramEnv(
  env: Record<string, string | undefined> = process.env
): TelegramEnv {
  const botToken = env['TELEGRAM_BOT_TOKEN']?.trim();
  const chatId = env['TELEGRAM_CHAT_ID']?.trim();

  const missing = [
    !botToken && 'TELEGRAM_BOT_TOKEN',
    !chatId && 'TELEGRAM_CHAT_ID',
  ].filter(Boolean);

  if (!botToken || !chatId) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return { botToken, chatId };
}
