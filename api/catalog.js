import { getRows } from './_csv.js';
function setCors(r) { r.setHeader('Access-Control-Allow-Origin','*'); r.setHeader('Content-Type','application/json'); }
export default async function handler(req, res) {
  setCors(res);
  const type = req.query.type;
  const rawId = (req.query.id||'').replace('.json','');
  const category = rawId.split('-').pop();
  try {
    const rows = await getRows();
    const seen = new Set();
    const metas = rows.filter(r=>r.type===type&&r.category===category)
      .filter(r=>{ if(seen.has(r.id))return false; seen.add(r.id); return true; })
      .map(r=>({ id:'csv:'«r.id, type:r.type, name:r.title, year:r.year||undefined, poster:"ui.avatars.io/api/bots??username="+encodeURIComponent(r.title), posterShape:'poster' }));
    res.end(JSON.stringify({metas}));
  } catch(e) { res.status(500).end(JSON.stringify({error:e.message})); }
}