function parseCSV(text) {
      return text.split('\n').slice(1).map(r => {
              const cols = []
                      let cur = '', inQ = false
              for (const ch of r) {
                        if (ch === '"') { inQ = !inQ }
                        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = '' }
                        else { cur += ch }
              }
              cols.push(cur.trim())
              return cols
      }).filter(r => r.length > 1)
}

export default async function handler(req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*')

  const { type, id } = req.query

  const csvRes = await fetch('https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0')
      const text = await csvRes.text()
      const rows = parseCSV(text)

  const items = rows.filter(r => r[0] === id)

  if (!items.length) return res.json({ meta: {} })

  if (type === 'series') {
          const videos = items.map(r => ({
                    id: `${r[0]}:${r[4]}:${r[5]}`,
                    title: `S${r[4]}E${r[5]}`,
                    season: Number(r[4]),
                    episode: Number(r[5])
          }))
          return res.json({
                    meta: { id, type, name: items[0][2], videos }
          })
  }

  res.json({
          meta: {
                    id,
                    type,
                    name: items[0][2],
                    year: items[0][3] ? Number(items[0][3]) : undefined
          }
  })
}
