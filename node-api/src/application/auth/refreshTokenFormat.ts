const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Format a refresh token as `{userId}.{tokenId}`.
 *
 * @param userId - User UUID.
 * @param tokenId - Opaque token UUID.
 * @returns Combined refresh token string.
 */
export function formatRefreshToken(userId: string, tokenId: string): string {
  return `${userId}.${tokenId}`;
}

/**
 * Parse a refresh token into user id and token id parts.
 *
 * @param value - Raw refresh token from the client.
 * @returns Parsed parts or null when malformed.
 */
export function parseRefreshToken(value: string): { userId: string; tokenId: string } | null {
  const dotIndex = value.indexOf('.');
  if (dotIndex <= 0 || dotIndex === value.length - 1) {
    return null;
  }
  const userId = value.slice(0, dotIndex);
  const tokenId = value.slice(dotIndex + 1);
  if (!UUID_V4_REGEX.test(userId) || !UUID_V4_REGEX.test(tokenId)) {
    return null;
  }
  return { userId, tokenId };
}
