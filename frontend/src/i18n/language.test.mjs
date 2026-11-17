import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { normalizeLanguage, localeFor, translate, timeAgo } from './language.js';

const dictionary = JSON.parse(readFileSync(new URL('./translations.json', import.meta.url), 'utf8'));

test('language selection is restricted to supported languages', () => {
  assert.equal(normalizeLanguage('en'), 'en');
  for (const value of [null, undefined, '', 'fr', 'EN']) assert.equal(normalizeLanguage(value), 'id');
  assert.equal(localeFor('en'), 'en-US');
  assert.equal(localeFor('id'), 'id-ID');
});

test('UI translations work both ways without changing unknown user content', () => {
  assert.equal(translate('Semua', 'en', dictionary), 'All');
  assert.equal(translate('Password', 'id', dictionary), 'Kata sandi');
  assert.equal(translate('Home', 'id', dictionary), 'Beranda');
  assert.equal(translate('Welcome Back to Postter', 'id', dictionary), 'Selamat Datang Kembali di Postter');
  const content = 'Karya asli pengguna #desain @rouf';
  assert.equal(translate(content, 'en', dictionary), content);
  assert.equal(translate(null, 'en', dictionary), null);
});

test('relative and calendar dates follow the selected language', () => {
  const now = Date.parse('2026-11-17T12:00:00Z');
  assert.equal(timeAgo('2026-11-17T11:59:45Z', 'id', now), 'baru saja');
  assert.equal(timeAgo('2026-11-17T11:59:45Z', 'en', now), 'just now');
  assert.equal(timeAgo('2026-11-17T11:58:00Z', 'en', now), '2 min ago');
  assert.equal(timeAgo('2026-11-17T10:00:00Z', 'id', now), '2 jam');
  assert.equal(timeAgo('2026-11-16T12:00:00Z', 'en', now), '1 day ago');
  assert.equal(timeAgo('bad date', 'en', now), '');
  const old = '2026-10-15T12:00:00Z';
  assert.equal(timeAgo(old, 'en', now), new Date(old).toLocaleDateString('en-US'));
  assert.equal(timeAgo(old, 'id', now), new Date(old).toLocaleDateString('id-ID'));
});

test('every dictionary entry has Indonesian and English text', () => {
  for (const [key, value] of Object.entries(dictionary)) {
    assert.ok(value.id && value.en, `Incomplete translation: ${key}`);
  }
});

test('literal translation keys used by components exist in the dictionary', () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const missing = new Set();
  const visit = directory => {
    for (const item of readdirSync(directory, { withFileTypes: true })) {
      const file = join(directory, item.name);
      if (item.isDirectory()) visit(file);
      else if (/\.[jt]sx$/.test(item.name)) {
        const source = readFileSync(file, 'utf8');
        const pattern = /\b(?:t|translateUI)\(\s*("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')\s*\)/g;
        for (const match of source.matchAll(pattern)) {
          const key = match[1][0] === '"' ? JSON.parse(match[1]) : match[1].slice(1, -1).replace(/\\'/g, "'");
          if (!dictionary[key]) missing.add(key);
        }
      }
    }
  };
  visit(root);
  assert.deepEqual([...missing], []);
});
