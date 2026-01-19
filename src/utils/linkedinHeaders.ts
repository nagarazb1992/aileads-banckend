export function getLinkedInHeaders(cookie: string) {
  if (!cookie) {
    throw new Error("Cookie is required");
  }

  const liAtMatch = cookie.match(/li_at=([^;]+)/);
  const jsessionMatch = cookie.match(/JSESSIONID="?\"?([^";]+)\"?"?/);

  console.log("Extracted li_at:", liAtMatch ? liAtMatch[1] : "not found");
  console.log(
    "Extracted JSESSIONID:",
    jsessionMatch ? jsessionMatch[1] : "not found"
  );

  if (!liAtMatch) {
    throw new Error("li_at not found");
  }

  if (!jsessionMatch) {
    throw new Error("JSESSIONID not found");
  }

  // IMPORTANT: LinkedIn expects CSRF token WITH quotes
  const csrfToken = `"${jsessionMatch[1]}"`;

  return {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",

    accept: "application/json",
    "accept-language": "en-US,en;q=0.9",

    // MUST BE QUOTED
    "csrf-token": `"${jsessionMatch[1]}"`,

    // REQUIRED
    "x-restli-protocol-version": "2.0.0",
    "x-li-lang": "en_US",

    cookie: liAtMatch[1],
  };
}


export function extractLinkedInCookies(rawCookie: string) {
  if (!rawCookie) throw new Error("Cookie string empty");

  const liAtMatch = rawCookie.match(/li_at=([^;]+)/);
  if (!liAtMatch) throw new Error("li_at not found");

  const li_at = liAtMatch[1];

  // JSESSIONID optional
  const jsessionMatch = rawCookie.match(/JSESSIONID="?([^";]+)"?/);
  const jsession = jsessionMatch ? jsessionMatch[1] : null;

  const cookieHeader = jsession
    ? `li_at=${li_at}; JSESSIONID="${jsession}"`
    : `li_at=${li_at}`;

  return { cookieHeader };
}




