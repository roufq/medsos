import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configurePlatformDate,platformDate} from './platformDate.js';
test('configured timezone determines the displayed calendar day',()=>{
 configurePlatformDate({language:'en',timezone:'Asia/Jakarta'});
 assert.match(platformDate('2026-11-19T23:00:00Z'),/11\/20\/2026/);
 configurePlatformDate({language:'en',timezone:'America/New_York'});
 assert.match(platformDate('2026-11-19T23:00:00Z'),/11\/19\/2026/);
 assert.equal(platformDate(null),'—');
});
