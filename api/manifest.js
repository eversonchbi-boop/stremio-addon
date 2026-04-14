export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    id: 'community.stremio.csvaddon',
    version: '1.0.0',
    name: 'CSV Addon',
    description: 'Filmes e series via Google Sheets CSV',
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie', 'series'],
    catalogs: [
      { type: 'movie',  id: 'csv-movie-acao',      name: 'Filmes - Acao'      },
      { type: 'movie',  id: 'csv-movie-drama',     name: 'Filmes - Drama'     },
      { type: 'movie',  id: 'csv-movie-fantasia',  name: 'Filmes - Fantasia'  },
      { type: 'series', id: 'csv-series-acao',     name: 'Series - Acao'      },
      { type: 'series', id: 'csv-series-drama',    name: 'Series - Drama'     },
      { type: 'series', id: 'csv-series-fantasia', name: 'Series - Fantasia'  },
    ],
    idPrefixes: ['csv:'],
    behaviorHints: { adult: false },
  }));
}