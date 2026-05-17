import { redact } from './redact';

describe('redact', () => {
  it('redacts sensitive keys in nested objects', () => {
    const output = redact({
      event: 'card_registration',
      cvv: '123',
      nested: { token: 'tok_abc', safe: 'ok' },
    }) as Record<string, unknown>;

    expect(output.cvv).toBe('[REDACTED]');
    expect((output.nested as Record<string, unknown>).token).toBe('[REDACTED]');
    expect((output.nested as Record<string, unknown>).safe).toBe('ok');
  });

  it('redacts sensitive keys in arrays', () => {
    const output = redact([{ cardNumber: '4242424242424242' }, { level: 'info' }]) as Record<
      string,
      unknown
    >[];
    const first = output[0];
    const second = output[1];

    expect(first?.cardNumber).toBe('[REDACTED]');
    expect(second?.level).toBe('info');
  });
});
