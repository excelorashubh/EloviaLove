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

function getRazorpayWebhookSecret() {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();
  if (!secret || /^your_|^change[_-]?me$/i.test(secret)) {
    throw new Error('Missing Razorpay webhook secret: RAZORPAY_WEBHOOK_SECRET');
  }
  return secret;
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
  getRazorpayConfig,
  getRazorpayWebhookSecret,
  isRazorpayConfigured,
};
