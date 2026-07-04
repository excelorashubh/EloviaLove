const { getRazorpayConfig, isRazorpayConfigured } = require('../utils/razorpayConfig');

describe('Razorpay configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses the runtime environment values when they are present', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';
    process.env.RAZORPAY_KEY_SECRET = 'secret_test';

    expect(getRazorpayConfig()).toEqual({
      key_id: 'rzp_test_key',
      key_secret: 'secret_test',
    });
    expect(isRazorpayConfigured()).toBe(true);
  });

  it('throws a clear error when Razorpay credentials are incomplete', () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_test_key';

    expect(() => getRazorpayConfig()).toThrow(/RAZORPAY_KEY_SECRET/);
    expect(isRazorpayConfigured()).toBe(false);
  });
});
