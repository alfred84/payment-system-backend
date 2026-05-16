import { InvalidMoneyError } from './Money';
import { Money } from './Money';

describe('Money', () => {
  it('creates money with positive amount and currency', () => {
    const money = Money.of(10.5, 'USD');
    expect(money.amount).toBe(10.5);
    expect(money.currency).toBe('USD');
  });

  it('throws when amount is not positive', () => {
    expect(() => Money.of(-1, 'USD')).toThrow(InvalidMoneyError);
    expect(() => Money.of(0, 'USD')).toThrow(InvalidMoneyError);
  });

  it('rejects add with mixed currencies', () => {
    const usd = Money.of(10, 'USD');
    const eur = Money.of(5, 'EUR');
    expect(() => usd.add(eur)).toThrow(InvalidMoneyError);
  });

  it('rejects amounts with more than two decimal places', () => {
    expect(() => Money.of(10.999, 'USD')).toThrow(InvalidMoneyError);
  });
});
