import {test} from 'node:test';
import assert from 'node:assert/strict';
import {csvText,dateSeries} from './consoleUtils.js';
test('CSV escapes formulas, commas, quotes and multiline text',()=>{assert.equal(csvText([['=CMD()', 'a,b','say "hi"','a\nb']]),'\uFEFF"\'=CMD()","a,b","say ""hi""","a\nb"');});
test('charts fill absent days with zero without inventing growth',()=>{assert.deepEqual(dateSeries([{date:'2026-11-19',count:3}],2,new Date('2026-11-20T12:00:00Z')),[{date:'2026-11-19',count:3},{date:'2026-11-20',count:0}]);});
