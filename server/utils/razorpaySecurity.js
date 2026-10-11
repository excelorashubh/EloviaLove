const crypto = require('crypto');

function signaturesMatch(expected, supplied) {
  if (typeof expected !== 'string' || typeof supplied !== 'string') return false;
  if (!/^[a-f0-9]{64}$/i.test(supplied)) return false;

  const expectedBuffer = Buffer.from(expected, 'hex');
  const suppliedBuffer = Buffer.from(supplied, 'hex');
  return expectedBuffer.length === suppliedBuffer.length
    && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function verifyPaymentSignature(orderId, paymentId, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return signaturesMatch(expected, signature);
}

function verifyWebhookSignature(rawBody, signature, secret) {
  if (!rawBody || !Buffer.isBuffer(rawBody) && typeof rawBody !== 'string') return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return signaturesMatch(expected, signature);
}

module.exports = {
  signaturesMatch,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
