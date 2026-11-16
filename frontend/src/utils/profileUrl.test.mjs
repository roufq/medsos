import { test } from 'node:test';
import assert from 'node:assert/strict';
import { profileUrl } from './profileUrl.js';

test('public profile URLs use the username at the root', () => {
  assert.equal(profileUrl({username:'msurya03'}),'/msurya03');
});
test('legacy reserved names and missing usernames keep a working profile route', () => {
  assert.equal(profileUrl({username:'admin'}),'/profile/admin');
  assert.equal(profileUrl({username:'home'}),'/profile/home');
  assert.equal(profileUrl({public_hash:'abc'}),'/profile/abc');
  assert.equal(profileUrl(null),'/profile/me');
});
