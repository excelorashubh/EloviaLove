const DEFAULT_RAZORPAY_KEY_ID = 'rzp_test_T9J7MIgjWdCA2L';
const DEFAULT_RAZORPAY_KEY_SECRET = 'LJzBX3PN8ehf4r3UgNh3NvbE';

function getRazorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    const missing = [];
    if (!keyId) missing.push('RAZORPAY_KEY_ID');
    if (!keySecret) missing.push('RAZORPAY_KEY_SECRET');
    throw new Error(`Missing Razorpay credentials: ${missing.join(', ')}`);
  }

  return {
    key_id: keyId,
    key_secret: keySecret,
  };
}

function isRazorpayConfigured() {
  try {
    getRazorpayConfig();
    return true;
  } catch (_err) {
    return false;
  }
}

module.exports = {
  DEFAULT_RAZORPAY_KEY_ID,
  DEFAULT_RAZORPAY_KEY_SECRET,
  getRazorpayConfig,
  isRazorpayConfigured,
};
