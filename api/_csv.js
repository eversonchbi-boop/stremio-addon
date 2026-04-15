export async function getData() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0");
  const text = await res.text();

  const rows = text.split("\n").slice(1).map(r => r.split(","));

  return rows;
}
