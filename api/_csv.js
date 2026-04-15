let cache = null;
let lastFetch = 0;

const SHEET = "https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0";

function parseCSV(text) {
  const lines = text.trim().split("\n");

  return lines.slice(1).map(line => {
    return line.split(",");
  });
}

export async function getData() {
  const now = Date.now();

  if (cache && now - lastFetch < 300000) {
    return cache;
  }

  const res = await fetch(SHEET);
  const text = await res.text();

  const rows = parseCSV(text);

  cache = rows;
  lastFetch = now;

  return rows;
}
