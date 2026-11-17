import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { sharePost, SHARE_PLATFORMS } from './share.js';

const prepared = { prepared: true, share_url: 'https://postter.us/p/example', intent_url: 'https://www.facebook.com/sharer/sharer.php?u=example', shares_count: 4 };
function fixture() {
  const calls = [], copies = [];
  const popup = { opener: {}, closed: false, location: { href: '' }, close() { this.closed = true; } };
  return { calls, copies, popup, deps: {
    share: async (...args) => { calls.push(args); return args[2]?.prepare_only ? prepared : { ...prepared, shares_count: 5 }; },
    copy: async value => { copies.push(value); },
    openWindow: () => popup,
  } };
}
test('opens a share destination synchronously, then records the handoff', async () => {
  const f = fixture(); let opened = false;
  f.deps.openWindow = () => { opened = true; return f.popup; };
  const pending = sharePost('post', 'facebook', f.deps);
  assert.equal(opened, true);
  const result = await pending;
  assert.equal(f.popup.opener, null);
  assert.equal(f.popup.location.href, prepared.intent_url);
  assert.deepEqual(f.calls, [['post', 'facebook', { prepare_only: true }], ['post', 'facebook']]);
  assert.equal(result.result.shares_count, 5);
});
test('blocked, closed, and refused popups offer a link without recording a share', async () => {
  for (const open of [() => null, () => ({ closed: true }), () => { throw new Error('blocked'); }]) {
    const f = fixture(); f.deps.openWindow = open;
    const result = await sharePost('post', 'facebook', f.deps);
    assert.equal(result.state, 'blocked');
    assert.equal(result.targetUrl, prepared.intent_url);
    assert.equal(result.counted, false);
    assert.equal(f.calls.length, 1);
  }
});
test('copy failures do not increment the counter', async () => {
  const f = fixture(); f.deps.copy = async () => { throw new Error('clipboard denied'); };
  await assert.rejects(sharePost('post', 'copy', f.deps), /clipboard denied/);
  assert.equal(f.calls.length, 1);
});
test('Instagram and TikTok copy links and offer an explicit manual destination', async () => {
  for (const channel of ['instagram', 'tiktok']) {
    const f = fixture(); f.deps.openWindow = () => { throw new Error('must not open a popup'); };
    const result = await sharePost('post', channel, f.deps);
    assert.equal(result.state, 'manual');
    assert.deepEqual(f.copies, [prepared.share_url]);
    assert.equal(new URL(result.targetUrl).hostname, `www.${channel}.com`);
    assert.equal(result.counted, true);
  }
});
test('failed preparation and unsafe intents close the blank window without counting', async () => {
  for (const response of [null, { ...prepared, intent_url: 'javascript:alert(1)' }, { ...prepared, intent_url: '' }]) {
    const f = fixture();
    f.deps.share = async (...args) => { f.calls.push(args); if (!response) throw new Error('network failed'); return response; };
    await assert.rejects(sharePost('post', 'facebook', f.deps));
    assert.equal(f.popup.closed, true);
    assert.equal(f.calls.length, 1);
  }
});
test('a recording failure retains a successful copy and does not repeat it', async () => {
  const f = fixture(); f.deps.share = async (id, channel, options) => { if (options?.prepare_only) return prepared; throw new Error('unavailable'); };
  const result = await sharePost('post', 'copy', f.deps);
  assert.equal(result.state, 'copied');
  assert.equal(result.counted, false);
  assert.deepEqual(f.copies, [prepared.share_url]);
});
test('an older backend response never triggers a second recording request', async () => {
  const f = fixture();
  f.deps.share = async (...args) => { f.calls.push(args); return { ...prepared, prepared: undefined }; };
  await assert.rejects(sharePost('post', 'facebook', f.deps), /backend diperbarui/);
  assert.equal(f.calls.length, 1);
  assert.equal(f.popup.closed, true);
});
test('all nine platforms have real local SVG icons', () => {
  assert.equal(SHARE_PLATFORMS.length, 9);
  assert.equal(new Set(SHARE_PLATFORMS.map(item => item.id)).size, 9);
  for (const platform of SHARE_PLATFORMS) {
    const svg = readFileSync(new URL(`../../public/icons/share/${platform.id}.svg`, import.meta.url), 'utf8');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /<path\b/);
    assert.doesNotMatch(svg, /<script\b/);
  }
});
