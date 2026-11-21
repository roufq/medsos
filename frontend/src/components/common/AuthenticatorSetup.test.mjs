import {after,test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import jsQR from 'jsqr';

const stateId='\0authenticator-qr:state';
const server=await createServer({
 root:fileURLToPath(new URL('../../../',import.meta.url)),configFile:false,
 server:{middlewareMode:true,hmr:false,watch:null},optimizeDeps:{noDiscovery:true,include:[]},
 plugins:[{name:'authenticator-qr-fixture',enforce:'pre',
  resolveId(source){if(source==='virtual:qr-state')return stateId;if(/context\/LanguageContext$/.test(source))return '\0authenticator-qr:language';},
  load(id){
   if(id===stateId)return "export const state={language:'id'}";
   if(id==='\0authenticator-qr:language')return `import {state} from 'virtual:qr-state';import dictionary from '/src/i18n/translations.json';export const useLanguage=()=>({t:text=>dictionary[text]?.[state.language]||text});`;
  },
 },react()],
});
after(()=>server.close());
const {state}=await server.ssrLoadModule('virtual:qr-state');
const {default:AuthenticatorSetup}=await server.ssrLoadModule('/src/components/common/AuthenticatorSetup.jsx');

// Rasterize the square module runs from the real rendered SVG for an independent decoder.
function decodeRenderedQR(html){
 const svg=html.match(/<svg[\s\S]*?<\/svg>/)?.[0];assert.ok(svg,'QR must be rendered locally as SVG');
 const size=Number(svg.match(/viewBox="0 0 (\d+) /)?.[1]);assert.ok(size>0);
 const black=svg.match(/<path[^>]*fill="#000000"[^>]*>/)?.[0];assert.ok(black);
 const path=black.match(/d="([^"]+)"/)[1];
 const scale=8,width=size*scale,data=new Uint8ClampedArray(width*width*4).fill(255);
 let runs=0;
 for(const match of path.matchAll(/M(\d+)[ ,](\d+)\s*h(\d+)v1H\d+z/g)){
  const [,x,y,length]=match.map(Number);runs++;
  for(let row=y*scale;row<(y+1)*scale;row++)for(let col=x*scale;col<(x+length)*scale;col++){
   const offset=(row*width+col)*4;data[offset]=data[offset+1]=data[offset+2]=0;
  }
 }
 assert.ok(runs>0);
 const result=jsQR(data,width,width,{inversionAttempts:'dontInvert'});
 assert.ok(result,'Rendered QR must be scannable');
 return result.data;
}

for(const language of ['id','en'])test(`2FA QR decodes to the exact provisioning URI in ${language}`,()=>{
 state.language=language;
 const account='qa+auth@example.test',secret='JBSWY3DPEHPK3PXP';
 const uri=`otpauth://totp/${encodeURIComponent('Postter:'+account)}?secret=${secret}&issuer=Postter&digits=6&period=30`;
 const html=renderToStaticMarkup(createElement(AuthenticatorSetup,{setup:{secret,uri},account}));
 assert.equal(decodeRenderedQR(html),uri);
 assert.match(html,/<details>/);
 assert.ok(html.includes(secret));
 assert.doesNotMatch(html,/<(?:img|iframe|script)\b|href="https?:|src="https?:/);
});

test('missing provisioning URI keeps manual enrollment available without inventing a QR',()=>{
 state.language='id';
 const html=renderToStaticMarkup(createElement(AuthenticatorSetup,{setup:{secret:'TESTONLY'},account:'qa@example.test'}));
 assert.doesNotMatch(html,/<svg/);
 assert.match(html,/QR belum tersedia/);
 assert.match(html,/TESTONLY/);
});
