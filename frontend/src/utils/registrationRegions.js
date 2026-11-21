export const REGISTRATION_COUNTRIES = [
  {name:'Indonesia', label:'Indonesia', iso:'ID', dial:'+62'},
  {name:'Malaysia', label:'Malaysia', iso:'MY', dial:'+60'},
  {name:'Singapore', label:'Singapura', iso:'SG', dial:'+65'},
  {name:'United States', label:'Amerika Serikat', iso:'US', dial:'+1'},
  {name:'China', label:'Cina', iso:'CN', dial:'+86'},
  {name:'India', label:'India', iso:'IN', dial:'+91'},
];

export function phoneCountryForCode(code) {
  return REGISTRATION_COUNTRIES.find(country=>country.dial===code)?.iso || '';
}

const localRegions = {
  Malaysia: {'Kuala Lumpur':['Kuala Lumpur'], Selangor:['Petaling Jaya','Shah Alam','Klang','Subang Jaya']},
  Singapore: {Singapore:['Central','East','North','North-East','West']},
};

export async function loadRegistrationRegions(country,{signal,baseURL='/',fetcher=fetch}={}) {
  if(localRegions[country]) return localRegions[country];
  const iso=REGISTRATION_COUNTRIES.find(item=>item.name===country)?.iso;
  if(!['US','CN','IN'].includes(iso)) throw new Error('Unsupported region country');
  const response=await fetcher(`${baseURL}regions/${iso}.json`,{signal});
  if(!response.ok) throw new Error('Region data unavailable');
  const data=await response.json();
  if(!data || typeof data!=='object' || Array.isArray(data) || !Object.keys(data).length ||
    Object.entries(data).some(([region,cities])=>!region || !Array.isArray(cities) || !cities.length || cities.some(city=>typeof city!=='string' || !city.trim()))) {
    throw new Error('Invalid region data');
  }
  return data;
}
