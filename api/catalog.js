const TMDB_KEY = process.env.TMDB_KEY || ''
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500'

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

async function getTmdb(title, year, type) {
        if (!TMDB_KEY) return {}
                try {
                          const kind = type === 'series' ? 'tv' : 'movie'
                          const q = encodeURIComponent(title)
                          const url = `https://api.themoviedb.org/3/search/${kind}?api_key=${TMDB_KEY}&query=${q}&year=${year || ''}&language=pt-BR`
                          const r = await fetch(url)
                          const data = await r.json()
                          const item = data.results?.[0]
                          if (!item) return {}
                                    return {
                                                poster: item.poster_path ? TMDB_IMG + item.poster_path : undefined,
                                                background: item.backdrop_path ? 'https://image.tmdb.org/t/p/w1280' + item.backdrop_path : undefined,
                                                description: item.overview || undefined
                                    }
                } catch { return {} }
}

export default async function handler(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*')

  const { type } = req.query

  const csvRes = await fetch('https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0')
        const text = await csvRes.text()
        const rows = parseCSV(text)

  const seen = new Set()
        const unique = rows.filter(r => r[1] === type && !seen.has(r[0]) && seen.add(r[0]))

  const metas = await Promise.all(unique.map(async r => {
            const poster = r[10] || undefined
            const description = r[11] || undefined
            let tmdb = {}
                      if (!poster && TMDB_KEY) {
                                  tmdb = await getTmdb(r[2], r[3], type)
                      }
            return {
                        id: r[0],
                        type: r[1],
                        name: r[2],
                        year: r[3] ? Number(r[3]) : undefined,
                        genres: r[6] ? [r[6]] : undefined,
                        poster: poster || tmdb.poster,
                        background: tmdb.background,
                        description: description || tmdb.description
            }
  }))

  res.json({ metas })
}
