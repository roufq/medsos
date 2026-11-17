import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uniquePosts, filterResults, postKind } from './discovery.js';

const posts = [
  { id: 1, post_type: 'image', media: [{media_type:'image'}], created_at:'2026-11-17T10:00:00Z', location:'Bali', likes_count:2 },
  { id: 2, post_type: 'video', media: [{media_type:'video'}], created_at:'2026-11-15T10:00:00Z', location:'Bali', likes_count:20 },
  { id: 3, post_type: 'shop', media: [{media_type:'image'}], created_at:'2026-10-01T10:00:00Z', location:'Solo' },
];
test('combined search results deduplicate product posts without losing their identity', () => {
  assert.equal(uniquePosts([...posts, posts[2]]).length, 3);
  assert.equal(postKind(posts[2]), 'shop');
});
test('search filters combine type, location, time, and ordering on actual results', () => {
  const now = new Date('2026-11-17T12:00:00Z');
  assert.deepEqual(filterResults(posts,{kind:'video',location:'Bali',period:'week'},now).map(p=>p.id),[2]);
  assert.deepEqual(filterResults(posts,{period:'today'},now).map(p=>p.id),[1]);
  assert.deepEqual(filterResults(posts,{sort:'popular'},now).map(p=>p.id),[2,1,3]);
  assert.deepEqual(filterResults(posts,{kind:'shop',period:'week'},now),[]);
  assert.deepEqual(posts.map(p=>p.id),[1,2,3]);
});
