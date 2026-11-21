import {after,test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';

const prefix='\0home-navigation:';
const server=await createServer({
 root:fileURLToPath(new URL('../../../',import.meta.url)),configFile:false,ssr:{noExternal:['react-router-dom']},
 server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},
 plugins:[{name:'home-navigation-fixtures',enforce:'pre',
  resolveId(source){
   if(source==='virtual:home-navigation-state')return prefix+'state';
   if(source==='react-router-dom')return prefix+'router';
   if(/context\/AuthContext$/.test(source))return prefix+'auth';
   if(/context\/LanguageContext$/.test(source))return prefix+'language';
   if(/\/(Header|Sidebar|CreatePostModal|GuestComposer|AdPlacement|Brand|LanguageSwitch)$/.test(source))return prefix+'unused';
  },
  load(id){
   if(id===prefix+'state')return "export const state={user:{id:1,username:'member'},destination:null};";
   if(id===prefix+'router')return "import {state} from 'virtual:home-navigation-state';export const useNavigate=()=>path=>{state.destination=path};export const useSearchParams=()=>[new URLSearchParams()];";
   if(id===prefix+'auth')return "import {state} from 'virtual:home-navigation-state';export const useAuth=()=>({user:state.user});";
   if(id===prefix+'language')return "export const useLanguage=()=>({t:text=>text});";
   if(id===prefix+'unused')return 'export default function Unused(){return null}';
  },
 },react()],
});
after(()=>server.close());
const {state}=await server.ssrLoadModule('virtual:home-navigation-state');
const {useAppNavigate}=await server.ssrLoadModule('/src/components/modern/AppLayout.tsx');
const {default:MobileNav}=await server.ssrLoadModule('/src/components/modern/MobileNav.tsx');

test('header and sidebar Home navigation opens the explicit feed for signed-in users and guests',()=>{
 for(const user of [{id:1,username:'member'},null]){
  state.user=user;state.destination=null;
  useAppNavigate()('home');
  assert.equal(state.destination,'/home');
 }
});
test('mobile Home button opens the feed while Explore remains independent',()=>{
 for(const user of [{id:1,username:'member'},null]){
  state.user=user;
  const nav=MobileNav({user,currentTab:'explore',onCreate:()=>{}});
  nav.props.children.find(button=>button.key==='home').props.onClick();
  assert.equal(state.destination,'/home');
  nav.props.children.find(button=>button.key==='explore').props.onClick();
  assert.equal(state.destination,'/explore');
 }
});
test('other shared destinations and profile login guards are preserved',()=>{
 state.user={id:1,username:'member'};
 useAppNavigate()('explore');assert.equal(state.destination,'/explore');
 useAppNavigate()('profile');assert.equal(state.destination,'/member');
 state.user=null;useAppNavigate()('profile');assert.equal(state.destination,'/login');
});
