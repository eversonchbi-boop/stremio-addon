import fetch from 'node-fetch';

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0';

let _cache = null;
let _ts = 0;
const TTL = 5 * 60 * 1000;

function parseCSV(text) {
  const [headerLine, ...lines] = text.trim().split('\n');
  const headers = headerLine.split(',').map(h => h.replace(/\r/g, '').trim());
  return lines.filter(Boolean).map(line => {
    const cols = [];
    let cur = '', inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cols.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cols.push(cur);
    return Object.fromEntries(headers.map((h, i) => [h, (cols[i] ?? '').replace(/\r/g, '').trim()]));
  });
}

export async function getRows() {
  if (_cache && Date.now() - _ts < TTL) return _cache;
  const res = await fetch(CSV_URL);
  if (!res.ok) throw new Error('CSV fetch failed: ' + res.status);
  const text = await res.text();
  _cache = parseCSV(text);
  _ts = Date.now();
  return _cache;
}