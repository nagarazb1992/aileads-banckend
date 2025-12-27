let lastCallTime = 0;

export async function rateLimit(minDelayMs = 800) {
  const now = Date.now();
  const wait = minDelayMs - (now - lastCallTime);

  if (wait > 0) {
    await new Promise(resolve => setTimeout(resolve, wait));
  }

  lastCallTime = Date.now();
}
