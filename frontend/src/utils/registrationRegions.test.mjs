import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {REGISTRATION_COUNTRIES,phoneCountryForCode,loadRegistrationRegions} from './registrationRegions.js';
const asset=async iso=>JSON.parse(await readFile(new URL(`../../public/regions/${iso}.json`,import.meta.url),'utf8'));

test('register offers six countries with the correct calling and ISO codes',()=>{
 assert.equal(REGISTRATION_COUNTRIES.length,6);
 for(const [code,iso] of [['+62','ID'],['+60','MY'],['+65','SG'],['+1','US'],['+86','CN'],['+91','IN']])assert.equal(phoneCountryForCode(code),iso);
 assert.equal(phoneCountryForCode('+999'),'');
});
for(const [country,iso,count,region,city] of [
 ['United States','US',51,'California','Los Angeles'],
 ['China','CN',31,'Guangdong','Guangzhou'],
 ['India','IN',36,'Maharashtra','Mumbai'],
])test(`${country} region asset contains linked, unique place names`,async()=>{
 const data=await asset(iso);
 let requested;
 const signal=new AbortController().signal;
 const result=await loadRegistrationRegions(country,{baseURL:'/app/',signal,fetcher:async(url,options)=>{requested=url;assert.equal(options.signal,signal);return {ok:true,json:async()=>data};}});
 assert.equal(requested,`/app/regions/${iso}.json`);
 assert.equal(Object.keys(result).length,count);
 assert.ok(result[region].includes(city));
 for(const cities of Object.values(result)) {assert.ok(cities.length>0);assert.equal(new Set(cities).size,cities.length);assert.ok(cities.every(city=>typeof city==='string'&&city.trim()));}
});
test('municipalities can be selected as cities and Indian territories are included',async()=>{
 const china=await asset('CN');for(const city of ['Beijing','Shanghai','Tianjin','Chongqing'])assert.ok(china[city].includes(city));
 const india=await asset('IN');assert.ok(india.Delhi.includes('New Delhi'));assert.ok(india.Ladakh.length);assert.ok(india.Karnataka.includes('Bengaluru'));
});
test('existing Malaysia and Singapore selections need no network',async()=>{
 const fetcher=()=>{throw new Error('Network must not be used');};
 assert.ok((await loadRegistrationRegions('Malaysia',{fetcher})).Selangor.includes('Shah Alam'));
 assert.ok((await loadRegistrationRegions('Singapore',{fetcher})).Singapore.includes('Central'));
});
test('failed or invalid region assets raise an error for the retry UI',async()=>{
 await assert.rejects(loadRegistrationRegions('China',{fetcher:async()=>({ok:false})}),/unavailable/);
 for(const data of [null,[],{}, {State:[]},{State:[null]}])await assert.rejects(loadRegistrationRegions('India',{fetcher:async()=>({ok:true,json:async()=>data})}),/Invalid/);
 await assert.rejects(loadRegistrationRegions('Unknown'),/Unsupported/);
});
