import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const encKey = process.env.ENC_KEY;

if (!encKey) {
  throw new Error('Missing ENC_KEY environment variable');
}

const key = Buffer.from(encKey, 'hex');

if (key.length !== 32) {
  throw new Error('ENC_KEY must be 32 bytes (64 hex characters)');
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12); // Recommended IV size for GCM
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // iv + authTag + encrypted
  return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

export function decrypt(payload: string): string {
  const buffer = Buffer.from(payload, 'hex');

  const iv = buffer.subarray(0, 12);
  const authTag = buffer.subarray(12, 28);
  const encryptedText = buffer.subarray(28);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
