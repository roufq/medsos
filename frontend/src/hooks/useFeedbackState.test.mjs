import {after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const server=await createServer({root:fileURLToPath(new URL('../../',import.meta.url)),configFile:false,ssr:{noExternal:['react']},server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},plugins:[{
 name:'feedback-state-probe',enforce:'pre',resolveId(source){if(source==='react')return '\0feedback-react';if(source==='virtual:feedback-probe')return '\0feedback-probe';},
 load(id){if(id==='\0feedback-probe')return 'export const probe={value:null};';if(id==='\0feedback-react')return `import {probe} from 'virtual:feedback-probe';export const useCallback=fn=>fn;export const useState=initial=>[initial,next=>{probe.value=next}];`;},
}]});
after(()=>server.close());
const {probe}=await server.ssrLoadModule('virtual:feedback-probe');
const {useFeedbackState}=await server.ssrLoadModule('/src/hooks/useFeedbackState.js');
const {feedbackSnapshot,clearFeedback}=await server.ssrLoadModule('/src/utils/feedback.js');
afterEach(clearFeedback);

test('form notices preserve inline state and classify real success/error results',()=>{
 const [,setNotice]=useFeedbackState({},'success');
 const failed={type:'error',text:'Server rejected this form'};setNotice(failed);
 assert.equal(probe.value,failed);assert.equal(feedbackSnapshot()[0].type,'error');
 setNotice({type:'ok',text:'Saved'});assert.equal(feedbackSnapshot()[1].type,'success');
 setNotice({});assert.equal(feedbackSnapshot().length,2);
});
test('field validation errors use error severity and React functional updates are forwarded untouched',()=>{
 const [,setError]=useFeedbackState('','error');setError('Password does not match');
 assert.equal(feedbackSnapshot()[0].type,'error');
 const update=()=>'';setError(update);assert.equal(probe.value,update);assert.equal(feedbackSnapshot().length,1);
});
