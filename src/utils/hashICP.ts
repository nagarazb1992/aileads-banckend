import crypto from 'crypto';

export function hashICP(input: object) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(input))
    .digest('hex');
}
