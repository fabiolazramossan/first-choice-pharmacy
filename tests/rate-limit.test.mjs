import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../lib/rate-limit.ts";

test("allows up to the limit, then blocks until the window resets", () => {
  const limiter = createRateLimiter({ limit: 3, windowMs: 1000 });
  assert.equal(limiter.hit("ip", 0), true);
  assert.equal(limiter.hit("ip", 1), true);
  assert.equal(limiter.hit("ip", 2), true);
  assert.equal(limiter.hit("ip", 3), false);
  assert.equal(limiter.isLimited("ip", 4), true);
  assert.equal(limiter.retryAfter("ip", 500), 1);
  assert.equal(limiter.hit("ip", 1000), true, "new window");
  assert.equal(limiter.isLimited("ip", 1001), false);
});

test("keys are independent and reset() clears one key", () => {
  const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
  limiter.hit("a", 0);
  assert.equal(limiter.isLimited("a", 1), true);
  assert.equal(limiter.isLimited("b", 1), false);
  limiter.reset("a");
  assert.equal(limiter.isLimited("a", 2), false);
});

test("memory stays bounded under a flood of distinct keys", () => {
  const limiter = createRateLimiter({ limit: 5, windowMs: 60_000, maxKeys: 100 });
  for (let i = 0; i < 10_000; i++) limiter.hit(`key-${i}`, i);
  assert.ok(limiter.size() <= 100, `size ${limiter.size()}`);
});

test("expired entries are swept when the map is full", () => {
  const limiter = createRateLimiter({ limit: 5, windowMs: 10, maxKeys: 3 });
  limiter.hit("a", 0);
  limiter.hit("b", 0);
  limiter.hit("c", 0);
  limiter.hit("d", 100);
  assert.equal(limiter.size(), 1);
});
