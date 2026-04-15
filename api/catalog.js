export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')

  const parts = req.url.split('?')[0].split('/')
    const type = parts[parts.length - 2]

  const csvRes = await fetch('https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0')
    const text = await csvRes.text()

  const rows = text.split('\n').slice(1).map(r => {
        const cols = []
              let cur = ''
        let inQ = false
        for (const ch of r) {
                if (ch === '"') { inQ = !inQ }
                else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
                else { cur += ch }
        }
        cols.push(cur.trim())
        return cols
  }).filter(r => r.length > 1)

  const seen = new Set()
    const metas = rows
      .filter(r => r[1] === type && !seen.has(r[0]) && seen.add(r[0]))
      .map(r => ({
              id: r[0],
              type: r[1],
              name: r[2],
              year: r[3] ? Number(r[3]) : undefined,
              genres: r[6] ? [r[6]] : undefined
      }))

  res.json({ metas })
}
