const crypto = require('crypto');
const {
  signaturesMatch,
  verifyPaymentSignature,
  verifyWebhookSignature,
} = require('../utils/razorpaySecurity');

describe('Razorpay signature verification', () => {
  const secret = 'test_secret';

  it('verifies a payment signature for the exact order and payment IDs', () => {
    const signature = crypto
      .createHmac('sha256', secret)
      .update('order_123|pay_456')
      .digest('hex');

    expect(verifyPaymentSignature('order_123', 'pay_456', signature, secret)).toBe(true);
    expect(verifyPaymentSignature('order_other', 'pay_456', signature, secret)).toBe(false);
  });

  it('verifies webhook signatures against the raw body', () => {
    const rawBody = Buffer.from('{"event":"payment.captured"}');
    const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    expect(verifyWebhookSignature(rawBody, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(Buffer.from('{}'), signature, secret)).toBe(false);
  });

  it('rejects missing, malformed, and unequal signatures', () => {
    expect(signaturesMatch('f'.repeat(64), undefined)).toBe(false);
    expect(signaturesMatch('f'.repeat(64), 'not-a-signature')).toBe(false);
    expect(signaturesMatch('f'.repeat(64), 'e'.repeat(64))).toBe(false);
  });
});
