import { redact } from './redact';

describe('redact', () => {
  it('redacts sensitive keys in nested objects', () => {
    const output = redact({
      event: 'login',
      password: 'secret',
      nested: { refreshToken: 'rt-1', safe: 'ok' },
    }) as Record<string, unknown>;

    expect(output.password).toBe('[REDACTED]');
    expect((output.nested as Record<string, unknown>).refreshToken).toBe('[REDACTED]');
    expect((output.nested as Record<string, unknown>).safe).toBe('ok');
  });

  it('redacts sensitive keys in arrays', () => {
    const output = redact([{ accessToken: 'at-1' }, { level: 'info' }]) as Record<
      string,
      unknown
    >[];
    const first = output[0];
    const second = output[1];

    expect(first?.accessToken).toBe('[REDACTED]');
    expect(second?.level).toBe('info');
  });
});
