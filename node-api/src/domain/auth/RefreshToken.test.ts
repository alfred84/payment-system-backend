import { RefreshTokenAlreadyRevokedError } from './errors';
import { RefreshToken } from './RefreshToken';

describe('RefreshToken', () => {
  const now = new Date('2026-05-16T12:00:00.000Z');

  it('reports expired when now is past expiresAt', () => {
    const token = RefreshToken.create({
      id: '66666666-6666-4666-8666-666666666666',
      userId: '11111111-1111-4111-8111-111111111111',
      tokenHash: '$2b$12$refreshhashvalue',
      expiresAt: new Date('2026-05-15T12:00:00.000Z'),
      createdAt: now,
    });

    expect(token.isExpired(now)).toBe(true);
  });

  it('revokes and records revokedAt', () => {
    const token = RefreshToken.create({
      id: '66666666-6666-4666-8666-666666666666',
      userId: '11111111-1111-4111-8111-111111111111',
      tokenHash: '$2b$12$refreshhashvalue',
      expiresAt: new Date('2026-05-20T12:00:00.000Z'),
      createdAt: now,
    });

    const revoked = token.revoke(now);
    expect(revoked.revoked).toBe(true);
    expect(revoked.revokedAt).toEqual(now);
  });

  it('throws when revoking twice', () => {
    const token = RefreshToken.create({
      id: '66666666-6666-4666-8666-666666666666',
      userId: '11111111-1111-4111-8111-111111111111',
      tokenHash: '$2b$12$refreshhashvalue',
      expiresAt: new Date('2026-05-20T12:00:00.000Z'),
      createdAt: now,
    }).revoke(now);

    expect(() => token.revoke(now)).toThrow(RefreshTokenAlreadyRevokedError);
  });

  it('links rotation via markReplacedBy', () => {
    const token = RefreshToken.create({
      id: '66666666-6666-4666-8666-666666666666',
      userId: '11111111-1111-4111-8111-111111111111',
      tokenHash: '$2b$12$refreshhashvalue',
      expiresAt: new Date('2026-05-20T12:00:00.000Z'),
      createdAt: now,
    });

    const rotated = token.markReplacedBy('77777777-7777-4777-8777-777777777777', now);
    expect(rotated.replacedById).toBe('77777777-7777-4777-8777-777777777777');
    expect(rotated.revoked).toBe(true);
  });
});
