import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readAdminPage } from './adminPage.js';

test('paginated admin data preserves records and pagination', () => {
  const items = [{ id: 12 }];
  assert.deepEqual(readAdminPage({ items, has_more: true }), { items, has_more: true });
});

test('empty filtered data is an empty list', () => {
  assert.deepEqual(readAdminPage({ items: [], has_more: false }), { items: [], has_more: false });
  assert.deepEqual(readAdminPage({ items: null, has_more: false }), { items: [], has_more: false });
});

test('legacy arrays and HTML require a backend update rather than silently dropping filters', () => {
  for (const data of [[], [{ id: 1 }], '<html>SPA fallback</html>']) {
    assert.throws(() => readAdminPage(data), /Backend aktivitas belum diperbarui/);
  }
});

test('malformed pages and error payloads are rejected', () => {
  for (const data of [null, undefined, {}, { error: 'database unavailable' }, { items: null, has_more: true }, { items: {}, has_more: false }]) {
    assert.throws(() => readAdminPage(data), /Respons aktivitas server tidak valid/);
  }
});
