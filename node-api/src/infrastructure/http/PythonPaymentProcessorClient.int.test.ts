import nock from 'nock';

import { ProcessorUnavailableError } from '../../application/payments/errors';
import { Currency } from '../../domain/shared/value-objects/Currency';
import { PythonPaymentProcessorClient } from './PythonPaymentProcessorClient';

const PROCESSOR_URL = 'http://processor.test';

describe('PythonPaymentProcessorClient (integration)', () => {
  const client = new PythonPaymentProcessorClient(PROCESSOR_URL, 2_000);

  afterEach(() => {
    nock.cleanAll();
  });

  it('returns processor result on success', async () => {
    nock(PROCESSOR_URL)
      .post(
        '/process',
        (body: Record<string, unknown>) =>
          body.payment_id === '33333333-3333-4333-8333-333333333333',
      )
      .reply(200, {
        approved: true,
        reference: '44444444-4444-4444-8444-444444444444',
        message: 'Approved',
      });

    const result = await client.process({
      paymentId: '33333333-3333-4333-8333-333333333333',
      amount: 19.99,
      currency: Currency.create('USD'),
      cardToken: 'tok_abc',
    });

    expect(result.approved).toBe(true);
    expect(result.reference).toBe('44444444-4444-4444-8444-444444444444');
  });

  it('maps HTTP 502 to ProcessorUnavailableError', async () => {
    nock(PROCESSOR_URL).post('/process').reply(502);

    await expect(
      client.process({
        paymentId: '33333333-3333-4333-8333-333333333333',
        amount: 19.99,
        currency: Currency.create('USD'),
        cardToken: 'tok_abc',
      }),
    ).rejects.toThrow(ProcessorUnavailableError);
  });

  it('tokenize returns an opaque token without calling the network', async () => {
    const result = await client.tokenize({
      cardNumber: '4242424242424242',
      expiryMonth: 12,
      expiryYear: 2030,
      cvv: '123',
      cardholderName: 'Ada',
    });
    expect(result.token).toMatch(/^tok_/);
  });

  it('maps network errors to ProcessorUnavailableError', async () => {
    nock(PROCESSOR_URL).post('/process').replyWithError('ECONNREFUSED');

    await expect(
      client.process({
        paymentId: '33333333-3333-4333-8333-333333333333',
        amount: 19.99,
        currency: Currency.create('USD'),
        cardToken: 'tok_abc',
      }),
    ).rejects.toThrow(ProcessorUnavailableError);
  });
});
