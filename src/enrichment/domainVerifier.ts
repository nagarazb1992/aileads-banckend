import dns from 'dns/promises';
import https from 'https';

export async function verifyDomain(domain: string): Promise<boolean> {
  try {
    await dns.lookup(domain);
    return new Promise(resolve => {
      https
        .get(`https://${domain}`, { timeout: 3000 }, res =>
          resolve(!!res.statusCode && res.statusCode < 500)
        )
        .on('error', () => resolve(false));
    });
  } catch {
    return false;
  }
}
