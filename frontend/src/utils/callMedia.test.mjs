import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acquireCallMedia } from './callMedia.js';

test('denied microphone stops the call instead of producing silent audio', async () => {
  const devices = { getUserMedia: async () => { throw Object.assign(new Error('denied'), { name: 'NotAllowedError' }); } };
  await assert.rejects(acquireCallMedia(devices, 'voice', () => {}), /Izin mikrofon ditolak/);
  await assert.rejects(acquireCallMedia(undefined, 'voice', () => {}), /HTTPS/);
});

test('video can fall back to a working microphone, never to silence', async () => {
  const stream = { getAudioTracks: () => [{ readyState: 'live' }] };
  let attempts = 0;
  let cameraOff = false;
  const devices = { getUserMedia: async (constraints) => {
    attempts++;
    if (constraints.video) throw new Error('camera unavailable');
    return stream;
  } };
  assert.equal(await acquireCallMedia(devices, 'video', () => { cameraOff = true; }), stream);
  assert.equal(attempts, 2);
  assert.equal(cameraOff, true);
  assert.equal(await acquireCallMedia(devices, 'voice', () => {}), stream);
});

test('invalid audio stream releases devices and reports the problem', async () => {
  let stopped = false;
  const stream = { getAudioTracks: () => [], getTracks: () => [{ stop: () => { stopped = true; } }] };
  await assert.rejects(acquireCallMedia({ getUserMedia: async () => stream }, 'voice', () => {}), /tidak menghasilkan audio/);
  assert.equal(stopped, true);
});
