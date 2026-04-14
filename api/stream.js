import { getRows } from './_csv.js';
function setCors(r) { r.setHeader('Access-Control-Allow-Origin','*'); r.setHeader('Content-Type','application/json'); }
function ptScore(l='') { l=l.toLowerCase(); if(l==='pt-br'||l==='pt_br')return 2; if(l.includes('pt'))return 1; return 0; }
export default async function handler(req, res) {
  setCors(res);
  const type = req.query.type;
  const rawId = (req.query.id||'').replace('.json','');
  try {
    const rows = await getRows();
    let cands = [];
    if(type==='movie') { const id=rawId.replace(/^csv:/,''); cands=rows.filter(r=>r.id===id&&r.type==='movie'); }
    if(type==='series') { const p=rawId.split(':'); const ep=p[p.length-1]; const se=p[p.length-2]; const id=p.slice(1,p.length-2).join(':'); cands=rows.filter(r=>r.id===id&&r.type==='series'&&String(r.season)===se&&String(r.episode)===ep); }
    cands.sort((a,b)=>ptScore(b.lang)-ptScore(a.lang));
    const streams = cands.filter(r=>r.infoHash).map(r=>({ name:(r.quality||'SD')+' | '+(r.lang||'?'), title:r.title+'\n'+r.quality+' \u2022 '+r.lang, infoHash:r.infoHash.toLowerCase().trim(), behaviorHints:{bingeGroup:'csv-'+r.id} }));
    res.end(JSON.stringify({streams}));
  } catch(e) { res.status(500).end(JSON.stringify({error:e.message})); }
}