import { test } from "node:test";
import assert from "node:assert/strict";
import {
  accentInsensitivePattern,
  foldAccents,
  productSearchFilter,
  parsePage,
  parseSearchTerms,
} from "../lib/search.ts";

test("parseSearchTerms keeps letters, digits and hyphens only", () => {
  assert.deepEqual(parseSearchTerms("  Tylenol   500mg "), ["tylenol", "500mg"]);
  assert.deepEqual(parseSearchTerms("Acetaminofén"), ["acetaminofén"]);
  assert.deepEqual(parseSearchTerms("anti-ácido"), ["anti-ácido"]);
});

test("parseSearchTerms strips PostgREST and LIKE/regex syntax", () => {
  const terms = parseSearchTerms('a),or(is_active.eq.false*,x.%_\'"[a-z]+\\');
  for (const term of terms) {
    assert.match(term, /^[\p{L}\p{N}-]+$/u, `unsafe term: ${term}`);
  }
  assert.deepEqual(parseSearchTerms("*** ... ,,, ()"), []);
});

test("parseSearchTerms limits term count and input length", () => {
  assert.equal(parseSearchTerms("a b c d e f g h").length, 5);
  assert.ok(parseSearchTerms("x".repeat(500)).join("").length <= 80);
  assert.deepEqual(parseSearchTerms(null), []);
});

test("parseSearchTerms handles decomposed (NFD) input", () => {
  assert.deepEqual(parseSearchTerms("Médico"), ["médico"]);
});

test("foldAccents removes diacritics and lowercases", () => {
  assert.equal(foldAccents("ACETAMINOFÉN"), "acetaminofen");
  assert.equal(foldAccents("Niño"), "nino");
});

test("accentInsensitivePattern matches accented and plain spellings", () => {
  const pattern = accentInsensitivePattern("medico");
  assert.equal(pattern, accentInsensitivePattern("MÉDICO"));
  const re = new RegExp(pattern, "iu");
  for (const text of ["Equipo Médico", "EQUIPO MEDICO", "médico", "MÉDICO"]) {
    assert.ok(re.test(text), `${pattern} should match ${text}`);
  }
  assert.ok(!re.test("medicina"));
  assert.ok(new RegExp(accentInsensitivePattern("nino"), "iu").test("Niño"));
});

test("accentInsensitivePattern never emits regex metacharacters outside classes", () => {
  for (const raw of ["a.b*c", "x+y?", "(z)|q", "^$", "\\d"]) {
    for (const term of parseSearchTerms(raw)) {
      const withoutClasses = accentInsensitivePattern(term).replace(/\[[^\]]*\]/g, "");
      assert.doesNotMatch(withoutClasses, /[.*+?^$(){}|\\[\]]/);
    }
  }
});

test("parsePage clamps to a safe range", () => {
  assert.equal(parsePage("3"), 3);
  assert.equal(parsePage("0"), 1);
  assert.equal(parsePage("-2"), 1);
  assert.equal(parsePage("abc"), 1);
  assert.equal(parsePage("1.5"), 1);
  assert.equal(parsePage("999999"), 1000);
  assert.equal(parsePage(undefined), 1);
});

test("productSearchFilter builds one and() group with an or() per term", () => {
  const filter = productSearchFilter(parseSearchTerms("Tylenol 500"));
  assert.ok(filter.startsWith("(or(name.imatch.") && filter.endsWith("*))"));
  assert.equal(filter.match(/or\(/g).length, 2);
  assert.match(filter, /sku\.ilike\.\*500\*/);
});
