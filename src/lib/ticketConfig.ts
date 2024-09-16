export const ticketConfig = {
    FULL: { amount: 300.00, currency: 'EUR' },
    TWO_DAY: { amount: 200.00, currency: 'EUR' },
    ONE_DAY: { amount: 100, currency: 'EUR' },
    FREE: { amount: 0, currency: 'EUR' },
    VVIP: { amount: 500, currency: 'EUR' },
    VIP: { amount: 400, currency: 'EUR' },
    PASS: { amount: 150, currency: 'EUR' },
  };

  export function getEntityId(currency: string): string {
    switch (currency) {
      case 'SAR':
        return "8acda4ce899a99c00189b5839d8376e8";
      case 'USD':
        return "8acda4ca902fb4bb01904e2cddf40dea";
      case 'EUR':
        return "8acda4ca902fb4bb01904e2d42430df1";
      case 'GBP':
        return "8ac9a4cd90e440510190e4a76f460523";
      default:
        throw new Error('Invalid currency');
    }
  }