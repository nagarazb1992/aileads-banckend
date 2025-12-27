export function generateLinkedInUrl(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return `https://www.linkedin.com/in/${slug}`;
}
