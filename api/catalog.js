export default async function handler(req, res) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const id = searchParams.get("id")

  const resCsv = await fetch("https://docs.google.com/spreadsheets/d/1w4Aoszpli2vz7FowLuMYgYwgEpn5GUkhUk9WrQK2E0c/export?format=csv&gid=0")
  const text = await resCsv.text()

  const rows = text.split("\n").slice(1).map(r => r.split(","))

  const items = rows.map(r => ({
    id: r[0],
    type: r[1],
    title: r[2],
    category: r[6]
  }))

  const filtered = items.filter(i => i.type === type && i.category === id)

  const unique = {}
  filtered.forEach(i => unique[i.id] = i)

  const metas = Object.values(unique).map(i => ({
    id: i.id,
    type: i.type,
    name: i.title
  }))

  res.json({ metas })
}
