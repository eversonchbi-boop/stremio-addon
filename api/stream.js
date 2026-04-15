export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')

  const pathParts = req.url.split('?')[0].split('/')
    const rawId = pathParts[pathParts.length - 1]
    const type = pathParts[pathParts.length - 2]

  // For series, id format is "showId:season:episode"
  const idParts = rawId.split(':')
    const showId = idParts[0]

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

  let items = rows.filter(r => r[0] === showId)

  if (type === 'series' && idParts.length === 3) {
        const season = idParts[1]
        const episode = idParts[2]
        items = items.filter(r => r[4] === season && r[5] === episode)
  }

  const streams = items
      .filter(r => r[7] && r[7].length > 0)
      .map(r => ({
              name: 'Torrent',
              title: r[2] || showId,
              infoHash: r[7].toLowerCase()
      }))

  res.json({ streams })
}
