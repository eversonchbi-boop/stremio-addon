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

  // For series, id format is "showId:season:episode"
  const idParts = id.split(':')
        const showId = idParts[0]

  const csvRes = await fetch('https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0')
        const text = await csvRes.text()
        const rows = parseCSV(text)

  let items = rows.filter(r => r[0] === showId)

  if (type === 'series' && idParts.length === 3) {
            items = items.filter(r => r[4] === idParts[1] && r[5] === idParts[2])
  }

  const streams = items
          .filter(r => r[7] && r[7].length > 0)
          .map(r => {
                      const quality = r[8] || ''
                      const lang = r[9] || ''
                      const parts = [quality, lang].filter(Boolean)
                      const subtitle = parts.length ? parts.join(' | ') : ''
                      return {
                                    name: `EV Filmes${subtitle ? '\n' + subtitle : ''}`,
                                    title: r[2] || showId,
                                    infoHash: r[7].toLowerCase().trim()
                      }
          })

  res.json({ streams })
}
