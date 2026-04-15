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
                                    const tmdbId = item.id
                          const detailUrl = `https://api.themoviedb.org/3/${kind}/${tmdbId}?api_key=${TMDB_KEY}&language=pt-BR&append_to_response=credits`
                          const dr = await fetch(detailUrl)
                          const detail = await dr.json()
                          const cast = detail.credits?.cast?.slice(0, 5).map(c => c.name) || []
                                    const director = detail.credits?.crew?.find(c => c.job === 'Director')?.name
                          return {
                                      poster: item.poster_path ? TMDB_IMG + item.poster_path : undefined,
                                      background: item.backdrop_path ? 'https://image.tmdb.org/t/p/w1280' + item.backdrop_path : undefined,
                                      description: detail.overview || item.overview || undefined,
                                      cast,
                                      director
                          }
                } catch { return {} }
}

export default async function handler(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*')

  const { type, id } = req.query

  const csvRes = await fetch('https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0')
        const text = await csvRes.text()
        const rows = parseCSV(text)

  const items = rows.filter(r => r[0] === id)
        if (!items.length) return res.json({ meta: {} })

  const first = items[0]
        const poster = first[10] || undefined
        const description = first[11] || undefined

  let tmdb = {}
          if (TMDB_KEY) {
                    tmdb = await getTmdb(first[2], first[3], type)
          }

  const meta = {
            id,
            type,
            name: first[2],
            year: first[3] ? Number(first[3]) : undefined,
            genres: first[6] ? [first[6]] : undefined,
            poster: poster || tmdb.poster,
            background: tmdb.background,
            description: description || tmdb.description,
            cast: tmdb.cast,
            director: tmdb.director
  }

  if (type === 'series') {
            meta.videos = items.map(r => ({
                        id: `${r[0]}:${r[4]}:${r[5]}`,
                        title: `T${r[4]}E${r[5]}`,
                        season: Number(r[4]),
                        episode: Number(r[5])
            }))
  }

  res.json({ meta })
}
