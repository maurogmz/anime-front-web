/**
 * HTTP client tuned for the AniList GraphQL API (https://docs.anilist.co/guide/rate-limiting):
 * - Rate limit: 90 req/min nominal, currently degraded to 30 req/min → client-side throttle.
 * - 429 / 5xx → retry with backoff. Browsers cannot read Retry-After (not CORS-exposed),
 *   so the wait comes from X-RateLimit-Reset (unix seconds) when present.
 * - Timeouts fail fast: an API that does not answer will not answer on retry either.
 * - Responses are cached with a TTL and identical in-flight requests are deduplicated.
 *
 * Built as a factory so tests can inject fetch, clock, sleep and storage.
 */

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

const MESSAGES = {
  0: "Network error. Check your connection and try again.",
  400: "The request was not valid.",
  404: "We couldn't find that title.",
  429: "Too many requests to the anime database. Wait a few seconds and retry.",
  500: "The anime database is having trouble. Try again in a moment.",
};
export const messageFor = (status) => MESSAGES[status] ?? MESSAGES[status >= 500 ? 500 : 0];

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function defaultStorage() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null; // storage disabled (privacy mode)
  }
}

export function createHttpClient({
  fetchImpl = (...args) => globalThis.fetch(...args),
  sleep = realSleep,
  now = () => Date.now(),
  storage = defaultStorage(),
  minIntervalMs = 250,
  perMinute = 28,
  timeoutMs = 10000,
  maxRetries = 2,
  defaultTtlMs = 10 * 60 * 1000,
  storagePrefix = "anilist:",
} = {}) {
  const memory = new Map();
  const inflight = new Map();
  const stamps = [];
  let slotChain = Promise.resolve();

  async function waitForSlot() {
    for (;;) {
      const t = now();
      while (stamps.length && t - stamps[0] >= 60_000) stamps.shift();
      const last = stamps.at(-1) ?? -Infinity;
      const wait = Math.max(last + minIntervalMs - t, stamps.length >= perMinute ? stamps[0] + 60_000 - t : 0);
      if (wait <= 0) {
        stamps.push(t);
        return;
      }
      await sleep(wait);
    }
  }

  // Serialize slot acquisition so concurrent callers can't race past the limit.
  function takeSlot() {
    slotChain = slotChain.then(waitForSlot);
    return slotChain;
  }

  function readCache(key) {
    const hit = memory.get(key);
    if (hit && hit.expires > now()) return hit.data;
    try {
      const raw = storage?.getItem(storagePrefix + key);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (parsed.expires > now()) {
        memory.set(key, parsed);
        return parsed.data;
      }
      storage.removeItem(storagePrefix + key);
    } catch {
      // corrupt or unavailable storage: treat as a miss
    }
    return undefined;
  }

  function writeCache(key, data, ttlMs) {
    const entry = { data, expires: now() + ttlMs };
    memory.set(key, entry);
    try {
      storage?.setItem(storagePrefix + key, JSON.stringify(entry));
    } catch {
      // quota exceeded: memory cache is enough
    }
  }

  const backoff = (attempt) => 1000 * 2 ** attempt;

  function retryDelay(res, attempt) {
    const header = (name) => Number(res.headers?.get?.(name));
    const retryAfter = header("Retry-After") * 1000;
    if (retryAfter > 0) return retryAfter;
    const untilReset = header("X-RateLimit-Reset") * 1000 - now();
    if (untilReset > 0 && untilReset <= 60_000) return untilReset;
    return backoff(attempt);
  }

  async function fetchWithRetry(url, body) {
    for (let attempt = 0; ; attempt++) {
      await takeSlot();
      let res;
      try {
        res = await fetchImpl(url, {
          method: body ? "POST" : "GET",
          headers: body ? { Accept: "application/json", "Content-Type": "application/json" } : { Accept: "application/json" },
          body,
          signal: AbortSignal.timeout(timeoutMs),
        });
      } catch (err) {
        const timedOut = err?.name === "TimeoutError";
        if (!timedOut && attempt < maxRetries) {
          await sleep(backoff(attempt));
          continue;
        }
        throw new HttpError(0, timedOut ? "The anime database is not responding right now. Try again in a minute." : messageFor(0));
      }

      if (res.ok) return res.json();

      const retryable = res.status === 429 || res.status >= 500;
      if (retryable && attempt < maxRetries) {
        await sleep(retryDelay(res, attempt));
        continue;
      }
      throw new HttpError(res.status, messageFor(res.status));
    }
  }

  /** GET when `body` is omitted, POST with a JSON string body otherwise. */
  async function requestJson(url, { body, ttlMs = defaultTtlMs } = {}) {
    const key = body ? `${url}#${body}` : url;
    const cached = readCache(key);
    if (cached !== undefined) return cached;
    if (inflight.has(key)) return inflight.get(key);

    const request = fetchWithRetry(url, body)
      .then((data) => {
        writeCache(key, data, ttlMs);
        return data;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, request);
    return request;
  }

  return { requestJson };
}
