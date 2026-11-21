import {after,afterEach,test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
const server=await createServer({root:fileURLToPath(new URL('../../../',import.meta.url)),configFile:false,ssr:{noExternal:[/^react$/,/^react-dom$/]},server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},plugins:[{
 name:'feedback-host-probe',enforce:'pre',
 resolveId(source){if(source==='virtual:host-probe')return '\0host-probe';if(/react\/jsx-(?:dev-)?runtime/.test(source))return '\0host-jsx';if(source==='react')return '\0host-react';if(source==='react-dom')return '\0host-portals';if(/context\/LanguageContext$/.test(source))return '\0host-language';},
 load(id){
  if(id==='\0host-jsx')return 'export const jsxDEV=(type,props,key)=>({type,props,key});export const jsx=jsxDEV;export const jsxs=jsxDEV;';
  if(id==='\0host-probe')return 'export const probe={cleanups:[]};';
  if(id==='\0host-react')return `import {probe} from 'virtual:host-probe';export const useEffect=fn=>{const cleanup=fn();if(cleanup)probe.cleanups.push(cleanup)};export const useRef=value=>({current:value});export const useSyncExternalStore=(_subscribe,snapshot)=>snapshot();`;
  if(id==='\0host-portals')return 'export const createPortal=children=>children;';
  if(id==='\0host-language')return 'export const useLanguage=()=>({t:value=>value});';
 }
}]});
after(()=>server.close());
const {probe}=await server.ssrLoadModule('virtual:host-probe');
const {default:FeedbackHost}=await server.ssrLoadModule('/src/components/common/FeedbackHost.jsx');
const {feedbackSnapshot,clearFeedback,notify}=await server.ssrLoadModule('/src/utils/feedback.js');
const originalDocument=globalThis.document;
afterEach(()=>{for(const cleanup of probe.cleanups.splice(0))cleanup();clearFeedback();if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;});
function invalid(document,label){const event=new Event('invalid',{cancelable:true});Object.defineProperty(event,'target',{value:{getAttribute:key=>key==='aria-label'?label:null,validationMessage:'Required'}});document.dispatchEvent(event);return event;}

test('one submit with several invalid fields shows the first actionable error and preserves native validation',async()=>{
 const document=new EventTarget();document.body={};globalThis.document=document;
 FeedbackHost();const first=invalid(document,'Title');invalid(document,'Email');
 await Promise.resolve();assert.equal(feedbackSnapshot().length,1);assert.equal(feedbackSnapshot()[0].message,'Title: Required');assert.equal(first.defaultPrevented,false);
 for(const cleanup of probe.cleanups.splice(0))cleanup();clearFeedback();invalid(document,'Other');await Promise.resolve();assert.equal(feedbackSnapshot().length,0);
});
test('error popups are announced as alerts; successful saves use status and a dismiss button',()=>{
 const document=new EventTarget();document.body={};globalThis.document=document;
 for(const [type,role] of [['error','alert'],['success','status']]){
  clearFeedback();notify[type]('Result');const host=FeedbackHost();const item=host.props.children[0];const view=item.type(item.props);
  assert.equal(view.props.role,role);const close=view.props.children.find(child=>child?.type==='button');assert.equal(close.props.type,'button');close.props.onClick();assert.equal(feedbackSnapshot().length,0);
 }
});

test('popups expire automatically even when the pointer or focus stays on them',context=>{
 context.mock.timers.enable({apis:['setTimeout']});
 const document=new EventTarget();document.body={};globalThis.document=document;
 for(const [type,duration] of [['success',4000],['error',7000],['info',4000]]){
  clearFeedback();notify[type]('Timed result');
  const host=FeedbackHost();const item=host.props.children[0];const view=item.type(item.props);
  assert.equal(view.props.style['--feedback-duration'],`${duration}ms`);
  const countdown=view.props.children.find(child=>child?.props?.className==='form-feedback-countdown');
  assert.equal(countdown.props['aria-hidden'],'true');
  view.props.onMouseEnter?.();view.props.onFocus?.();
  context.mock.timers.tick(duration-1);assert.equal(feedbackSnapshot().length,1);
  context.mock.timers.tick(1);assert.equal(feedbackSnapshot().length,0,`${type} must dismiss without clicking X`);
 }
});
