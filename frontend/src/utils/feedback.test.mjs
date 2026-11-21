import {afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {clearFeedback,dismissFeedback,feedbackSnapshot,notify,showFeedback,subscribeFeedback,fieldValidationMessage} from './feedback.js';
afterEach(clearFeedback);

test('success, error and info retain their severity and notify subscribers',()=>{
 let changes=0;const unsubscribe=subscribeFeedback(()=>changes++);
 notify.success('Saved');notify.error('Failed');notify.info('Ready');
 assert.deepEqual(feedbackSnapshot().map(item=>item.type),['success','error','info']);
 assert.equal(changes,3);unsubscribe();
 dismissFeedback(feedbackSnapshot()[0].id);assert.equal(changes,3);
});
test('identical feedback is deduplicated while different results stay visible and bounded',()=>{
 notify.error('Required');notify.error('Required');assert.equal(feedbackSnapshot().length,1);
 notify.success('Saved');notify.info('Ready');notify.error('Invalid email');
 assert.equal(feedbackSnapshot().length,3);
 assert.deepEqual(feedbackSnapshot().map(item=>item.message),['Saved','Ready','Invalid email']);
});
test('empty form state resets do not show a popup; dismissal removes only its own item',()=>{
 for(const value of ['',null,undefined,{},'   '])showFeedback(value,'error');
 assert.equal(feedbackSnapshot().length,0);
 const first=notify.success('Done');notify.error('Oops');dismissFeedback(first);
 assert.equal(feedbackSnapshot().length,1);assert.equal(feedbackSnapshot()[0].message,'Oops');
});
test('native field errors include an accessible label without reading or exposing field values',()=>{
 const field={getAttribute:name=>name==='aria-label'?'Password':'',validationMessage:'Please fill out this field.',get value(){throw new Error('Never read secrets');}};
 assert.equal(fieldValidationMessage(field),'Password: Please fill out this field.');
 assert.equal(fieldValidationMessage({getAttribute:()=>null,labels:[{textContent:' Email address '}],validationMessage:'Invalid email.'}),'Email address: Invalid email.');
});
