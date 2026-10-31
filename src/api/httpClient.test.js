import { describe, it, expect, vi } from "vitest";
import { createHttpClient, HttpError } from "./httpClient.js";

const ok = (data) => ({ ok: true, status: 200, json: async () => data, headers: new Headers() });
const fail = (status, headers = {}) => ({ ok: false, status, json: async () => ({}), headers: new Headers(headers) });

function setup(responses, opts = {}) {
  let t = 0;
  const sleeps = [];
  const fetchImpl = vi.fn(async () => {
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  });
  const client = createHttpClient({
    fetchImpl,
    now: () => t,
    sleep: async (ms) => {
      sleeps.push(ms);
      t += ms;
    },
    storage: null,
    ...opts,
  });
  return { client, fetchImpl, sleeps, advance: (ms) => (t += ms) };
}

describe("httpClient", () => {
  it("caches responses until the TTL expires", async () => {
    const { client, fetchImpl, advance } = setup([ok({ a: 1 }), ok({ a: 2 })]);
    expect(await client.getJson("u", { ttlMs: 1000 })).toEqual({ a: 1 });
    expect(await client.getJson("u", { ttlMs: 1000 })).toEqual({ a: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    advance(1001);
    expect(await client.getJson("u")).toEqual({ a: 2 });
  });

  it("deduplicates concurrent identical requests", async () => {
    const { client, fetchImpl } = setup([ok(1)]);
    const [a, b] = await Promise.all([client.getJson("u"), client.getJson("u")]);
    expect(a).toBe(1);
    expect(b).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("retries 429 honoring Retry-After, then succeeds", async () => {
    const { client, sleeps } = setup([fail(429, { "Retry-After": "2" }), ok("done")]);
    expect(await client.getJson("u")).toBe("done");
    expect(sleeps).toContain(2000);
  });

  it("spaces requests to respect the per-second limit", async () => {
    const { client, sleeps } = setup([ok(1), ok(2)], { minIntervalMs: 400 });
    await client.getJson("a");
    await client.getJson("b");
    expect(sleeps).toEqual([400]);
  });

  it("waits when the per-minute budget is spent", async () => {
    const { client, sleeps } = setup([ok(1), ok(2), ok(3)], { minIntervalMs: 0, perMinute: 2 });
    await client.getJson("a");
    await client.getJson("b");
    await client.getJson("c");
    expect(sleeps).toEqual([60_000]);
  });

  it("does not retry 404 and exposes a readable error", async () => {
    const { client, fetchImpl } = setup([fail(404)]);
    await expect(client.getJson("u")).rejects.toMatchObject({ name: "HttpError", status: 404 });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("gives up on network errors after maxRetries", async () => {
    const { client, fetchImpl } = setup([new TypeError("x"), new TypeError("x")], { maxRetries: 1 });
    await expect(client.getJson("u")).rejects.toBeInstanceOf(HttpError);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("fails fast on timeouts instead of retrying", async () => {
    const timeout = Object.assign(new Error("t"), { name: "TimeoutError" });
    const { client, fetchImpl } = setup([timeout]);
    await expect(client.getJson("u")).rejects.toMatchObject({ status: 0, message: expect.stringMatching(/not responding/) });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("ignores corrupt storage entries", async () => {
    const storage = { getItem: () => "{not json", setItem: () => {}, removeItem: () => {} };
    const { client } = setup([ok("fresh")], { storage });
    expect(await client.getJson("u")).toBe("fresh");
  });
});
