export default function handler(req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.json({
              id: 'community.evfilmes',
              version: '1.0.0',
              name: 'EV Filmes',
              description: 'Filmes e series via torrent',
              resources: ['catalog', 'meta', 'stream'],
              types: ['movie', 'series'],
              catalogs: [
                  { type: 'movie', id: 'ev-movies', name: 'EV Filmes' },
                  { type: 'series', id: 'ev-series', name: 'EV Series' }
                      ]
      })
}
