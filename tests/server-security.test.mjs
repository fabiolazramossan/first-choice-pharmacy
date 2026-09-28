import { test } from "node:test";
import assert from "node:assert/strict";
import { isUuid, readJsonObject, cleanText, escapeHtml, isTrustedBrowserRequest } from "../lib/server-security.ts";

const req = (body, headers = {}) => new Request("https://shop.example/api/x", { method: "POST", body, headers });

test("isUuid accepts only canonical UUIDs", () => {
  assert.equal(isUuid("7de7803f-7ea2-4e08-984f-a02e76c0eecf"), true);
  assert.equal(isUuid("7de7803f-7ea2-4e08-984f-a02e76c0eecf,x"), false);
  assert.equal(isUuid("abc"), false);
  assert.equal(isUuid(null), false);
});

test("readJsonObject returns null for malformed, array or primitive bodies", async () => {
  assert.equal(await readJsonObject(req("{bad")), null);
  assert.equal(await readJsonObject(req("[1,2]")), null);
  assert.equal(await readJsonObject(req("42")), null);
  assert.deepEqual(await readJsonObject(req('{"a":1}')), { a: 1 });
});

test("cleanText strips control characters and truncates", () => {
  assert.equal(cleanText("a\u0000b\n\tc   d", 100), "a b c d");
  assert.equal(cleanText("x".repeat(10), 3), "xxx");
});

test("escapeHtml neutralizes markup", () => {
  assert.equal(escapeHtml(`<a href="x">'&`), "&lt;a href=&quot;x&quot;&gt;&#039;&amp;");
});

test("isTrustedBrowserRequest rejects cross-site and foreign origins", () => {
  const make = (headers) => new Request("https://shop.example/api/x", { method: "POST", headers: { host: "shop.example", ...headers } });
  assert.equal(isTrustedBrowserRequest(make({ origin: "https://shop.example" })), true);
  assert.equal(isTrustedBrowserRequest(make({ origin: "https://evil.example" })), false);
  assert.equal(isTrustedBrowserRequest(make({ "sec-fetch-site": "cross-site" })), false);
  assert.equal(isTrustedBrowserRequest(make({ origin: "http://shop.example" })), false, "protocol downgrade");
});
