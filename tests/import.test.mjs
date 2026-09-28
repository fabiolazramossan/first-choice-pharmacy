import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "../lib/csv.ts";
import { parsePrice, validateImport, MAX_IMPORT_ROWS } from "../lib/product-import.ts";

test("parseCsv handles quotes, escaped quotes, embedded commas/newlines and CRLF", () => {
  const csv = '﻿name,description\r\n"Tylenol, 500 mg","Dice ""extra""\nfuerte"\r\nAdvil,\r\n\r\n';
  assert.deepEqual(parseCsv(csv), [
    ["name", "description"],
    ["Tylenol, 500 mg", 'Dice "extra"\nfuerte'],
    ["Advil", ""],
  ]);
});

test("parseCsv detects semicolon delimiters (Excel es-PR)", () => {
  assert.deepEqual(parseCsv("nombre;precio\nAdvil;12,99\n"), [["nombre", "precio"], ["Advil", "12,99"]]);
});

test("parsePrice accepts common formats and rejects bad ones", () => {
  assert.equal(parsePrice("12.99"), 12.99);
  assert.equal(parsePrice("$5"), 5);
  assert.equal(parsePrice("12,99"), 12.99);
  assert.equal(parsePrice("-1"), null);
  assert.equal(parsePrice("1.999"), null);
  assert.equal(parsePrice("abc"), null);
  assert.equal(parsePrice("999999"), null);
});

test("validateImport reports missing required columns", () => {
  const result = validateImport([["name", "price"], ["Advil", "5"]]);
  assert.deepEqual(result.missingColumns, ["category"]);
});

test("validateImport accepts Spanish headers and normalizes rows", () => {
  const { rows, issues } = validateImport(parseCsv(
    "Nombre,Categoría,Precio,Cantidad,Marca,SKU,UPC,Presentación\n" +
    "Advil 200mg,dolor-muscular,$9.99,12,Advil,ADV-1,305730154505,24 tabletas\n"
  ));
  assert.deepEqual(issues, []);
  assert.equal(rows.length, 1);
  assert.deepEqual(
    { ...rows[0] },
    {
      line: 2, name: "Advil 200mg", categorySlug: "dolor-muscular", price: 9.99, quantity: 12,
      brand: "Advil", sku: "ADV-1", upc: "305730154505", presentation_size: "24 tabletas", description: null,
    }
  );
});

test("validateImport flags bad rows with line numbers and in-file duplicates", () => {
  const { rows, issues } = validateImport(parseCsv(
    "name,category,price,quantity,sku,upc\n" +
    "Ok product,medicamentos-otc,1.00,1,A1,\n" +
    "X,Bad Slug!,free,-3,,12\n" +
    "Dup sku,medicamentos-otc,2.00,,a1,\n"
  ));
  assert.equal(rows.length, 1);
  assert.equal(issues.length, 2);
  assert.equal(issues[0].line, 3);
  assert.match(issues[0].message, /nombre/);
  assert.match(issues[0].message, /categoría/);
  assert.match(issues[0].message, /precio/);
  assert.match(issues[0].message, /cantidad/);
  assert.match(issues[0].message, /UPC/);
  assert.equal(issues[1].line, 4);
  assert.match(issues[1].message, /SKU repetido \(línea 2\)/);
});

test("validateImport enforces the row limit", () => {
  const table = [["name", "category", "price"], ...Array.from({ length: MAX_IMPORT_ROWS + 1 }, () => ["Item", "x", "1"])];
  const { rows, issues } = validateImport(table);
  assert.equal(rows.length, 0);
  assert.equal(issues.length, 1);
});

test("validateImport rejects SKUs with characters outside the safe set", () => {
  const { issues } = validateImport(parseCsv('name,category,price,sku\nItem,x,1,"A,B"\nItem2,x,1,a"b\nOk,x,1,AB-1/2.x_y\n'));
  assert.deepEqual(issues.map((i) => i.line), [2, 3]);
});
