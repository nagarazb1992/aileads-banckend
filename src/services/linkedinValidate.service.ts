import axios from "axios";
import { extractLinkedInCookies } from "../utils/linkedinHeaders.js";

export async function validateLinkedinCookie(rawCookie: string) {
  try {
    if (!rawCookie || !rawCookie.includes("li_at")) {
      return { valid: false, error: "li_at missing" };
    }

    const { cookieHeader } = extractLinkedInCookies(rawCookie);

    const res = await axios.get(
      "https://www.linkedin.com/feed/",
      {
        headers: {
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          accept: "text/html",
          "accept-language": "en-US,en;q=0.9",
          cookie: cookieHeader,
        },
        timeout: 8000,
        maxRedirects: 0,
        validateStatus: () => true,
      }
    );

    if (res.status === 200) {
      return {
        valid: true,
        note: "LinkedIn session valid (feed accessible)",
      };
    }

    if (res.status === 302) {
      return {
        valid: false,
        error: "Session expired (redirected to login)",
      };
    }

    if (res.status === 403) {
      return {
        valid: false,
        error: "Session blocked or restricted",
      };
    }

    return {
      valid: false,
      error: `Unexpected LinkedIn status: ${res.status}`,
    };
  } catch (err) {
    console.error("[LinkedIn Validate Error]", err);
    return {
      valid: false,
      error: "LinkedIn validation failed",
    };
  }
}
