const domainPatterns = new Map<string, 'first.last' | 'first' | 'f_last'>();

export function learnEmailPattern(domain: string, email: string) {
  const local = email.split('@')[0];

  if (local.includes('.')) {
    domainPatterns.set(domain, 'first.last');
  } else if (local.length <= 6) {
    domainPatterns.set(domain, 'first');
  } else {
    domainPatterns.set(domain, 'f_last');
  }
}

export function getEmailPattern(domain: string) {
  return domainPatterns.get(domain) || 'first.last';
}

export function generateEmail(name: string, domain: string) {
  const [first, last] = name.toLowerCase().split(' ');
  const pattern = getEmailPattern(domain);

  if (!first || !last) return '';

  switch (pattern) {
    case 'first':
      return `${first}@${domain}`;
    case 'f_last':
      return `${first[0]}${last}@${domain}`;
    default:
      return `${first}.${last}@${domain}`;
  }
}
