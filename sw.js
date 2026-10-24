const C='geolab-v3',T='geolab-tiles-v1',MAX_TILES=900;
const F=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
const TILE_HOST=/^(tile\.openstreetmap\.org|[abc]\.tile\.openstreetmap\.fr|[abcd]\.basemaps\.cartocdn\.com|server\.arcgisonline\.com|[abc]\.tile\.opentopomap\.org)$/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
async function trim(c){const k=await c.keys();if(k.length>MAX_TILES)await Promise.all(k.slice(0,k.length-MAX_TILES).map(r=>c.delete(r)))}
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);
 if(TILE_HOST.test(u.hostname)){
  e.respondWith(caches.open(T).then(async c=>{const hit=await c.match(r);if(hit)return hit;try{const res=await fetch(r);if(res&&(res.ok||res.type==='opaque')){c.put(r,res.clone()).then(()=>trim(c))}return res}catch(err){return Response.error()}}));return}
 if(u.origin!==location.origin)return;
 /* réseau d'abord (les mises à jour arrivent), cache en secours hors ligne */
 e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(h=>h||caches.match('./index.html'))))
});
