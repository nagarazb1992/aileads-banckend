import axios from 'axios';

type VerificationResult = {
  isValid: boolean;
  status: 'valid' | 'invalid' | 'catch_all' | 'unknown';
};

export async function verifyEmail(email: string): Promise<VerificationResult> {
  try {
    const res = await axios.get(
      'https://api.neverbounce.com/v4/single/check',
      {
        params: {
          key: process.env.NEVERBOUNCE_API_KEY,
          email,
        },
      }
    );

    const status = res.data.result;

    return {
      isValid: status === 'valid',
      status,
    };
  } catch (err) {
    // Fail-safe: do NOT block pipeline
    return { isValid: false, status: 'unknown' };
  }
}
