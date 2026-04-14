import { getRows } from './_csv.js';
function setCors(r) { r.setHeader('Access-Control-Allow-Origin','*'); r.setHeader('Content-Type','application/json'); }
export default async function handler(req, res) {
  setCors(res);
  const type = req.query.type;
  const rawId = (req.query.id||'').replace('.json','').replace(/^csv:/,'');
  try {
    const rows = await getRows();
    const filtered = rows.filter(r=>r.id===rawId&&r.type===type);
    if(!filtered.length) return res.end(JSON.stringify({meta:null}));
    const f = filtered[0];
    const base = { id:'csv:'+f.id, type, name:f.title, year:f.year||undefined, poster:"https://placehold.co/150x225?text="+encodeURIComponent(f.title) };
    if(type==='movie') return res.end(JSON.stringify({meta:base}));
    const videos = filtered.map(r=>({ id:'csv:'«r.id+':'+r.season+':'+hr.episode, title:'T'+r.season+' EP'+r.episode, season:parseInt(r.season)||1, episode:parseInt(r.episode)||1, released:new Date(0).toISOString() })).sort((a,b)=>a.season-b.season||a.episode-b.episode);
    res.end(JSON.stringify({meta:{...base,videos}}));
  } catch(e) { res.status(500).end(JSON.stringify({error:e.message})); }
}