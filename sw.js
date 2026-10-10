const SHELL='tote-shell-v1',RT='tote-rt-v1';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
const RT_HOSTS=['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==RT).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(SHELL).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
    return;
  }
  if(RT_HOSTS.includes(u.hostname)){
    e.respondWith(caches.open(RT).then(async c=>{
      const m=await c.match(r);
      const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>m);
      return m||net;
    }));
  }
});
